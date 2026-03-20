import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useProgress } from "@/context/ProgressContext";
import {
  Difficulty,
  REAL_WORLD_EXAMPLES,
  getDifficultyColor,
  getDifficultyLabel,
} from "@/data/curriculum";

const C = Colors.dark;

function ExampleCard({
  example,
  index,
}: {
  example: (typeof REAL_WORLD_EXAMPLES)[0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { favoriteIds, toggleFavorite } = useProgress();
  const isFav = favoriteIds.includes(example.id);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        style={[styles.card, { borderLeftColor: example.color }]}
        onPress={() => setExpanded((p) => !p)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: example.color + "22" }]}>
            <Text style={[styles.categoryText, { color: example.color }]}>
              {example.category}
            </Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(example.difficulty) + "22" }]}>
            <Text style={[styles.diffText, { color: getDifficultyColor(example.difficulty) }]}>
              {getDifficultyLabel(example.difficulty)}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(example.id);
              }}
              style={styles.favBtn}
            >
              <Feather
                name={isFav ? "heart" : "heart"}
                size={16}
                color={isFav ? "#FF4757" : C.textTertiary}
              />
            </Pressable>
            <Feather
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={C.textSecondary}
            />
          </View>
        </View>

        <Text style={styles.cardTitle}>{example.title}</Text>
        <Text style={styles.cardDesc}>{example.description}</Text>

        <View style={styles.nodesRow}>
          {example.nodes.slice(0, 3).map((node) => (
            <View key={node} style={styles.nodeChip}>
              <Text style={styles.nodeText}>{node}</Text>
            </View>
          ))}
          {example.nodes.length > 3 && (
            <View style={[styles.nodeChip, styles.nodeChipMore]}>
              <Text style={styles.nodeText}>+{example.nodes.length - 3}</Text>
            </View>
          )}
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <Text style={styles.stepsTitle}>Implementation Steps</Text>
            {example.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: example.color + "22" }]}>
                  <Text style={[styles.stepNumText, { color: example.color }]}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <Text style={[styles.stepsTitle, { marginTop: 16 }]}>Nodes Used</Text>
            <View style={styles.allNodesRow}>
              {example.nodes.map((node) => (
                <View key={node} style={[styles.nodeChip, { borderColor: example.color + "44" }]}>
                  <Text style={[styles.nodeText, { color: example.color }]}>{node}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function ExamplesScreen() {
  const insets = useSafeAreaInsets();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "all">("all");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const categories = ["All", ...Array.from(new Set(REAL_WORLD_EXAMPLES.map((e) => e.category)))];

  const filtered = REAL_WORLD_EXAMPLES.filter((e) => {
    const catMatch = categoryFilter === "All" || e.category === categoryFilter;
    const diffMatch = diffFilter === "all" || e.difficulty === diffFilter;
    return catMatch && diffMatch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topPadding + 16,
            paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Real Examples</Text>
        <Text style={styles.screenSubtitle}>
          Learn from practical game mechanics built in Blueprint
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[styles.filterText, categoryFilter === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={styles.countText}>{filtered.length} examples</Text>
        </View>

        {filtered.map((ex, i) => (
          <ExampleCard key={ex.id} example={ex} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scrollContent: { paddingHorizontal: 20 },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: C.text,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    marginBottom: 20,
  },
  filterRow: {
    gap: 8,
    marginBottom: 16,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  filterChipActive: {
    backgroundColor: C.tint + "22",
    borderColor: C.tint,
  },
  filterText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textSecondary,
  },
  filterTextActive: { color: C.tint },
  countRow: { marginBottom: 14 },
  countText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderLeftWidth: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 12,
  },
  favBtn: { padding: 2 },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: C.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  nodesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  allNodesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  nodeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: C.backgroundTertiary,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  nodeChipMore: {
    backgroundColor: C.tint + "18",
    borderColor: C.tint + "44",
  },
  nodeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: C.textSecondary,
  },
  expandedContent: { marginTop: 4 },
  divider: {
    height: 1,
    backgroundColor: C.separator,
    marginVertical: 16,
  },
  stepsTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.text,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  stepText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
});
