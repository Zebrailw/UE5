import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
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
import { CHEAT_SHEETS, CheatSheet } from "@/data/cheatsheets";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ROADMAP_STAGES = [
  {
    id: "foundation",
    label: "Фундамент",
    desc: "Blueprint, ноды, переменные",
    color: "#00D4FF",
    icon: "layers",
    moduleIds: ["mod_intro", "mod_nodes", "mod_vars"],
  },
  {
    id: "systems",
    label: "Системы",
    desc: "Функции, макросы, общение",
    color: "#39D353",
    icon: "cpu",
    moduleIds: ["mod_functions", "mod_comm"],
  },
  {
    id: "gameplay",
    label: "Геймплей",
    desc: "Механики, ИИ, физика",
    color: "#FFB800",
    icon: "play-circle",
    moduleIds: ["mod_gameplay", "mod_ai"],
  },
  {
    id: "professional",
    label: "Профи",
    desc: "UI, оптимизация, C++ переход",
    color: "#FF6B35",
    icon: "award",
    moduleIds: ["mod_ui", "mod_optimization"],
  },
];

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
        <Animated.View style={[styles.xpFill, { width: `${Math.round(progress.percentage * 100)}%` }]} />
      </View>
      <Text style={styles.xpSubText}>
        {progress.current} / {progress.required} XP до следующего уровня
      </Text>
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
        if (!isLessonCompleted(lesson.id)) return { lesson, mod };
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
      <Text style={styles.continueSubtitle} numberOfLines={2}>{nextLesson.lesson.description}</Text>
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

