import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";
import {
  Difficulty,
  MODULES,
  getDifficultyColor,
  getDifficultyLabel,
} from "@/data/curriculum";

const DIFFICULTIES: (Difficulty | "all")[] = [
  "all",
  "beginner",
  "basic",
  "intermediate",
  "advanced",
  "expert",
];

const CATEGORY_ICONS: Record<Difficulty, string> = {
  beginner: "star",
  basic: "zap",
  intermediate: "layers",
  advanced: "cpu",
  expert: "award",
};

const CATEGORY_DESCRIPTIONS: Record<Difficulty, string> = {
  beginner: "Основы Blueprint: узлы, события, переменные",
  basic: "Функции, макросы и структура кода",
  intermediate: "Механики, UI, взаимодействие акторов",
  advanced: "Искусственный интеллект и поведение",
  expert: "Оптимизация и профессиональные практики",
};

function CategorySection({
  difficulty,
  index,
  search,
}: {
  difficulty: Difficulty;
  index: number;
  search: string;
}) {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { isLessonCompleted, isModuleUnlocked } = useProgress();
  const [collapsed, setCollapsed] = useState(false);

  const color = getDifficultyColor(difficulty);
  const label = getDifficultyLabel(difficulty);
  const icon = CATEGORY_ICONS[difficulty];

  const modules = MODULES.filter((m) => {
    if (m.difficulty !== difficulty) return false;
    if (!search) return true;
    return (
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.lessons.some((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    );
  });

  if (modules.length === 0) return null;

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => isLessonCompleted(l.id)).length,
    0
  );
  const pct = totalLessons > 0 ? completedLessons / totalLessons : 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={styles.categoryBlock}
    >
      <Pressable
        style={styles.categoryHeader}
        onPress={() => setCollapsed((v) => !v)}
      >
        <LinearGradient
          colors={[color + "18", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.categoryIconCircle, { borderColor: color + "55", backgroundColor: color + "18" }]}>
          <Feather name={icon as any} size={18} color={color} />
        </View>
        <View style={styles.categoryHeaderText}>
          <View style={styles.categoryLabelRow}>
            <Text style={[styles.categoryLabel, { color }]}>{label}</Text>
            <View style={[styles.countBadge, { backgroundColor: color + "22" }]}>
              <Text style={[styles.countBadgeText, { color }]}>
                {modules.length} {modules.length === 1 ? "модуль" : "модуля"}
              </Text>
            </View>
          </View>
          <Text style={styles.categoryDesc} numberOfLines={1}>
            {CATEGORY_DESCRIPTIONS[difficulty]}
          </Text>
          <View style={styles.catProgressRow}>
            <View style={styles.catProgressTrack}>
              <View
                style={[
                  styles.catProgressFill,
                  { width: `${Math.round(pct * 100)}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={styles.catProgressText}>
              {completedLessons}/{totalLessons}
            </Text>
          </View>
        </View>
        <Feather
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={18}
          color={C.textTertiary}
        />
      </Pressable>

      {!collapsed &&
        modules.map((mod) => {
          const unlocked = isModuleUnlocked(mod.id);
          const completedCount = mod.lessons.filter((l) =>
            isLessonCompleted(l.id)
          ).length;
          const allDone =
            completedCount === mod.lessons.length && mod.lessons.length > 0;

          return (
            <View key={mod.id} style={styles.moduleSection}>
              <LinearGradient
                colors={
                  unlocked ? [mod.color + "12", "transparent"] : ["transparent", "transparent"]
                }
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.moduleHeader}>
                <View
                  style={[
                    styles.moduleIconCircle,
                    { borderColor: unlocked ? mod.color + "55" : C.cardBorder },
                  ]}
                >
                  {unlocked ? (
                    <Feather name={mod.icon as any} size={18} color={mod.color} />
                  ) : (
                    <Feather name="lock" size={16} color={C.textTertiary} />
                  )}
                </View>
                <View style={styles.moduleHeaderText}>
                  <Text
                    style={[
                      styles.moduleTitle,
                      !unlocked && { color: C.textTertiary },
                    ]}
                  >
                    {mod.title}
                  </Text>
                  <Text style={styles.moduleMeta}>
                    {mod.lessons.length} уроков · {completedCount} выполнено
                  </Text>
                </View>
                {allDone && (
                  <Feather name="check-circle" size={18} color={C.success} />
                )}
                {!unlocked && (
                  <View style={styles.xpReqBadge}>
                    <Feather name="zap" size={11} color={C.warning} />
                    <Text style={styles.xpReqText}>{mod.xpRequired}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.moduleDesc,
                  !unlocked && { color: C.textTertiary },
                ]}
                numberOfLines={2}
              >
                {mod.description}
              </Text>

              {mod.lessons.map((lesson, li) => {
                const done = isLessonCompleted(lesson.id);
                return (
                  <Pressable
                    key={lesson.id}
                    style={({ pressed }) => [
                      styles.lessonRow,
                      pressed && unlocked && { opacity: 0.8 },
                    ]}
                    onPress={() =>
                      unlocked && router.push(`/lesson/${lesson.id}`)
                    }
                    disabled={!unlocked}
                  >
                    <View
                      style={[
                        styles.lessonDot,
                        done && { backgroundColor: C.success, borderColor: C.success },
                      ]}
                    >
                      {done ? (
                        <Feather name="check" size={10} color={C.background} />
                      ) : (
                        <Text style={styles.lessonNum}>{li + 1}</Text>
                      )}
                    </View>
                    <View style={styles.lessonContent}>
                      <Text
                        style={[
                          styles.lessonTitle,
                          done && { color: C.textSecondary },
                        ]}
                      >
                        {lesson.title}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Feather name="clock" size={11} color={C.textTertiary} />
                        <Text style={styles.lessonMetaText}>
                          {lesson.estimatedMinutes} мин
                        </Text>
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
          );
        })}
    </Animated.View>
  );
}

export default function LearnScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { getTotalLessonsCompleted } = useProgress();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Difficulty | "all">("all");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const activeDifficulties =
    filter === "all"
      ? (["beginner", "basic", "intermediate", "advanced", "expert"] as Difficulty[])
      : [filter as Difficulty];

  const totalLessons = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = getTotalLessonsCompleted();
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
        <Text style={styles.screenTitle}>Путь обучения</Text>
        <Text style={styles.screenSubtitle}>
          {overallPct}% пройдено · {completedLessons}/{totalLessons} уроков
        </Text>

        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={C.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск модулей или уроков..."
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
          {DIFFICULTIES.map((d) => {
            const color = d === "all" ? C.tint : getDifficultyColor(d as Difficulty);
            return (
              <Pressable
                key={d}
                style={[
                  styles.filterChip,
                  filter === d && {
                    backgroundColor: color + "22",
                    borderColor: color,
                  },
                ]}
                onPress={() => setFilter(d)}
              >
                {d !== "all" && (
                  <Feather
                    name={CATEGORY_ICONS[d as Difficulty] as any}
                    size={12}
                    color={filter === d ? color : C.textTertiary}
                  />
                )}
                <Text
                  style={[
                    styles.filterText,
                    filter === d && { color },
                  ]}
                >
                  {d === "all" ? "Все" : getDifficultyLabel(d as Difficulty)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeDifficulties.map((diff, i) => (
          <CategorySection
            key={diff}
            difficulty={diff}
            index={i}
            search={search}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
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
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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
    categoryBlock: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: C.cardBorder,
      backgroundColor: C.card,
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 18,
      overflow: "hidden",
    },
    categoryIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    categoryHeaderText: { flex: 1 },
    categoryLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    categoryLabel: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    countBadgeText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
    },
    categoryDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: C.textSecondary,
      marginBottom: 8,
    },
    catProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    catProgressTrack: {
      flex: 1,
      height: 4,
      backgroundColor: C.backgroundTertiary,
      borderRadius: 2,
      overflow: "hidden",
    },
    catProgressFill: { height: "100%", borderRadius: 2 },
    catProgressText: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      color: C.textSecondary,
    },
    moduleSection: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: C.separator,
      overflow: "hidden",
    },
    moduleHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    },
    moduleIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: C.backgroundTertiary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    moduleHeaderText: { flex: 1 },
    moduleTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: C.text,
      marginBottom: 2,
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
      marginBottom: 8,
    },
    lessonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: C.separator,
    },
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
      marginBottom: 3,
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
}
