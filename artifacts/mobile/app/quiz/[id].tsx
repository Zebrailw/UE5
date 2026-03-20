import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useProgress } from "@/context/ProgressContext";
import { MODULES } from "@/data/curriculum";

const C = Colors.dark;

interface Answer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { completeLesson } = useProgress();

  const lesson = MODULES.flatMap((m) => m.lessons).find((l) => l.id === id);
  const mod = MODULES.find((m) => m.id === lesson?.moduleId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  if (!lesson || !mod) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Quiz not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const questions = lesson.quizQuestions;
  const currentQ = questions[currentIndex];
  const score = answers.filter((a) => a.isCorrect).length;
  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const handleSelect = async (optIndex: number) => {
    if (showAnswer) return;
    setSelectedOption(optIndex);
    setShowAnswer(true);

    const isCorrect = optIndex === currentQ.correctIndex;
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, selectedIndex: optIndex, isCorrect },
    ]);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setQuizFinished(true);
      await completeLesson(lesson.id, lesson.xpReward, scorePercent);
    }
  };

  const getOptionStyle = (idx: number) => {
    if (!showAnswer) {
      return selectedOption === idx ? styles.optionSelected : styles.option;
    }
    if (idx === currentQ.correctIndex) return styles.optionCorrect;
    if (idx === selectedOption && idx !== currentQ.correctIndex) return styles.optionWrong;
    return styles.option;
  };

  const getOptionTextStyle = (idx: number) => {
    if (!showAnswer) return styles.optionText;
    if (idx === currentQ.correctIndex) return styles.optionTextCorrect;
    if (idx === selectedOption && idx !== currentQ.correctIndex) return styles.optionTextWrong;
    return styles.optionText;
  };

  if (quizFinished) {
    const isPerfect = scorePercent === 100;
    const isPassing = scorePercent >= 60;

    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <Pressable
          style={[styles.backBtn, { margin: 16 }]}
          onPress={() => router.back()}
        >
          <Feather name="x" size={20} color={C.text} />
        </Pressable>

        <ScrollView contentContainerStyle={[styles.resultScroll, { paddingBottom: bottomPadding + 40 }]}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.resultHero}>
            <LinearGradient
              colors={[
                isPerfect ? C.warning + "30" : isPassing ? C.success + "20" : C.error + "20",
                "transparent",
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={[styles.scoreCircle, {
              borderColor: isPerfect ? C.warning : isPassing ? C.success : C.error,
              backgroundColor: (isPerfect ? C.warning : isPassing ? C.success : C.error) + "15",
            }]}>
              <Text style={[styles.scorePercent, {
                color: isPerfect ? C.warning : isPassing ? C.success : C.error,
              }]}>
                {scorePercent}%
              </Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
            <Text style={styles.resultTitle}>
              {isPerfect ? "Perfect!" : isPassing ? "Well done!" : "Keep practicing"}
            </Text>
            <Text style={styles.resultSubtitle}>
              {score} out of {questions.length} correct
            </Text>
            {isPerfect && (
              <View style={styles.xpBonusRow}>
                <Feather name="zap" size={15} color={C.warning} />
                <Text style={styles.xpBonusText}>+{lesson.xpReward} XP earned!</Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={styles.reviewTitle}>Question Review</Text>
            {questions.map((q, i) => {
              const ans = answers.find((a) => a.questionId === q.id);
              const isCorrect = ans?.isCorrect;
              return (
                <View key={q.id} style={[styles.reviewCard, { borderLeftColor: isCorrect ? C.success : C.error }]}>
                  <View style={styles.reviewHeader}>
                    <Feather
                      name={isCorrect ? "check-circle" : "x-circle"}
                      size={16}
                      color={isCorrect ? C.success : C.error}
                    />
                    <Text style={styles.reviewQ}>Q{i + 1}: {q.question}</Text>
                  </View>
                  <View style={[styles.reviewAnswer, { backgroundColor: C.success + "15" }]}>
                    <Text style={styles.reviewAnswerLabel}>Correct: </Text>
                    <Text style={[styles.reviewAnswerText, { color: C.success }]}>
                      {q.options[q.correctIndex]}
                    </Text>
                  </View>
                  {!isCorrect && ans && (
                    <View style={[styles.reviewAnswer, { backgroundColor: C.error + "15" }]}>
                      <Text style={styles.reviewAnswerLabel}>Your answer: </Text>
                      <Text style={[styles.reviewAnswerText, { color: C.error }]}>
                        {q.options[ans.selectedIndex]}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.reviewExplanation}>{q.explanation}</Text>
                </View>
              );
            })}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.resultActions}>
            <Pressable
              style={({ pressed }) => [styles.retakeBtn, pressed && { opacity: 0.8 }]}
              onPress={() => {
                setCurrentIndex(0);
                setAnswers([]);
                setSelectedOption(null);
                setShowAnswer(false);
                setQuizFinished(false);
              }}
            >
              <Feather name="refresh-cw" size={16} color={C.textSecondary} />
              <Text style={styles.retakeBtnText}>Retake Quiz</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.doneBtn, { backgroundColor: mod.color }, pressed && { opacity: 0.9 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.doneBtnText}>Back to Lesson</Text>
              <Feather name="arrow-right" size={16} color={C.background} />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.quizHeader}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={20} color={C.text} />
        </Pressable>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + (showAnswer ? 1 : 0)) / questions.length) * 100}%`,
                  backgroundColor: mod.color,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.scoreInfo}>
          <Feather name="check" size={13} color={C.success} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.quizScroll, { paddingBottom: bottomPadding + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={currentIndex} entering={FadeInUp.duration(300)} style={styles.questionCard}>
          <View style={[styles.qNumBadge, { backgroundColor: mod.color + "22" }]}>
            <Text style={[styles.qNumText, { color: mod.color }]}>
              Question {currentIndex + 1}
            </Text>
          </View>
          <Text style={styles.questionText}>{currentQ.question}</Text>
        </Animated.View>

        <Animated.View key={`opts-${currentIndex}`} entering={FadeInDown.delay(100).duration(300)}>
          {currentQ.options.map((opt, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                getOptionStyle(idx),
                pressed && !showAnswer && { opacity: 0.85 },
              ]}
              onPress={() => handleSelect(idx)}
              disabled={showAnswer}
            >
              <View style={[styles.optionLetter, {
                backgroundColor:
                  showAnswer && idx === currentQ.correctIndex
                    ? C.success + "33"
                    : showAnswer && idx === selectedOption && idx !== currentQ.correctIndex
                    ? C.error + "33"
                    : C.backgroundTertiary,
              }]}>
                <Text style={[styles.optionLetterText, {
                  color:
                    showAnswer && idx === currentQ.correctIndex
                      ? C.success
                      : showAnswer && idx === selectedOption && idx !== currentQ.correctIndex
                      ? C.error
                      : C.textSecondary,
                }]}>
                  {["A", "B", "C", "D"][idx]}
                </Text>
              </View>
              <Text style={getOptionTextStyle(idx)}>{opt}</Text>
              {showAnswer && idx === currentQ.correctIndex && (
                <Feather name="check-circle" size={16} color={C.success} />
              )}
              {showAnswer && idx === selectedOption && idx !== currentQ.correctIndex && (
                <Feather name="x-circle" size={16} color={C.error} />
              )}
            </Pressable>
          ))}
        </Animated.View>

        {showAnswer && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Feather
                name={answers[answers.length - 1]?.isCorrect ? "check-circle" : "info"}
                size={16}
                color={answers[answers.length - 1]?.isCorrect ? C.success : C.warning}
              />
              <Text style={[
                styles.explanationTitle,
                { color: answers[answers.length - 1]?.isCorrect ? C.success : C.warning },
              ]}>
                {answers[answers.length - 1]?.isCorrect ? "Correct!" : "Explanation"}
              </Text>
            </View>
            <Text style={styles.explanationText}>{currentQ.explanation}</Text>
          </Animated.View>
        )}

        {showAnswer && (
          <Animated.View entering={FadeInDown.delay(150)}>
            <Pressable
              style={[styles.nextBtn, { backgroundColor: mod.color }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Text>
              <Feather
                name={currentIndex < questions.length - 1 ? "arrow-right" : "check"}
                size={16}
                color={C.background}
              />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  errorContainer: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { fontFamily: "Inter_400Regular", color: C.textSecondary, fontSize: 16 },
  backLink: { fontFamily: "Inter_500Medium", color: C.tint, fontSize: 14, marginTop: 12 },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  progressInfo: { flex: 1, gap: 6 },
  progressText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.textSecondary,
    textAlign: "center",
  },
  progressTrack: {
    height: 6,
    backgroundColor: C.backgroundTertiary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  scoreInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.success + "22",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scoreText: { fontFamily: "Inter_700Bold", fontSize: 14, color: C.success },
  quizScroll: { paddingHorizontal: 20, paddingTop: 20 },
  questionCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  qNumBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  qNumText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  questionText: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    color: C.text,
    lineHeight: 28,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  optionSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.tint,
  },
  optionCorrect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.success + "18",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.success + "66",
  },
  optionWrong: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.error + "18",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.error + "66",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
  },
  optionTextCorrect: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.success,
    lineHeight: 22,
  },
  optionTextWrong: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.error,
    lineHeight: 22,
  },
  explanationCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  explanationText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 22,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  nextBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: C.background,
  },
  resultScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "center",
  },
  resultHero: {
    width: "100%",
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
  },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  scorePercent: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
  },
  scoreLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  resultTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: C.text,
    marginBottom: 6,
  },
  resultSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textSecondary,
    marginBottom: 10,
  },
  xpBonusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.warning + "22",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  xpBonusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.warning,
  },
  reviewTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: C.text,
    marginBottom: 14,
    alignSelf: "flex-start",
    width: "100%",
  },
  reviewCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderLeftWidth: 3,
    width: "100%",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  reviewQ: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
  },
  reviewAnswer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  reviewAnswerLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: C.textSecondary,
  },
  reviewAnswerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  reviewExplanation: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
    marginTop: 6,
  },
  resultActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  retakeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.textSecondary,
  },
  doneBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  doneBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.background,
  },
});
