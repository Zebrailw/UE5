import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import {
  PracticeChallenge,
  DIFFICULTY_COLORS,
  getRandomChallenge,
  checkAnswer,
} from "@/data/practice";

const C = Colors.dark;

type Stage = "task" | "answering" | "result";

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [challenge, setChallenge] = useState<PracticeChallenge>(() => getRandomChallenge());
  const [answer, setAnswer] = useState("");
  const [stage, setStage] = useState<Stage>("task");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim]);

  const handleSubmit = useCallback(() => {
    if (!answer.trim()) return;
    const correct = checkAnswer(challenge, answer);
    setIsCorrect(correct);
    setStage("result");
    if (correct) {
      setStreak((s) => s + 1);
      setTotalSolved((t) => t + 1);
      pulse();
    } else {
      setStreak(0);
      shake();
    }
  }, [answer, challenge, pulse, shake]);

  const handleNext = useCallback(() => {
    const next = getRandomChallenge(challenge.id);
    setChallenge(next);
    setAnswer("");
    setStage("task");
    setShowHint(false);
  }, [challenge.id]);

  const handleSkip = useCallback(() => {
    setStreak(0);
    handleNext();
  }, [handleNext]);

  const diffColor = DIFFICULTY_COLORS[challenge.difficulty];
  const tabBarHeight = isWeb ? 84 : insets.bottom + 50;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: isWeb ? 67 : insets.top + 12, paddingBottom: tabBarHeight + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Практика</Text>
            <Text style={styles.headerSub}>Blueprint-задания</Text>
          </View>
          <View style={styles.statsRow}>
            {streak > 1 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak}</Text>
              </View>
            )}
            <View style={styles.solvedBadge}>
              <Feather name="check-circle" size={13} color={C.success} />
              <Text style={styles.solvedText}>{totalSolved}</Text>
            </View>
          </View>
        </View>

        {/* Challenge Card */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }, { scale: pulseAnim }] }}>
          <LinearGradient
            colors={["#141C28", "#0F1620"]}
            style={styles.card}
          >
            {/* Category + Difficulty */}
            <View style={styles.cardMeta}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{challenge.category}</Text>
              </View>
              <View style={[styles.difficultyTag, { borderColor: diffColor }]}>
                <Text style={[styles.difficultyText, { color: diffColor }]}>
                  {challenge.difficulty}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.challengeTitle}>{challenge.title}</Text>

            {/* Description */}
            <Text style={styles.challengeDesc}>{challenge.description}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Task */}
            <View style={styles.taskBox}>
              <Feather name="terminal" size={14} color={C.tint} style={{ marginRight: 6 }} />
              <Text style={styles.taskText}>{challenge.task}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Hint */}
        {stage !== "result" && (
          <TouchableOpacity
            style={styles.hintToggle}
            onPress={() => setShowHint((h) => !h)}
            activeOpacity={0.7}
          >
            <Feather name="help-circle" size={15} color={C.warning} />
            <Text style={styles.hintToggleText}>{showHint ? "Скрыть подсказку" : "Показать подсказку"}</Text>
          </TouchableOpacity>
        )}
        {showHint && stage !== "result" && (
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel}>Подсказка</Text>
            <Text style={styles.hintText}>{challenge.hint}</Text>
          </View>
        )}

        {/* Answer Input */}
        {stage !== "result" && (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Твой ответ</Text>
            <TextInput
              style={styles.input}
              value={answer}
              onChangeText={setAnswer}
              placeholder={challenge.placeholder}
              placeholderTextColor={C.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
                <Feather name="skip-forward" size={15} color={C.textSecondary} />
                <Text style={styles.skipText}>Пропустить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, !answer.trim() && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!answer.trim()}
              >
                <LinearGradient
                  colors={answer.trim() ? ["#00D4FF", "#0099CC"] : ["#1E2D42", "#1E2D42"]}
                  style={styles.submitGrad}
                >
                  <Text style={[styles.submitText, !answer.trim() && { color: C.textTertiary }]}>
                    Проверить
                  </Text>
                  <Feather name="arrow-right" size={16} color={answer.trim() ? "#0A0E14" : C.textTertiary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Result */}
        {stage === "result" && (
          <View style={styles.resultSection}>
            <LinearGradient
              colors={isCorrect ? ["rgba(57,211,83,0.12)", "rgba(57,211,83,0.04)"] : ["rgba(255,71,87,0.12)", "rgba(255,71,87,0.04)"]}
              style={[styles.resultCard, { borderColor: isCorrect ? C.success : C.error }]}
            >
              <View style={styles.resultHeader}>
                <View style={[styles.resultIcon, { backgroundColor: isCorrect ? "rgba(57,211,83,0.2)" : "rgba(255,71,87,0.2)" }]}>
                  <Feather name={isCorrect ? "check" : "x"} size={22} color={isCorrect ? C.success : C.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: isCorrect ? C.success : C.error }]}>
                    {isCorrect ? "Правильно!" : "Не совсем..."}
                  </Text>
                  <Text style={styles.resultSub}>
                    {isCorrect ? "Отличная работа с нодами!" : "Посмотри пример решения ниже"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.explanationLabel}>Объяснение</Text>
              <Text style={styles.explanationText}>{challenge.explanation}</Text>

              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>Пример решения</Text>
                <Text style={styles.exampleCode}>{challenge.exampleSolution}</Text>
              </View>

              {!isCorrect && (
                <View style={styles.yourAnswerBox}>
                  <Text style={styles.yourAnswerLabel}>Твой ответ</Text>
                  <Text style={styles.yourAnswerText}>{answer}</Text>
                </View>
              )}
            </LinearGradient>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
              <LinearGradient colors={["#00D4FF", "#0099CC"]} style={styles.nextGrad}>
                <Text style={styles.nextText}>Следующее задание</Text>
                <Feather name="arrow-right" size={18} color="#0A0E14" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  streakBadge: {
    backgroundColor: "rgba(255,107,53,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.3)",
  },
  streakText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B35",
  },
  solvedBadge: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: "rgba(57,211,83,0.1)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(57,211,83,0.25)",
  },
  solvedText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.success,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 12,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: "rgba(0,212,255,0.1)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
  },
  categoryText: {
    fontSize: 12,
    color: C.tint,
    fontWeight: "600",
  },
  difficultyTag: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
  },
  challengeDesc: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: C.cardBorder,
  },
  taskBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,212,255,0.06)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.15)",
  },
  taskText: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    lineHeight: 19,
  },
  hintToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  hintToggleText: {
    fontSize: 13,
    color: C.warning,
    fontWeight: "500",
  },
  hintBox: {
    backgroundColor: "rgba(255,184,0,0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.2)",
    gap: 6,
  },
  hintLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.warning,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  hintText: {
    fontSize: 13,
    color: C.text,
    lineHeight: 19,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  inputSection: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSecondary,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: C.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    color: C.text,
    fontSize: 14,
    minHeight: 110,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 20,
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.backgroundSecondary,
  },
  skipText: {
    fontSize: 14,
    color: C.textSecondary,
    fontWeight: "500",
  },
  submitBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitBtnDisabled: {},
  submitGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A0E14",
  },
  resultSection: {
    gap: 14,
  },
  resultCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  resultIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  resultSub: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  explanationText: {
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
  },
  exampleBox: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 6,
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.tint,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  exampleCode: {
    fontSize: 13,
    color: C.tint,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 19,
  },
  yourAnswerBox: {
    backgroundColor: "rgba(255,71,87,0.06)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,71,87,0.2)",
    gap: 6,
  },
  yourAnswerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF4757",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  yourAnswerText: {
    fontSize: 13,
    color: C.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 19,
  },
  nextBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  nextGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0E14",
  },
});
