import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import {
  LIBRARY_NODES,
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  LibraryNode,
  NodeCategory,
  NodeExample,
} from "@/data/library";

const NODE_TYPE_COLORS: Record<string, string> = {
  event: "#B71C1C",
  flow: "#4A148C",
  function: "#1565C0",
  value: "#1B5E20",
  variable: "#E65100",
};

function detectNodeType(label: string): string {
  const lower = label.toLowerCase();
  if (/^event\b|begin\s*play|tick|on hit|on death|overlap|input\s*action|timer\s*event|regen/i.test(label)) return "event";
  if (/cast\s*to|branch|sequence|for\s*loop|for\s*each|switch\s*on/i.test(label)) return "flow";
  if (/get\s+(health|walk\s*speed|mesh|player|actor\s+location|control\s*rotation|right\s*vector|camera|distance)/i.test(label)) return "value";
  if (/set\s+\w|float\s*(<=|<|>=|>)|random|lerp|vector\s*\*/i.test(label)) return "value";
  if (/^\s*(health|maxhealth|speed|is\s*alive|walkspeed)\s*=/i.test(label)) return "variable";
  return "function";
}

function parseCodeToNodes(code: string): Array<{ label: string; sub?: string; type: string }> {
  const lines = code.split("\n");
  const nodes: Array<{ label: string; sub?: string; type: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const arrowIdx = trimmed.indexOf("→");
    let content = arrowIdx >= 0 ? trimmed.slice(arrowIdx + 1).trim() : trimmed;
    if (!content) continue;

    const parenIdx = content.indexOf("(");
    const colonIdx = content.indexOf(":");
    let label = content;
    let sub: string | undefined;

    if (parenIdx > 0 && parenIdx < 35) {
      label = content.slice(0, parenIdx).trim();
      sub = content.slice(parenIdx, Math.min(content.length, parenIdx + 30)).trim();
    } else if (colonIdx > 0 && colonIdx < 25 && arrowIdx < 0) {
      label = content.slice(0, colonIdx).trim();
    }

    const indentLevel = line.search(/\S/);
    if (arrowIdx < 0 && nodes.length > 0 && indentLevel > 0) {
      const last = nodes[nodes.length - 1];
      if (!last.sub && content.length < 40) {
        last.sub = (last.sub ? last.sub + " · " : "") + content.slice(0, 35);
        continue;
      }
    }

    if (label.length < 2) continue;

    nodes.push({
      label: label.slice(0, 22),
      sub: sub ? sub.slice(0, 26) : undefined,
      type: detectNodeType(label),
    });
  }

  return nodes.slice(0, 6);
}

