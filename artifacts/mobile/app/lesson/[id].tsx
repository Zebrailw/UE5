import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";
import { MODULES, getDifficultyColor, getDifficultyLabel } from "@/data/curriculum";

export default function LessonScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    completeLesson,
    isLessonCompleted,
    favoriteIds,
    reviewLaterIds,
    toggleFavorite,
    toggleReviewLater,
  } = useProgress();

  const lesson = MODULES.flatMap((m) => m.lessons).find((l) => l.id === id);
  const mod = MODULES.find((m) => m.id === lesson?.moduleId);

  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const isCompleted = lesson ? isLessonCompleted(lesson.id) : false;
  const isFav = lesson ? favoriteIds.includes(lesson.id) : false;
  const isReview = lesson ? reviewLaterIds.includes(lesson.id) : false;

  if (!lesson || !mod) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Урок не найден</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeLesson(lesson.id, lesson.xpReward);
  };

  const handleStartQuiz = () => {
    router.push(`/quiz/${lesson.id}`);
  };

  const formatContent = (content: string) => {
    return content.split("\n\n").map((para, i) => {
      const bulletLines = para.split("\n").filter((l) => l.startsWith("•"));
      const codeLines = para.startsWith("```");

      if (bulletLines.length > 0 && para.split("\n")[0] && !para.split("\n")[0].startsWith("•")) {
        const header = para.split("\n")[0];
        const bullets = para.split("\n").filter((l) => l.startsWith("•"));
        const rest = para.split("\n").filter((l) => !l.startsWith("•") && l !== header);

        return (
          <View key={i} style={styles.contentBlock}>
            {header && <Text style={styles.contentHeader}>{header.replace(/\*\*/g, "")}</Text>}
            {rest.map((r, ri) => r ? <Text key={ri} style={styles.contentBody}>{r.replace(/\*\*/g, "")}</Text> : null)}
            {bullets.map((b, bi) => (
              <View key={bi} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: mod.color }]} />
                <Text style={styles.bulletText}>{b.replace("• ", "").replace(/\*\*/g, "")}</Text>
              </View>
            ))}
          </View>
        );
      }

      if (codeLines) {
        return (
          <View key={i} style={styles.codeBlock}>
            <Text style={styles.codeText}>{para.replace(/```/g, "").trim()}</Text>
          </View>
        );
      }

      return (
        <View key={i} style={styles.contentBlock}>
          <Text style={styles.contentBody}>{para.replace(/\*\*/g, "")}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <LinearGradient
          colors={[mod.color + "18", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={C.text} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerAction}
            onPress={() => toggleFavorite(lesson.id)}
          >
            <Feather name="heart" size={18} color={isFav ? "#FF4757" : C.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.headerAction}
            onPress={() => toggleReviewLater(lesson.id)}
          >
            <Feather name="bookmark" size={18} color={isReview ? C.warning : C.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 120 }]}
      >
        <Animated.View entering={FadeInDown.duration(350)} style={styles.lessonMeta}>
          <View style={styles.metaRow}>
            <View style={[styles.modBadge, { backgroundColor: mod.color + "22", borderColor: mod.color + "44" }]}>
              <Feather name={mod.icon as any} size={12} color={mod.color} />
              <Text style={[styles.modBadgeText, { color: mod.color }]}>{mod.title}</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(mod.difficulty) + "22" }]}>
              <Text style={[styles.diffText, { color: getDifficultyColor(mod.difficulty) }]}>
                {getDifficultyLabel(mod.difficulty)}
              </Text>
            </View>
            {isCompleted && (
              <View style={styles.doneBadge}>
                <Feather name="check" size={11} color={C.success} />
                <Text style={styles.doneText}>Пройдено</Text>
              </View>
            )}
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDesc}>{lesson.description}</Text>
          <View style={styles.lessonInfoRow}>
            <View style={styles.lessonInfo}>
              <Feather name="clock" size={13} color={C.textSecondary} />
              <Text style={styles.lessonInfoText}>{lesson.estimatedMinutes} мин</Text>
            </View>
            <View style={styles.lessonInfo}>
              <Feather name="zap" size={13} color={C.warning} />
              <Text style={[styles.lessonInfoText, { color: C.warning }]}>+{lesson.xpReward} XP</Text>
            </View>
            <View style={styles.lessonInfo}>
              <Feather name="help-circle" size={13} color={C.textSecondary} />
              <Text style={styles.lessonInfoText}>{lesson.quizQuestions.length} вопросов</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.tabRow}>
          {(["learn", "practice"] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.tabBtn, tab === t && [styles.tabBtnActive, { borderColor: mod.color }]]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && { color: mod.color }]}>
                {t === "learn" ? "Теория" : "Практика"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "learn" ? (
          <Animated.View entering={FadeIn.duration(250)}>
            <View style={styles.contentCard}>
              {formatContent(lesson.content)}
            </View>

            {lesson.realWorldExample && (
              <View style={[styles.exampleCard, { borderColor: mod.color + "44" }]}>
                <View style={styles.exampleHeader}>
                  <Feather name="globe" size={15} color={mod.color} />
                  <Text style={[styles.exampleLabel, { color: mod.color }]}>Реальный пример</Text>
                </View>
                <Text style={styles.exampleText}>{lesson.realWorldExample}</Text>
              </View>
            )}

            {lesson.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {lesson.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(250)}>
            {lesson.practiceTask ? (
              <View style={[styles.practiceCard, { borderColor: mod.color + "44" }]}>
                <View style={styles.practiceHeader}>
                  <Feather name="target" size={16} color={mod.color} />
                  <Text style={[styles.practiceLabel, { color: mod.color }]}>Практическое задание</Text>
                </View>
                <Text style={styles.practiceText}>{lesson.practiceTask}</Text>
                <View style={styles.practiceTip}>
                  <Feather name="info" size={13} color={C.textSecondary} />
                  <Text style={styles.practiceTipText}>
                    Открой Unreal Engine 5 и выполни это упражнение. Нет единственного верного ответа — просто исследуй!
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noPracticeCard}>
                <Feather name="code" size={28} color={C.textTertiary} />
                <Text style={styles.noPracticeText}>
                  Практика для этого урока происходит внутри Unreal Engine.
                  Изучи теорию и примени её в своём проекте.
                </Text>
              </View>
            )}

            <View style={[styles.quizPromptCard, { borderColor: mod.color + "33" }]}>
              <LinearGradient
                colors={[mod.color + "18", "transparent"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Feather name="check-circle" size={22} color={mod.color} />
              <Text style={styles.quizPromptTitle}>Проверь знания</Text>
              <Text style={styles.quizPromptDesc}>
                {lesson.quizQuestions.length} вопросов по теме «{lesson.title}»
              </Text>
              <Pressable
                style={[styles.quizBtn, { backgroundColor: mod.color }]}
                onPress={handleStartQuiz}
              >
                <Text style={styles.quizBtnText}>Начать квиз</Text>
                <Feather name="arrow-right" size={15} color={C.background} />
              </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPadding + 10 }]}>
        {!isCompleted ? (
          <Pressable
            style={({ pressed }) => [styles.completeBtn, pressed && { opacity: 0.9 }]}
            onPress={handleComplete}
          >
            <LinearGradient
              colors={[mod.color, mod.color + "CC"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.completeBtnText}>Отметить как пройденный (+{lesson.xpReward} XP)</Text>
          </Pressable>
        ) : (
          <View style={styles.completedFooter}>
            <View style={styles.completedBadge}>
              <Feather name="check-circle" size={18} color={C.success} />
              <Text style={styles.completedText}>Урок пройден</Text>
            </View>
            <Pressable
              style={[styles.quizFooterBtn, { backgroundColor: mod.color }]}
              onPress={handleStartQuiz}
            >
              <Text style={styles.quizFooterText}>Пройти квиз</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    errorContainer: {
      flex: 1,
      backgroundColor: C.background,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: { fontFamily: "Inter_400Regular", color: C.textSecondary, fontSize: 16 },
    backLink: { fontFamily: "Inter_500Medium", color: C.tint, fontSize: 14, marginTop: 12 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      overflow: "hidden",
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    headerActions: { flexDirection: "row", gap: 10 },
    headerAction: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    scrollContent: { paddingHorizontal: 20 },
    lessonMeta: { marginBottom: 20 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" },
    modBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
    },
    modBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
    diffBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    diffText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
    doneBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: C.success + "22",
    },
    doneText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.success },
    lessonTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
      color: C.text,
      marginBottom: 8,
      lineHeight: 32,
    },
    lessonDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: C.textSecondary,
      lineHeight: 22,
      marginBottom: 14,
    },
    lessonInfoRow: { flexDirection: "row", gap: 16 },
    lessonInfo: { flexDirection: "row", alignItems: "center", gap: 5 },
    lessonInfoText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary },
    tabRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
    tabBtnActive: { backgroundColor: C.backgroundTertiary, borderWidth: 1 },
    tabText: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.textSecondary },
    contentCard: {
      backgroundColor: C.card,
      borderRadius: 18,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    contentBlock: { marginBottom: 14 },
    contentHeader: { fontFamily: "Inter_700Bold", fontSize: 15, color: C.text, marginBottom: 6 },
    contentBody: { fontFamily: "Inter_400Regular", fontSize: 15, color: C.textSecondary, lineHeight: 24 },
    bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginVertical: 4 },
    bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
    bulletText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, lineHeight: 22 },
    codeBlock: {
      backgroundColor: C.backgroundTertiary,
      borderRadius: 10,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    codeText: {
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 13,
      color: C.tint,
      lineHeight: 20,
    },
    exampleCard: {
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
    },
    exampleHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    exampleLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
    exampleText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, lineHeight: 22 },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: C.backgroundTertiary,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    tagText: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary },
    practiceCard: {
      backgroundColor: C.card,
      borderRadius: 18,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
    },
    practiceHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    practiceLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
    practiceText: { fontFamily: "Inter_400Regular", fontSize: 15, color: C.text, lineHeight: 24, marginBottom: 14 },
    practiceTip: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: C.backgroundTertiary,
      borderRadius: 10,
      padding: 12,
    },
    practiceTipText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary, lineHeight: 18 },
    noPracticeCard: {
      backgroundColor: C.card,
      borderRadius: 18,
      padding: 24,
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    noPracticeText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: C.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    quizPromptCard: {
      backgroundColor: C.card,
      borderRadius: 18,
      padding: 20,
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
      borderWidth: 1,
      overflow: "hidden",
    },
    quizPromptTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: C.text },
    quizPromptDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, marginBottom: 6 },
    quizBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 4,
    },
    quizBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.background },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: C.background,
      borderTopWidth: 1,
      borderTopColor: C.cardBorder,
    },
    completeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderRadius: 16,
      paddingVertical: 16,
      overflow: "hidden",
    },
    completeBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
    completedFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    completedBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
    completedText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.success },
    quizFooterBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
    quizFooterText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.background },
  });
}
