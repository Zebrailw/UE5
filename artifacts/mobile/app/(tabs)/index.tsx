import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";
import { MODULES, getDifficultyColor, getDifficultyLabel } from "@/data/curriculum";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function XPBar() {
  const { colors: C } = useTheme();
  const { xp, level, getLevelProgress } = useProgress();
  const progress = getLevelProgress();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.xpBar}>
      <View style={styles.xpBarHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Ур. {level}</Text>
        </View>
        <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
      </View>
      <View style={styles.xpTrack}>
        <Animated.View
          style={[styles.xpFill, { width: `${Math.round(progress.percentage * 100)}%` }]}
        />
      </View>
      <Text style={styles.xpSubText}>
        {progress.current} / {progress.required} XP до следующего уровня
      </Text>
    </View>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  return (
    <View style={[styles.statCard, { borderColor: color + "33" }]}>
      <Feather name={icon as any} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ContinueLearningCard() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { isLessonCompleted, isModuleUnlocked } = useProgress();

  const nextLesson = useMemo(() => {
    for (const mod of MODULES) {
      if (!isModuleUnlocked(mod.id)) continue;
      for (const lesson of mod.lessons) {
        if (!isLessonCompleted(lesson.id)) {
          return { lesson, mod };
        }
      }
    }
    return null;
  }, [isLessonCompleted, isModuleUnlocked]);

  if (!nextLesson) {
    return (
      <View style={styles.continueCard}>
        <Feather name="check-circle" size={24} color={C.success} />
        <Text style={styles.continueTitle}>Всё изучено!</Text>
        <Text style={styles.continueSubtitle}>Вы завершили все доступные уроки.</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.continueCard, pressed && { opacity: 0.9 }]}
      onPress={() => router.push(`/lesson/${nextLesson.lesson.id}`)}
    >
      <LinearGradient
        colors={[nextLesson.mod.color + "22", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.continueHeader}>
        <View style={[styles.continueDot, { backgroundColor: nextLesson.mod.color }]} />
        <Text style={[styles.continueModule, { color: nextLesson.mod.color }]}>
          {nextLesson.mod.title}
        </Text>
        <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(nextLesson.mod.difficulty) + "22" }]}>
          <Text style={[styles.diffText, { color: getDifficultyColor(nextLesson.mod.difficulty) }]}>
            {getDifficultyLabel(nextLesson.mod.difficulty)}
          </Text>
        </View>
      </View>
      <Text style={styles.continueTitle}>{nextLesson.lesson.title}</Text>
      <Text style={styles.continueSubtitle} numberOfLines={2}>
        {nextLesson.lesson.description}
      </Text>
      <View style={styles.continueFooter}>
        <View style={styles.continueInfo}>
          <Feather name="clock" size={13} color={C.textSecondary} />
          <Text style={styles.continueInfoText}>{nextLesson.lesson.estimatedMinutes} мин</Text>
        </View>
        <View style={styles.continueInfo}>
          <Feather name="zap" size={13} color={C.warning} />
          <Text style={styles.continueInfoText}>+{nextLesson.lesson.xpReward} XP</Text>
        </View>
        <View style={styles.continueStartBtn}>
          <Text style={styles.continueStartText}>Начать</Text>
          <Feather name="arrow-right" size={14} color={C.background} />
        </View>
      </View>
    </Pressable>
  );
}