function BlueprintFlowPreview({ code, color, C }: { code: string; color: string; C: typeof Colors.dark }) {
  const nodes = useMemo(() => parseCodeToNodes(code), [code]);

  if (nodes.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 2 }}>
        {nodes.map((node, idx) => {
          const nc = NODE_TYPE_COLORS[node.type] || "#1565C0";
          return (
            <React.Fragment key={idx}>
              <View style={{
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: nc + "88",
                overflow: "hidden",
                minWidth: 80,
                maxWidth: 120,
              }}>
                <View style={{ backgroundColor: nc, paddingHorizontal: 7, paddingVertical: 5 }}>
                  <Text
                    style={{ fontSize: 9, color: "#FFF", fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}
                    numberOfLines={1}
                  >
                    {node.label}
                  </Text>
                </View>
                {node.sub && (
                  <View style={{ backgroundColor: "#0D1420", paddingHorizontal: 7, paddingVertical: 4 }}>
                    <Text
                      style={{ fontSize: 8, color: "#8B9BB4", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}
                      numberOfLines={1}
                    >
                      {node.sub}
                    </Text>
                  </View>
                )}
              </View>
              {idx < nodes.length - 1 && (
                <View style={{ width: 22, alignItems: "center" }}>
                  <Feather name="arrow-right" size={13} color={color + "99"} />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
}

function ExampleCard({ example, color, C, styles }: { example: NodeExample; color: string; C: typeof Colors.dark; styles: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.exampleCard, { borderColor: color + "33" }]}
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.85}
    >
      <View style={styles.exampleHeader}>
        <View style={[styles.exampleIconBox, { backgroundColor: color + "22" }]}>
          <Feather name="git-merge" size={13} color={color} />
        </View>
        <Text style={styles.exampleTitle}>{example.title}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={C.textSecondary} />
      </View>
      {expanded && (
        <>
          <Text style={styles.exampleDesc}>{example.description}</Text>
          <BlueprintFlowPreview code={example.code} color={color} C={C} />
        </>
      )}
    </TouchableOpacity>
  );
}

function NodeDetailModal({
  node,
  visible,
  onClose,
  C,
  styles,
}: {
  node: LibraryNode | null;
  visible: boolean;
  onClose: () => void;
  C: typeof Colors.dark;
  styles: any;
}) {
  if (!node) return null;
  const color = node.color;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.modalHeader, { borderBottomColor: C.cardBorder }]}>
          <View style={[styles.modalIcon, { backgroundColor: color + "22", borderColor: color + "44" }]}>
            <Feather name={node.icon as any} size={22} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitle}>{node.name}</Text>
            <Text style={[styles.modalCategory, { color }]}>{node.category}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={22} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
          <View style={styles.enNameBox}>
            <Text style={styles.enNameLabel}>Название в редакторе</Text>
            <Text style={[styles.enName, { color }]}>{node.nameEn}</Text>
          </View>

          <Text style={styles.sectionLabel}>Описание</Text>
          <Text style={styles.descText}>{node.description}</Text>

          {(node.inputs.length > 0 || node.outputs.length > 0) && (
            <View style={styles.ioRow}>
              {node.inputs.length > 0 && (
                <View style={styles.ioBox}>
                  <Text style={styles.ioLabel}>Входы</Text>
                  {node.inputs.map((inp, i) => (
                    <View key={i} style={styles.ioItem}>
                      <View style={[styles.ioDot, { backgroundColor: "#39D353" }]} />
                      <Text style={styles.ioText}>{inp}</Text>
                    </View>
                  ))}
                </View>
              )}
              {node.outputs.length > 0 && (
                <View style={styles.ioBox}>
                  <Text style={styles.ioLabel}>Выходы</Text>
                  {node.outputs.map((out, i) => (
                    <View key={i} style={styles.ioItem}>
                      <View style={[styles.ioDot, { backgroundColor: color }]} />
                      <Text style={styles.ioText}>{out}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {node.tips.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Советы</Text>
              <View style={styles.tipsBox}>
                {node.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Feather name="check-circle" size={13} color={C.warning} style={{ marginTop: 2 }} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {node.examples.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Примеры механик</Text>
              {node.examples.map((ex, i) => (
                <ExampleCard key={i} example={ex} color={color} C={C} styles={styles} />
              ))}
            </>
          )}

          {node.related.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Связанные ноды</Text>
              <View style={styles.relatedRow}>
                {node.related.map((id) => {
                  const rel = LIBRARY_NODES.find((n) => n.id === id);
                  if (!rel) return null;
                  return (
                    <View key={id} style={[styles.relatedChip, { borderColor: rel.color + "55" }]}>
                      <Feather name={rel.icon as any} size={12} color={rel.color} />
                      <Text style={[styles.relatedText, { color: rel.color }]}>{rel.name}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function NodeCard({ node, onPress, styles, C }: { node: LibraryNode; onPress: () => void; styles: any; C: typeof Colors.dark }) {
  return (
    <TouchableOpacity style={styles.nodeCard} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.nodeIconBox, { backgroundColor: node.color + "1A", borderColor: node.color + "33" }]}>
        <Feather name={node.icon as any} size={20} color={node.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.nodeName}>{node.name}</Text>
        <Text style={styles.nodeShort} numberOfLines={2}>{node.shortDesc}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={C.textTertiary} />
    </TouchableOpacity>
  );
}

function CategoryChip({
  cat,
  selected,
  onPress,
  C,
  styles,
}: {
  cat: NodeCategory | "Все";
  selected: boolean;
  onPress: () => void;
  C: typeof Colors.dark;
  styles: any;
}) {
  const color = cat === "Все" ? C.tint : CATEGORY_COLORS[cat as NodeCategory];
  const icon = cat === "Все" ? "grid" : CATEGORY_ICONS[cat as NodeCategory];
  return (
    <TouchableOpacity
      style={[
        styles.catChip,
        selected
          ? { backgroundColor: color + "22", borderColor: color }
          : { backgroundColor: "transparent", borderColor: C.cardBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name={icon as any} size={13} color={selected ? color : C.textSecondary} />
      <Text style={[styles.catChipText, { color: selected ? color : C.textSecondary }]}>{cat}</Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<NodeCategory | "Все">("Все");
  const [selectedNode, setSelectedNode] = useState<LibraryNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => {
    return LIBRARY_NODES.filter((n) => {
      const matchCat = selectedCat === "Все" || n.category === selectedCat;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        n.name.toLowerCase().includes(q) ||
        n.nameEn.toLowerCase().includes(q) ||
        n.shortDesc.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, selectedCat]);

  const openNode = (node: LibraryNode) => {
    setSelectedNode(node);
    setModalVisible(true);
  };

  const tabBarHeight = isWeb ? 84 : insets.bottom + 50;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Библиотека</Text>
            <Text style={styles.headerSub}>{LIBRARY_NODES.length} нод и концепций</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length}</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={C.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск нод..."
            placeholderTextColor={C.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x-circle" size={16} color={C.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catsScroll}
          contentContainerStyle={styles.catsContent}
        >
          <CategoryChip cat="Все" selected={selectedCat === "Все"} onPress={() => setSelectedCat("Все")} C={C} styles={styles} />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              cat={cat}
              selected={selectedCat === cat}
              onPress={() => setSelectedCat(cat)}
              C={C}
              styles={styles}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NodeCard node={item} onPress={() => openNode(item)} styles={styles} C={C} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 16 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={C.textTertiary} />
            <Text style={styles.emptyText}>Ничего не найдено</Text>
            <Text style={styles.emptySubtext}>Попробуй другой запрос или категорию</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <NodeDetailModal
        node={selectedNode}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        C={C}
        styles={styles}
      />
    </View>
  );
}

function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    header: {
      backgroundColor: C.background,
      paddingHorizontal: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: C.cardBorder,
      gap: 10,
    },
    headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 26, fontWeight: "700", color: C.text, letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: C.textSecondary, marginTop: 1 },
    countBadge: {
      backgroundColor: C.backgroundSecondary,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    countText: { fontSize: 14, fontWeight: "700", color: C.tint },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.backgroundSecondary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 10,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    searchInput: { flex: 1, fontSize: 15, color: C.text, padding: 0 },
    catsScroll: { flexGrow: 0 },
    catsContent: { gap: 8, paddingBottom: 2 },
    catChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
    },
    catChipText: { fontSize: 12, fontWeight: "600" },
    listContent: { paddingHorizontal: 16, paddingTop: 12 },
    separator: { height: 1, backgroundColor: C.cardBorder, marginHorizontal: 4 },
    nodeCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    nodeIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    nodeName: { fontSize: 15, fontWeight: "600", color: C.text, marginBottom: 3 },
    nodeShort: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },
    emptyState: { alignItems: "center", paddingTop: 80, gap: 10 },
    emptyText: { fontSize: 17, fontWeight: "600", color: C.textSecondary },
    emptySubtext: { fontSize: 13, color: C.textTertiary },
    modalRoot: { flex: 1, backgroundColor: C.background },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
    },
    modalIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: "700", color: C.text, letterSpacing: -0.3 },
    modalCategory: { fontSize: 12, fontWeight: "600", marginTop: 2 },
    closeBtn: { padding: 4 },
    modalScroll: { flex: 1 },
    modalContent: { paddingHorizontal: 20, paddingTop: 20, gap: 6 },
    enNameBox: {
      backgroundColor: C.backgroundSecondary,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: C.cardBorder,
      marginBottom: 8,
      gap: 4,
    },
    enNameLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: C.textTertiary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    enName: { fontSize: 15, fontWeight: "600", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: C.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 14,
      marginBottom: 6,
    },
    descText: { fontSize: 14, color: C.text, lineHeight: 22 },
    ioRow: { flexDirection: "row", gap: 10, marginTop: 14 },
    ioBox: {
      flex: 1,
      backgroundColor: C.backgroundSecondary,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: C.cardBorder,
      gap: 6,
    },
    ioLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: C.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    ioItem: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
    ioDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
    ioText: { flex: 1, fontSize: 12, color: C.text, lineHeight: 18 },
    tipsBox: {
      backgroundColor: "rgba(255,184,0,0.06)",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: "rgba(255,184,0,0.2)",
      gap: 8,
    },
    tipRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    tipText: { flex: 1, fontSize: 13, color: C.text, lineHeight: 19 },
    exampleCard: {
      backgroundColor: C.backgroundSecondary,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      marginBottom: 8,
      gap: 10,
    },
    exampleHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
    exampleIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    exampleTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text },
    exampleDesc: { fontSize: 13, color: C.textSecondary, lineHeight: 18 },
    codeBox: { backgroundColor: C.backgroundTertiary, borderRadius: 8, padding: 12, borderWidth: 1 },
    codeText: { fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", lineHeight: 19 },
    relatedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    relatedChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      backgroundColor: C.backgroundSecondary,
    },
    relatedText: { fontSize: 11, fontWeight: "600" },
  });
}
