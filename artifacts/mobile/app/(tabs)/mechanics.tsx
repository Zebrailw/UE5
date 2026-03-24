import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import {
  MECHANIC_CATEGORIES,
  MechanicCategory,
  Mechanic,
  searchMechanics,
  getAllMechanics,
} from "@/data/mechanics";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#00D4FF",
  basic: "#39D353",
  intermediate: "#FFB800",
  advanced: "#FF6B35",
  expert: "#FF4757",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Начинающий",
  basic: "Базовый",
  intermediate: "Средний",
  advanced: "Продвинутый",
  expert: "Эксперт",
};

function NodePill({ label, type }: { label: string; type: string }) {
  const nodeColors: Record<string, string> = {
    event: "#B71C1C",
    function: "#1565C0",
    flow: "#4A148C",
    value: "#1B5E20",
    variable: "#E65100",
  };
  const color = nodeColors[type] || "#333";
  return (
    <View style={[nodePillStyle.pill, { backgroundColor: color + "cc", borderColor: color }]}>
      <Text style={nodePillStyle.text} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const nodePillStyle = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, borderWidth: 1, maxWidth: 130 },
  text: { fontSize: 10, color: "#FFF", fontWeight: "600", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
});

function MechanicCard({ mechanic, onPress, index, C, styles }: {
  mechanic: Mechanic;
  onPress: () => void;
  index: number;
  C: typeof Colors.dark;
  styles: any;
}) {
  const diffColor = DIFFICULTY_COLORS[mechanic.difficulty] || C.tint;
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <Pressable
        style={({ pressed }) => [styles.mechanicCard, pressed && { opacity: 0.85 }]}
        onPress={onPress}
      >
        <LinearGradient
          colors={["#141C28", "#0F1620"]}
          style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
        />
        <View style={styles.mechanicCardHeader}>
          <View style={styles.mechanicMeta}>
            <View style={[styles.diffBadge, { borderColor: diffColor + "60", backgroundColor: diffColor + "18" }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>{DIFFICULTY_LABELS[mechanic.difficulty]}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{mechanic.category}</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={16} color={C.textTertiary} />
        </View>
        <Text style={styles.mechanicTitle}>{mechanic.title}</Text>
        <Text style={styles.mechanicDesc} numberOfLines={2}>{mechanic.description}</Text>
        <View style={styles.nodesRow}>
          {mechanic.nodes.slice(0, 3).map((n) => (
            <NodePill key={n.id} label={n.label} type={n.type} />
          ))}
          {mechanic.nodes.length > 3 && (
            <View style={styles.moreNodes}>
              <Text style={styles.moreNodesText}>+{mechanic.nodes.length - 3}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CategoryChip({
  category,
  selected,
  onPress,
  C,
  styles,
}: {
  category: MechanicCategory | null;
  selected: boolean;
  onPress: () => void;
  C: typeof Colors.dark;
  styles: any;
}) {
  const color = category?.color ?? C.tint;
  return (
    <Pressable
      style={[
        styles.chip,
        selected && { backgroundColor: color + "25", borderColor: color + "80" },
        !selected && { borderColor: C.cardBorder },
      ]}
      onPress={onPress}
    >
      {category && <Feather name={category.icon as any} size={13} color={selected ? color : C.textSecondary} />}
      <Text style={[styles.chipText, selected && { color }]}>
        {category ? category.title : "Все"}
      </Text>
    </Pressable>
  );
}

export default function MechanicsScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredMechanics = useMemo(() => {
    if (search.trim().length > 1) return searchMechanics(search);
    if (!selectedCategory) return getAllMechanics();
    const cat = MECHANIC_CATEGORIES.find((c) => c.id === selectedCategory);
    return cat?.mechanics ?? [];
  }, [search, selectedCategory]);

  const expandedMechanic = useMemo(
    () => (expanded ? getAllMechanics().find((m) => m.id === expanded) : null),
    [expanded]
  );

  const totalCount = getAllMechanics().length;
  const tabBarHeight = isWeb ? 84 : insets.bottom + 50;

  if (expandedMechanic) {
    const diffColor = DIFFICULTY_COLORS[expandedMechanic.difficulty] || C.tint;
    const cat = MECHANIC_CATEGORIES.find((c) =>
      c.mechanics.some((m) => m.id === expandedMechanic.id)
    );
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: isWeb ? 67 : insets.top + 12,
            paddingBottom: tabBarHeight + 20,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(200)}>
            <Pressable onPress={() => setExpanded(null)} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={C.tint} />
              <Text style={styles.backText}>Назад</Text>
            </Pressable>

            <LinearGradient
              colors={[(cat?.color ?? C.tint) + "22", "transparent"]}
              style={styles.detailHero}
            >
              <View style={styles.detailMeta}>
                <View style={[styles.diffBadge, { borderColor: diffColor, backgroundColor: diffColor + "22" }]}>
                  <Text style={[styles.diffText, { color: diffColor }]}>{DIFFICULTY_LABELS[expandedMechanic.difficulty]}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{expandedMechanic.category}</Text>
                </View>
              </View>
              <Text style={styles.detailTitle}>{expandedMechanic.title}</Text>
              <Text style={styles.detailDesc}>{expandedMechanic.description}</Text>
            </LinearGradient>

            <Text style={styles.sectionLabel}>ГРАФ БЛЮПРИНТА</Text>
            <View style={styles.graphCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.graphRow}>
                  {expandedMechanic.nodes.map((node, idx) => {
                    const nodeColors: Record<string, string> = {
                      event: "#B71C1C",
                      function: "#1565C0",
                      flow: "#4A148C",
                      value: "#1B5E20",
                      variable: "#E65100",
                    };
                    const nc = nodeColors[node.type] || "#333";
                    return (
                      <React.Fragment key={node.id}>
                        <View style={[styles.nodeBox, { borderColor: nc + "99" }]}>
                          <View style={[styles.nodeHeader, { backgroundColor: nc }]}>
                            <Text style={styles.nodeHeaderText} numberOfLines={1}>{node.label}</Text>
                          </View>
                          <View style={styles.nodeBody}>
                            <Text style={[styles.nodeType, { color: nc }]}>{node.type.toUpperCase()}</Text>
                          </View>
                        </View>
                        {idx < expandedMechanic.nodes.length - 1 && (
                          <View style={styles.wire} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <Text style={styles.sectionLabel}>ШАГИ ВЫПОЛНЕНИЯ</Text>
            <View style={styles.stepsCard}>
              {expandedMechanic.steps.map((step, idx) => (
                <View key={idx} style={[styles.stepRow, idx < expandedMechanic.steps.length - 1 && styles.stepBorder]}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepNode}>{step.node}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>ТЕОРИЯ</Text>
            <View style={styles.theoryCard}>
              <Text style={styles.theoryText}>{expandedMechanic.theory}</Text>
            </View>

            <Text style={styles.sectionLabel}>СОВЕТЫ</Text>
            <View style={styles.tipsCard}>
              {expandedMechanic.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tagsRow}>
              {expandedMechanic.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: isWeb ? 67 : insets.top + 12,
          paddingBottom: tabBarHeight + 20,
        }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.screenTitle}>Механики</Text>
              <Text style={styles.screenSub}>{totalCount} Blueprint механик</Text>
            </View>
            <View style={styles.countBadge}>
              <Feather name="layers" size={14} color={C.tint} />
              <Text style={styles.countBadgeText}>{filteredMechanics.length}</Text>
            </View>
          </View>
          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={C.textTertiary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Поиск механик..."
              placeholderTextColor={C.textTertiary}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x" size={15} color={C.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>

        {!search && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <CategoryChip
              category={null}
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
              C={C}
              styles={styles}
            />
            {MECHANIC_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                C={C}
                styles={styles}
              />
            ))}
          </ScrollView>
        )}

        <View style={{ paddingHorizontal: 16 }}>
          {filteredMechanics.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="search" size={32} color={C.textTertiary} />
              <Text style={styles.emptyText}>Ничего не найдено</Text>
              <Text style={styles.emptySubText}>Попробуй другой запрос</Text>
            </View>
          ) : (
            filteredMechanics.map((mechanic, idx) => (
              <MechanicCard
                key={mechanic.id}
                mechanic={mechanic}
                index={idx}
                onPress={() => setExpanded(mechanic.id)}
                C={C}
                styles={styles}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    stickyHeader: { backgroundColor: C.background, paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    screenTitle: { fontSize: 26, fontWeight: "700", color: C.text, letterSpacing: -0.5 },
    screenSub: { fontSize: 13, color: C.textSecondary, marginTop: 1 },
    countBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: C.tint + "15",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: C.tint + "30",
    },
    countBadgeText: { fontSize: 13, fontWeight: "700", color: C.tint },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.backgroundSecondary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },
    chipsRow: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, flexDirection: "row" },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: C.backgroundSecondary,
    },
    chipText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
    mechanicCard: {
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: C.cardBorder,
      gap: 8,
      overflow: "hidden",
    },
    mechanicCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    mechanicMeta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    diffBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
    diffText: { fontSize: 11, fontWeight: "700" },
    categoryBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: "rgba(0,212,255,0.1)",
      borderWidth: 1,
      borderColor: "rgba(0,212,255,0.2)",
    },
    categoryText: { fontSize: 11, fontWeight: "600", color: C.tint },
    mechanicTitle: { fontSize: 16, fontWeight: "700", color: "#E8ECF0", letterSpacing: -0.2 },
    mechanicDesc: { fontSize: 13, color: "#8B9BB4", lineHeight: 18 },
    nodesRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    moreNodes: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
      backgroundColor: C.backgroundSecondary,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    moreNodesText: { fontSize: 10, color: C.textTertiary, fontWeight: "600" },
    empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
    emptyText: { fontSize: 16, fontWeight: "600", color: C.textSecondary },
    emptySubText: { fontSize: 13, color: C.textTertiary },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, alignSelf: "flex-start", paddingVertical: 4 },
    backText: { fontSize: 15, color: C.tint, fontWeight: "600" },
    detailHero: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 8 },
    detailMeta: { flexDirection: "row", gap: 8 },
    detailTitle: { fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.4 },
    detailDesc: { fontSize: 14, color: C.textSecondary, lineHeight: 21 },
    sectionLabel: { fontSize: 11, fontWeight: "700", color: C.textTertiary, letterSpacing: 1, marginBottom: 8, marginTop: 4 },
    graphCard: { backgroundColor: "#080D14", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16 },
    graphRow: { flexDirection: "row", alignItems: "center", gap: 0, paddingVertical: 4 },
    nodeBox: { borderRadius: 8, borderWidth: 1.5, overflow: "hidden", minWidth: 100, maxWidth: 140 },
    nodeHeader: { paddingHorizontal: 8, paddingVertical: 5 },
    nodeHeaderText: { fontSize: 10, color: "#FFF", fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
    nodeBody: { backgroundColor: "#111820", paddingHorizontal: 8, paddingVertical: 5 },
    nodeType: { fontSize: 9, fontWeight: "600", letterSpacing: 0.5 },
    wire: { width: 24, height: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center" },
    stepsCard: {
      backgroundColor: C.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.cardBorder,
      marginBottom: 16,
      overflow: "hidden",
    },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
    stepBorder: { borderBottomWidth: 1, borderBottomColor: C.cardBorder },
    stepNum: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: C.tint + "20",
      borderWidth: 1,
      borderColor: C.tint + "40",
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumText: { fontSize: 12, fontWeight: "700", color: C.tint },
    stepNode: { fontSize: 13, fontWeight: "700", color: C.text, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 3 },
    stepDesc: { fontSize: 13, color: C.textSecondary, lineHeight: 18 },
    theoryCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16 },
    theoryText: { fontSize: 14, color: C.text, lineHeight: 22 },
    tipsCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16, gap: 10 },
    tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.warning, marginTop: 6 },
    tipText: { flex: 1, fontSize: 13, color: C.textSecondary, lineHeight: 20 },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
    tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: C.backgroundSecondary, borderWidth: 1, borderColor: C.cardBorder },
    tagText: { fontSize: 12, color: C.textTertiary, fontWeight: "500" },
  });
}