function RoadmapSection() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { isLessonCompleted, isModuleUnlocked } = useProgress();

  const stageProgress = useMemo(() => {
    return ROADMAP_STAGES.map((stage) => {
      const mods = MODULES.filter((m) => stage.moduleIds.includes(m.id));
      const totalLessons = mods.reduce((acc, m) => acc + m.lessons.length, 0);
      const completedLessons = mods.reduce(
        (acc, m) => acc + m.lessons.filter((l) => isLessonCompleted(l.id)).length,
        0
      );
      const isUnlocked = mods.some((m) => isModuleUnlocked(m.id));
      const pct = totalLessons > 0 ? completedLessons / totalLessons : 0;
      return { ...stage, totalLessons, completedLessons, isUnlocked, pct };
    });
  }, [isLessonCompleted, isModuleUnlocked]);

  const activeStageIdx = stageProgress.findIndex((s) => s.pct < 1 && s.isUnlocked);
  const overallPct = (() => {
    const total = stageProgress.reduce((a, s) => a + s.totalLessons, 0);
    const done = stageProgress.reduce((a, s) => a + s.completedLessons, 0);
    return total > 0 ? done / total : 0;
  })();

  return (
    <View style={styles.roadmapCard}>
      <View style={styles.roadmapHeader}>
        <Text style={styles.roadmapTitle}>Путь к UE5</Text>
        <Text style={[styles.roadmapPct, { color: "#00D4FF" }]}>{Math.round(overallPct * 100)}%</Text>
      </View>
      <View style={styles.roadmapTrackRow}>
        <View style={styles.roadmapTrack}>
          <View style={[styles.roadmapFill, { width: `${Math.round(overallPct * 100)}%` }]} />
        </View>
      </View>

      {stageProgress.map((stage, i) => {
        const isActive = i === activeStageIdx;
        const isDone = stage.pct === 1;
        const isLocked = !stage.isUnlocked;

        return (
          <View key={stage.id} style={styles.stageRow}>
            <View style={styles.stageLeft}>
              <View
                style={[
                  styles.stageCircle,
                  isDone && { backgroundColor: stage.color, borderColor: stage.color },
                  isActive && { borderColor: stage.color },
                  isLocked && { borderColor: C.cardBorder },
                ]}
              >
                {isDone ? (
                  <Feather name="check" size={14} color={C.background} />
                ) : (
                  <Feather name={stage.icon as any} size={14} color={isLocked ? C.textTertiary : stage.color} />
                )}
              </View>
              {i < ROADMAP_STAGES.length - 1 && (
                <View style={[styles.stageLine, isDone && { backgroundColor: stage.color + "66" }]} />
              )}
            </View>
            <View style={[styles.stageContent, isActive && { backgroundColor: stage.color + "11", borderColor: stage.color + "33" }]}>
              <View style={styles.stageContentHeader}>
                <Text style={[styles.stageLabel, isLocked && { color: C.textTertiary }]}>
                  {stage.label}
                </Text>
                {isActive && (
                  <View style={[styles.activeTag, { backgroundColor: stage.color + "22" }]}>
                    <Text style={[styles.activeTagText, { color: stage.color }]}>Сейчас</Text>
                  </View>
                )}
                {isDone && (
                  <View style={[styles.activeTag, { backgroundColor: C.success + "22" }]}>
                    <Text style={[styles.activeTagText, { color: C.success }]}>Готово</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.stageDesc, isLocked && { color: C.textTertiary }]}>{stage.desc}</Text>
              {!isLocked && (
                <View style={styles.stagePrgRow}>
                  <View style={styles.stagePrgTrack}>
                    <View style={[styles.stagePrgFill, { width: `${Math.round(stage.pct * 100)}%`, backgroundColor: stage.color }]} />
                  </View>
                  <Text style={styles.stagePrgTxt}>{stage.completedLessons}/{stage.totalLessons}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      <Pressable
        style={({ pressed }) => [styles.roadmapLearnBtn, pressed && { opacity: 0.8 }]}
        onPress={() => router.push("/learn")}
      >
        <Text style={styles.roadmapLearnBtnText}>Открыть учебник</Text>
        <Feather name="arrow-right" size={15} color="#00D4FF" />
      </Pressable>
    </View>
  );
}

function CheatSheetModal({ sheet, onClose }: { sheet: CheatSheet; onClose: () => void }) {
  const { colors: C } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#00000088" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={{ backgroundColor: C.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", paddingBottom: insets.bottom + 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: C.cardBorder }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: sheet.color + "22", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
              <Feather name={sheet.icon as any} size={20} color={sheet.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: C.text }}>{sheet.title}</Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary }}>{sheet.subtitle}</Text>
            </View>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Feather name="x" size={22} color={C.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 24 }}>
            {sheet.sections.map((section, si) => (
              <View key={si}>
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: sheet.color, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {section.heading}
                </Text>
                {section.items.map((item, ii) => (
                  <View key={ii} style={{ flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderColor: C.cardBorder, gap: 12 }}>
                    <View style={{ minWidth: 100 }}>
                      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: sheet.color }}>{item.label}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: C.text, lineHeight: 19 }}>{item.value}</Text>
                      {item.note && (
                        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{item.note}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CheatSheetsSection() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const [activeSheet, setActiveSheet] = useState<CheatSheet | null>(null);

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Шпаргалки</Text>
        <Text style={styles.sectionSub}>Нажми чтобы открыть</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
        {CHEAT_SHEETS.map((sheet) => (
          <Pressable
            key={sheet.id}
            style={({ pressed }) => [styles.sheetCard, pressed && { opacity: 0.85 }]}
            onPress={() => setActiveSheet(sheet)}
          >
            <LinearGradient
              colors={[sheet.color + "22", "transparent"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={[styles.sheetIcon, { backgroundColor: sheet.color + "22", borderColor: sheet.color + "44" }]}>
              <Feather name={sheet.icon as any} size={22} color={sheet.color} />
            </View>
            <Text style={styles.sheetTitle}>{sheet.title}</Text>
            <Text style={styles.sheetSub} numberOfLines={2}>{sheet.subtitle}</Text>
            <View style={[styles.sheetTag, { backgroundColor: sheet.color + "22" }]}>
              <Text style={[styles.sheetTagText, { color: sheet.color }]}>Открыть →</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {activeSheet && <CheatSheetModal sheet={activeSheet} onClose={() => setActiveSheet(null)} />}
    </View>
  );
}

function DailyTipCard() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const tips = [
    { tip: "Никогда не используй Event Tick без необходимости — это самый дорогой способ обновить значение. Используй таймеры и ивенты.", icon: "alert-triangle", color: "#FFB800" },
    { tip: "Branch (if) должен быть первым инструментом выбора логики. Cast To нужен только если тебе нужны конкретные методы актора.", icon: "git-branch", color: "#00D4FF" },
    { tip: "Print String — твой лучший друг при отладке. Выводи любые переменные прямо в игру во время Play.", icon: "terminal", color: "#39D353" },
    { tip: "Event Dispatcher — правильный способ общения между Blueprint-объектами без прямых ссылок и Cast.", icon: "radio", color: "#A855F7" },
    { tip: "Compile Blueprint (F7) после каждого изменения. Красный узел = ошибка компиляции, синий = предупреждение.", icon: "zap", color: "#FF6B35" },
  ];

  const today = new Date();
  const tip = tips[today.getDate() % tips.length];

  return (
    <View style={[styles.tipCard, { borderColor: tip.color + "44" }]}>
      <LinearGradient
        colors={[tip.color + "11", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <View style={[styles.tipIconBox, { backgroundColor: tip.color + "22" }]}>
        <Feather name={tip.icon as any} size={18} color={tip.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tipLabel}>Совет дня</Text>
        <Text style={styles.tipText}>{tip.tip}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { streak, dailyGoalCompleted, getTotalLessonsCompleted, xp } = useProgress();
  const totalCompleted = getTotalLessonsCompleted();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const rank =
    xp >= 2000 ? "Мастер" : xp >= 1000 ? "Эксперт" : xp >= 500 ? "Про" : xp >= 200 ? "Базовый" : "Новичок";

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

        <Animated.View entering={FadeInDown.delay(80)}>
          <XPBar />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120)} style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: C.tint + "33" }]}>
            <Feather name="book-open" size={18} color={C.tint} />
            <Text style={[styles.statValue, { color: C.tint }]}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Уроков</Text>
          </View>
          <View style={[styles.statCard, { borderColor: C.warning + "33" }]}>
            <Feather name="zap" size={18} color={C.warning} />
            <Text style={[styles.statValue, { color: C.warning }]}>{streak}</Text>
            <Text style={styles.statLabel}>Дней подряд</Text>
          </View>
          <View style={[styles.statCard, { borderColor: C.accent + "33" }]}>
            <Feather name="award" size={18} color={C.accent} />
            <Text style={[styles.statValue, { color: C.accent }]}>{rank}</Text>
            <Text style={styles.statLabel}>Ранг</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160)}>
          <Text style={styles.sectionTitle}>Продолжить обучение</Text>
          <ContinueLearningCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(210)} style={{ marginTop: 24 }}>
          <RoadmapSection />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260)} style={{ marginTop: 24 }}>
          <DailyTipCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={{ marginTop: 24 }}>
          <CheatSheetsSection />
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
    headerGreeting: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, marginBottom: 2 },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 28, color: C.text, lineHeight: 34 },
    headerRight: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4 },
    goalBadge: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: C.success + "22", alignItems: "center", justifyContent: "center",
    },
    streakBadge: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: C.warning + "22", borderRadius: 14,
      paddingHorizontal: 10, paddingVertical: 6, gap: 4,
    },
    streakText: { fontFamily: "Inter_700Bold", fontSize: 14, color: C.warning },
    xpBar: {
      backgroundColor: C.card, borderRadius: 16, padding: 16,
      marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder,
    },
    xpBarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    levelBadge: { backgroundColor: C.tint + "22", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    levelText: { fontFamily: "Inter_700Bold", fontSize: 13, color: C.tint },
    xpText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.text },
    xpTrack: { height: 8, backgroundColor: C.backgroundTertiary, borderRadius: 4, overflow: "hidden" },
    xpFill: { height: "100%", backgroundColor: C.tint, borderRadius: 4 },
    xpSubText: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary, marginTop: 6 },
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    statCard: {
      flex: 1, backgroundColor: C.card, borderRadius: 14,
      padding: 14, alignItems: "center", gap: 6, borderWidth: 1,
    },
    statValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: C.textSecondary, textAlign: "center" },
    sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: C.text, marginBottom: 14 },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    sectionSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary },
    diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    diffText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
    continueCard: {
      backgroundColor: C.card, borderRadius: 20, padding: 20,
      marginBottom: 8, borderWidth: 1, borderColor: C.cardBorder, overflow: "hidden",
    },
    continueHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
    continueDot: { width: 8, height: 8, borderRadius: 4 },
    continueModule: { fontFamily: "Inter_600SemiBold", fontSize: 12, flex: 1 },
    continueTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: C.text, marginBottom: 6 },
    continueSubtitle: {
      fontFamily: "Inter_400Regular", fontSize: 14,
      color: C.textSecondary, lineHeight: 20, marginBottom: 16,
    },
    continueFooter: { flexDirection: "row", alignItems: "center", gap: 12 },
    continueInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
    continueInfoText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary },
    continueStartBtn: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: C.tint, borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 8, gap: 6, marginLeft: "auto",
    },
    continueStartText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.background },
    roadmapCard: {
      backgroundColor: C.card, borderRadius: 20,
      padding: 20, borderWidth: 1, borderColor: C.cardBorder, overflow: "hidden",
    },
    roadmapHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    roadmapTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: C.text },
    roadmapPct: { fontFamily: "Inter_700Bold", fontSize: 18 },
    roadmapTrackRow: { marginBottom: 20 },
    roadmapTrack: { height: 6, backgroundColor: C.backgroundTertiary, borderRadius: 3, overflow: "hidden" },
    roadmapFill: { height: "100%", backgroundColor: "#00D4FF", borderRadius: 3 },
    stageRow: { flexDirection: "row", marginBottom: 4, gap: 14 },
    stageLeft: { alignItems: "center", width: 34 },
    stageCircle: {
      width: 34, height: 34, borderRadius: 17,
      borderWidth: 2, borderColor: "#ffffff33",
      backgroundColor: C.backgroundTertiary,
      alignItems: "center", justifyContent: "center",
    },
    stageLine: { flex: 1, width: 2, backgroundColor: "#ffffff18", marginVertical: 4 },
    stageContent: {
      flex: 1, backgroundColor: C.backgroundTertiary, borderRadius: 14,
      padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "transparent",
    },
    stageContentHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    stageLabel: { fontFamily: "Inter_700Bold", fontSize: 15, color: C.text },
    stageDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary, marginBottom: 8 },
    activeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    activeTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
    stagePrgRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    stagePrgTrack: { flex: 1, height: 4, backgroundColor: C.backgroundTertiary, borderRadius: 2, overflow: "hidden" },
    stagePrgFill: { height: "100%", borderRadius: 2 },
    stagePrgTxt: { fontFamily: "Inter_500Medium", fontSize: 11, color: C.textSecondary, minWidth: 32, textAlign: "right" },
    roadmapLearnBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      marginTop: 16, paddingVertical: 12, borderRadius: 14,
      borderWidth: 1, borderColor: "#00D4FF44", gap: 8,
    },
    roadmapLearnBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#00D4FF" },
    tipCard: {
      flexDirection: "row", gap: 14, alignItems: "flex-start",
      backgroundColor: C.card, borderRadius: 16, padding: 16,
      borderWidth: 1, overflow: "hidden",
    },
    tipIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    tipLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.textSecondary, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 },
    tipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.text, lineHeight: 19 },
    sheetCard: {
      width: 160, backgroundColor: C.card, borderRadius: 18,
      padding: 16, borderWidth: 1, borderColor: C.cardBorder,
      overflow: "hidden", gap: 10,
    },
    sheetIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    sheetTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: C.text },
    sheetSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: C.textSecondary, lineHeight: 15 },
    sheetTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    sheetTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  });
}
