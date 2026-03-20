import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useProgress } from "@/context/ProgressContext";
import {
  Difficulty,
  MODULES,
  getDifficultyColor,
  getDifficultyLabel,
} from "@/data/curriculum";

const C = Colors.dark;

const DIFFICULTIES: (Difficulty | "all")[] = [
  "all",
  "beginner",
  "basic",
  "intermediate",
  "advanced",
  "expert",
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { isLessonCompleted, isModuleUnlocked } = useProgress();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Difficulty | "all">("all");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const filteredModules = MODULES.filter((mod) => {
    const matchesDiff = filter === "all" || mod.difficulty === filter;
    const matchesSearch =
      !search ||
      mod.title.toLowerCase().includes(search.toLowerCase()) ||
      mod.lessons.some((l) => l.title.toLowerCase().includes(search.toLowerCase()));
    return matchesDiff && matchesSearch;
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
        <Text style={styles.screenTitle}>Learning Path</Text>
        <Text style={styles.screenSubtitle}>Master Blueprints from beginner to expert</Text>

        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={C.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search modules or lessons..."
            placeholderTextColor={C.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={C.textSecondary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d}
              style={[
                styles.filterChip,
                filter === d && {
                  backgroundColor: (d === "all" ? C.tint : getDifficultyColor(d as Difficulty)) + "33",
                  borderColor: d === "all" ? C.tint : getDifficultyColor(d as Difficulty),
                },
              ]}
              onPress={() => setFilter(d)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === d && {
                    color: d === "all" ? C.tint : getDifficultyColor(d as Difficulty),
                  },
                ]}
              >
                {d === "all" ? "All" : getDifficultyLabel(d as Difficulty)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredModules.map((mod, index) => {
          const unlocked = isModuleUnlocked(mod.id);
          const completedCount = mod.lessons.filter((l) =>
            isLessonCompleted(l.id)
          ).length;
          const allDone = completedCount === mod.lessons.length && mod.lessons.length > 0;

          return (
            <Animated.View
              key={mod.id}
              entering={FadeInDown.delay(index * 50).springify()}
            >
              <View style={[styles.moduleSection, !unlocked && styles.moduleSectionLocked]}>
                <LinearGradient
                  colors={unlocked ? [mod.color + "14", "transparent"] : ["transparent", "transparent"]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.moduleHeader}>
                  <View style={[styles.moduleIconCircle, { borderColor: unlocked ? mod.color + "66" : C.cardBorder }]}>
                    {unlocked ? (
                      <Feather name={mod.icon as any} size={20} color={mod.color} />
                    ) : (
                      <Feather name="lock" size={18} color={C.textTertiary} />
                    )}
                  </View>
                  <View style={styles.moduleHeaderText}>
                    <Text style={[styles.moduleTitle, !unlocked && { color: C.textTertiary }]}>
                      {mod.title}
                    </Text>
                    <View style={styles.moduleMetaRow}>
                      <View style={[styles.diffPill, { backgroundColor: getDifficultyColor(mod.difficulty) + "22" }]}>
                        <Text style={[styles.diffPillText, { color: getDifficultyColor(mod.difficulty) }]}>
                          {getDifficultyLabel(mod.difficulty)}
                        </Text>
                      </View>
                      <Text style={styles.moduleMeta}>
                        {mod.lessons.length} lessons
                      </Text>
                    </View>
                  </View>
                  {allDone && (
                    <Feather name="check-circle" size={20} color={C.success} />
                  )}
                  {!unlocked && (
                    <View style={styles.xpReqBadge}>
                      <Feather name="zap" size={11} color={C.warning} />
                      <Text style={styles.xpReqText}>{mod.xpRequired}</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.moduleDesc, !unlocked && { color: C.textTertiary }]}>
                  {mod.description}
                </Text>

                {mod.lessons.map((lesson, li) => {
                  const done = isLessonCompleted(lesson.id);
                  return (
                    <Pressable
                      key={lesson.id}
                      style={({ pressed }) => [
                        styles.lessonRow,
                        done && styles.lessonRowDone,
                        pressed && unlocked && { opacity: 0.8 },
                      ]}
                      onPress={() =>
                        unlocked && router.push(`/lesson/${lesson.id}`)
                      }
                      disabled={!unlocked}
                    >
                      <View style={[styles.lessonDot, done && { backgroundColor: C.success }]}>
                        {done ? (
                          <Feather name="check" size={10} color={C.background} />
                        ) : (
                          <Text style={styles.lessonNum}>{li + 1}</Text>
                        )}
                      </View>
                      <View style={styles.lessonContent}>
                        <Text style={[styles.lessonTitle, done && { color: C.textSecondary }]}>
                          {lesson.title}
                        </Text>
                        <View style={styles.lessonMeta}>
                          <Feather name="clock" size={11} color={C.textTertiary} />
                          <Text style={styles.lessonMetaText}>{lesson.estimatedMinutes} min</Text>
                          <Feather name="zap" size={11} color={C.warning} />
                          <Text style={[styles.lessonMetaText, { color: C.warning }]}>
                            +{lesson.xpReward} XP
                          </Text>
                        </View>
                      </View>
                      {unlocked && !done && (
                        <Feather name="chevron-right" size={16} color={C.textTertiary} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          );
        })}
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.text,
  },
  filterRow: {
    gap: 8,
    paddingRight: 20,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  filterText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textSecondary,
  },
  moduleSection: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
  },
  moduleSectionLocked: { opacity: 0.6 },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  moduleIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: C.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  moduleHeaderText: { flex: 1 },
  moduleTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: C.text,
    marginBottom: 4,
  },
  moduleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diffPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffPillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  moduleMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  xpReqBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.warning + "22",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpReqText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: C.warning,
  },
  moduleDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.separator,
  },
  lessonRowDone: {},
  lessonDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  lessonNum: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: C.textSecondary,
  },
  lessonContent: { flex: 1 },
  lessonTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.text,
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lessonMetaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textTertiary,
    marginRight: 6,
  },
});