function ModuleCard({ mod, index }: { mod: typeof MODULES[0]; index: number }) {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { isModuleUnlocked, isLessonCompleted } = useProgress();
  const unlocked = isModuleUnlocked(mod.id);
  const completedCount = mod.lessons.filter((l) => isLessonCompleted(l.id)).length;
  const progress = mod.lessons.length > 0 ? completedCount / mod.lessons.length : 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.moduleCard,
          !unlocked && styles.moduleCardLocked,
          pressed && unlocked && { opacity: 0.85 },
        ]}
        onPress={() => unlocked && router.push({ pathname: "/learn", params: { moduleId: mod.id } })}
        disabled={!unlocked}
      >
        <LinearGradient
          colors={unlocked ? [mod.color + "18", "transparent"] : ["transparent", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.moduleCardLeft}>
          <View style={[styles.moduleIconBox, { borderColor: unlocked ? mod.color + "55" : C.cardBorder }]}>
            {unlocked ? (
              <Feather name={mod.icon as any} size={20} color={mod.color} />
            ) : (
              <Feather name="lock" size={18} color={C.textTertiary} />
            )}
          </View>
        </View>
        <View style={styles.moduleCardContent}>
          <View style={styles.moduleCardHeader}>
            <Text style={[styles.moduleTitle, !unlocked && styles.moduleTitleLocked]}>
              {mod.title}
            </Text>
            <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(mod.difficulty) + "22" }]}>
              <Text style={[styles.diffText, { color: getDifficultyColor(mod.difficulty) }]}>
                {getDifficultyLabel(mod.difficulty)}
              </Text>
            </View>
          </View>
          <Text style={styles.moduleDesc} numberOfLines={1}>{mod.description}</Text>
          {unlocked ? (
            <View style={styles.moduleProgressRow}>
              <View style={styles.moduleTrack}>
                <View style={[styles.moduleFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: mod.color }]} />
              </View>
              <Text style={styles.modulePct}>{completedCount}/{mod.lessons.length}</Text>
            </View>
          ) : (
            <Text style={styles.moduleLocked}>
              Требуется {mod.xpRequired.toLocaleString()} XP
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { streak, dailyGoalCompleted, getTotalLessonsCompleted, xp } = useProgress();
  const totalCompleted = getTotalLessonsCompleted();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const rank = xp >= 2000 ? "Мастер" : xp >= 1000 ? "Эксперт" : xp >= 500 ? "Про" : xp >= 200 ? "Базовый" : "Новичок";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>С возвращением</Text>
            <Text style={styles.headerTitle}>UE5 Blueprints</Text>
            <Text style={[styles.headerTitle, { color: C.tint }]}>Академия</Text>
          </View>
          <View style={styles.headerRight}>
            {dailyGoalCompleted && (
              <View style={styles.goalBadge}>
                <Feather name="check" size={12} color={C.success} />
              </View>
            )}
            <View style={styles.streakBadge}>
              <Feather name="zap" size={14} color={C.warning} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)}>
          <XPBar />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150)} style={styles.statsRow}>
          <StatCard icon="book-open" value={String(totalCompleted)} label="Уроков" color={C.tint} />
          <StatCard icon="zap" value={String(streak)} label="Дней подряд" color={C.warning} />
          <StatCard icon="award" value={rank} label="Ранг" color={C.accent} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>Продолжить обучение</Text>
          <ContinueLearningCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250)}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Все модули</Text>
            <Pressable onPress={() => router.push("/learn")}>
              <Text style={styles.seeAll}>Все →</Text>
            </Pressable>
          </View>
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} mod={mod} index={i} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
    },
    headerGreeting: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: C.textSecondary,
      marginBottom: 2,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: C.text,
      lineHeight: 34,
    },
    headerRight: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4 },
    goalBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: C.success + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.warning + "22",
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 4,
    },
    streakText: { fontFamily: "Inter_700Bold", fontSize: 14, color: C.warning },
    xpBar: {
      backgroundColor: C.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    xpBarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    levelBadge: {
      backgroundColor: C.tint + "22",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    levelText: { fontFamily: "Inter_700Bold", fontSize: 13, color: C.tint },
    xpText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.text },
    xpTrack: {
      height: 8,
      backgroundColor: C.backgroundTertiary,
      borderRadius: 4,
      overflow: "hidden",
    },
    xpFill: { height: "100%", backgroundColor: C.tint, borderRadius: 4 },
    xpSubText: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary, marginTop: 6 },
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    statCard: {
      flex: 1,
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
    },
    statValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: C.textSecondary, textAlign: "center" },
    sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: C.text, marginBottom: 14 },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      marginTop: 8,
    },
    seeAll: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.tint },
    continueCard: {
      backgroundColor: C.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: C.cardBorder,
      overflow: "hidden",
    },
    continueHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
    continueDot: { width: 8, height: 8, borderRadius: 4 },
    continueModule: { fontFamily: "Inter_600SemiBold", fontSize: 12, flex: 1 },
    diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    diffText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
    continueTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: C.text, marginBottom: 6 },
    continueSubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: C.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    continueFooter: { flexDirection: "row", alignItems: "center", gap: 12 },
    continueInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
    continueInfoText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary },
    continueStartBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.tint,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
      gap: 6,
      marginLeft: "auto",
    },
    continueStartText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.background },
    moduleCard: {
      flexDirection: "row",
      backgroundColor: C.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: C.cardBorder,
      overflow: "hidden",
      alignItems: "center",
      gap: 14,
    },
    moduleCardLocked: { opacity: 0.55 },
    moduleCardLeft: {},
    moduleIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: C.backgroundTertiary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    moduleCardContent: { flex: 1 },
    moduleCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    moduleTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text, flex: 1, marginRight: 8 },
    moduleTitleLocked: { color: C.textTertiary },
    moduleDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary, marginBottom: 8 },
    moduleProgressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    moduleTrack: { flex: 1, height: 4, backgroundColor: C.backgroundTertiary, borderRadius: 2, overflow: "hidden" },
    moduleFill: { height: "100%", borderRadius: 2 },
    modulePct: { fontFamily: "Inter_500Medium", fontSize: 11, color: C.textSecondary },
    moduleLocked: { fontFamily: "Inter_400Regular", fontSize: 11, color: C.textTertiary },
  });
}
