import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import BlueprintBuilder from "@/components/BlueprintBuilder";
import {
  BLUEPRINT_CHALLENGES,
  BlueprintChallenge,
  getRandomChallenge,
  getDailyChallenge,
} from "@/data/blueprintChallenges";
import { BuildConnection, MODULES } from "@/data/curriculum";

const STORAGE_KEY = "@ue5_practice_stats";
const HISTORY_SIZE = 5;

const DIFFICULTY_FILTERS = ["all", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"] as const;
type DifficultyFilter = typeof DIFFICULTY_FILTERS[number];

const DIFF_LABELS: Record<DifficultyFilter, string> = {
  all: "Все",
  Beginner: "Новичок",
  Basic: "Базовый",
  Intermediate: "Средний",
  Advanced: "Сложный",
  Expert: "Эксперт",
};

const DIFF_COLORS: Record<string, string> = {
  Beginner: "#00D4FF",
  Basic: "#39D353",
  Intermediate: "#FFB800",
  Advanced: "#FF6B35",
  Expert: "#FF4757",
};

type PracticeMode = "blueprint" | "quiz";
type Stage = "intro" | "building" | "result";
type QuizStage = "picking" | "question" | "finished";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  lessonTitle: string;
}

interface PracticeStats {
  streak: number;
  totalSolved: number;
  xpEarned: number;
  totalQuizCorrect: number;
  lastDate: string | null;
}

function pickQuizQuestions(count: number): QuizQuestion[] {
  const all: QuizQuestion[] = [];
  for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
      for (const q of lesson.quizQuestions) {
        all.push({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          lessonTitle: lesson.title,
        });
      }
    }
  }
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function PracticeScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const tabBarHeight = isWeb ? 84 : insets.bottom + 50;

  const [mode, setMode] = useState<PracticeMode>("blueprint");
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>("all");
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const [challenge, setChallenge] = useState<BlueprintChallenge>(() =>
    getRandomChallenge([], "all")
  );
  const [stage, setStage] = useState<Stage>("intro");
  const [isCorrect, setIsCorrect] = useState(false);
  const [userConnections, setUserConnections] = useState<BuildConnection[]>([]);

  const [stats, setStats] = useState<PracticeStats>({
    streak: 0,
    totalSolved: 0,
    xpEarned: 0,
    totalQuizCorrect: 0,
    lastDate: null,
  });

  const [quizStage, setQuizStage] = useState<QuizStage>("picking");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);

  const dailyChallenge = useMemo(() => getDailyChallenge(), []);
  const todayStr = new Date().toDateString();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as PracticeStats;
          if (saved.lastDate !== todayStr) {
            setStats({ ...saved, streak: saved.streak });
          } else {
            setStats(saved);
          }
        } catch {}
      }
    });
  }, []);

  const saveStats = useCallback((updated: PracticeStats) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setStats(updated);
  }, []);

  const pickNextChallenge = useCallback(
    (currentId: string, diff: DifficultyFilter) => {
      const newHistory = [...recentIds, currentId].slice(-HISTORY_SIZE);
      setRecentIds(newHistory);
      const next = getRandomChallenge(newHistory, diff === "all" ? undefined : diff);
      setChallenge(next);
    },
    [recentIds]
  );

  const handleStart = useCallback(() => {
    setStage("building");
    setUserConnections([]);
  }, []);

  const handleStartDaily = useCallback(() => {
    setChallenge(dailyChallenge);
    setStage("building");
    setUserConnections([]);
    setIsCorrect(false);
  }, [dailyChallenge]);

  const handleCheck = useCallback(
    (connections: BuildConnection[]) => {
      setUserConnections(connections);
      const solution = challenge.buildChallenge.solution;
      const correct =
        connections.length >= solution.length &&
        solution.every((sol) =>
          connections.some(
            (c) =>
              c.fromNodeId === sol.fromNodeId &&
              c.fromPinId === sol.fromPinId &&
              c.toNodeId === sol.toNodeId &&
              c.toPinId === sol.toPinId
          )
        );
      setIsCorrect(correct);
      setStage("result");
      if (correct) {
        const updated: PracticeStats = {
          ...stats,
          streak: stats.streak + 1,
          totalSolved: stats.totalSolved + 1,
          xpEarned: stats.xpEarned + challenge.xpReward,
          lastDate: todayStr,
        };
        saveStats(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const updated: PracticeStats = { ...stats, streak: 0, lastDate: todayStr };
        saveStats(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [challenge, stats, saveStats, todayStr]
  );

  const handleNext = useCallback(() => {
    pickNextChallenge(challenge.id, diffFilter);
    setStage("intro");
    setUserConnections([]);
    setIsCorrect(false);
  }, [challenge.id, diffFilter, pickNextChallenge]);

  const handleRetry = useCallback(() => {
    setStage("building");
    setUserConnections([]);
    setIsCorrect(false);
  }, []);

  const handleDiffChange = useCallback(
    (diff: DifficultyFilter) => {
      setDiffFilter(diff);
      const next = getRandomChallenge(recentIds, diff === "all" ? undefined : diff);
      setChallenge(next);
      setStage("intro");
      setUserConnections([]);
      setIsCorrect(false);
    },
    [recentIds]
  );

  const handleStartQuiz = useCallback((count: number) => {
    const questions = pickQuizQuestions(count);
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizAnswers([]);
    setSelectedOption(null);
    setShowQuizAnswer(false);
    setQuizStage("question");
  }, []);

  const handleQuizSelect = useCallback(
    async (idx: number) => {
      if (showQuizAnswer) return;
      setSelectedOption(idx);
      setShowQuizAnswer(true);
      const correct = idx === quizQuestions[quizIndex].correctIndex;
      if (correct) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setQuizAnswers((prev) => [...prev, correct]);
    },
    [showQuizAnswer, quizQuestions, quizIndex]
  );

  const handleQuizNext = useCallback(() => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((i) => i + 1);
      setSelectedOption(null);
      setShowQuizAnswer(false);
    } else {
      setQuizStage("finished");
      const correct = [...quizAnswers].filter(Boolean).length;
      const updated: PracticeStats = {
        ...stats,
        totalQuizCorrect: stats.totalQuizCorrect + correct,
        lastDate: todayStr,
      };
      saveStats(updated);
    }
  }, [quizIndex, quizQuestions.length, quizAnswers, stats, saveStats, todayStr]);

  const diffColor = DIFF_COLORS[challenge.difficulty] || C.tint;

  const topPad = isWeb ? 67 : insets.top + 12;

  return (
    <View style={styles.root}>
      {mode === "blueprint" && stage !== "building" && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.container, { paddingTop: topPad, paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Практика</Text>
              <Text style={styles.headerSub}>Blueprint редактор · Квиз</Text>
            </View>
            <View style={styles.statsRow}>
              {stats.streak > 1 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>🔥 {stats.streak}</Text>
                </View>
              )}
              <View style={styles.solvedBadge}>
                <Feather name="check-circle" size={13} color={C.success} />
                <Text style={styles.solvedText}>{stats.totalSolved}</Text>
              </View>
              {stats.xpEarned > 0 && (
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{stats.xpEarned} XP</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.modeTabs}>
            <Pressable style={[styles.modeTab]} onPress={() => setMode("blueprint")}>
              <Feather name="git-merge" size={14} color={C.textSecondary} />
              <Text style={styles.modeTabText}>Blueprint</Text>
            </Pressable>
            <Pressable style={[styles.modeTab, styles.modeTabActive]}>
              <Feather name="help-circle" size={14} color={C.tint} />
              <Text style={[styles.modeTabText, { color: C.tint }]}>Квиз</Text>
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.delay(60)}>
            <Pressable style={styles.dailyCard} onPress={handleStartDaily}>
              <LinearGradient
                colors={["#7B4FFF33", "#00D4FF11"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.dailyLeft}>
                <View style={styles.dailyIconBox}>
                  <Feather name="calendar" size={18} color="#7B4FFF" />
                </View>
                <View>
                  <Text style={styles.dailyLabel}>Задание дня</Text>
                  <Text style={styles.dailyTitle} numberOfLines={1}>{dailyChallenge.title}</Text>
                  <Text style={styles.dailyDiff}>{dailyChallenge.difficulty} · +{dailyChallenge.xpReward} XP</Text>
                </View>
              </View>
              <Feather name="play-circle" size={26} color="#7B4FFF" />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.sectionLabel}>ФИЛЬТР ПО СЛОЖНОСТИ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterRow}>
                {DIFFICULTY_FILTERS.map((d) => {
                  const active = diffFilter === d;
                  const color = d === "all" ? C.tint : DIFF_COLORS[d];
                  return (
                    <Pressable
                      key={d}
                      style={[
                        styles.filterChip,
                        active && { backgroundColor: color + "22", borderColor: color + "66" },
                      ]}
                      onPress={() => handleDiffChange(d)}
                    >
                      <Text style={[styles.filterChipText, active && { color }]}>
                        {DIFF_LABELS[d]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140)}>
            <LinearGradient colors={["#141C28", "#0F1620"]} style={styles.card}>
              <View style={styles.cardMeta}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{challenge.category}</Text>
                </View>
                <View style={[styles.difficultyTag, { borderColor: diffColor + "80", backgroundColor: diffColor + "15" }]}>
                  <Text style={[styles.difficultyText, { color: diffColor }]}>{challenge.difficulty}</Text>
                </View>
                <View style={styles.xpTag}>
                  <Text style={styles.xpTagText}>+{challenge.xpReward} XP</Text>
                </View>
              </View>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDesc}>{challenge.description}</Text>
              <View style={styles.divider} />
              <View style={styles.instructionBox}>
                <Feather name="git-merge" size={14} color={C.tint} style={{ marginRight: 6, marginTop: 1 }} />
                <Text style={styles.instructionText}>{challenge.buildChallenge.instruction}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160)}>
            <Text style={styles.sectionLabel}>НОДЫ ДЛЯ СОЕДИНЕНИЯ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.previewRow}>
                {challenge.buildChallenge.nodes.map((node, idx) => {
                  const nc = { event: "#B71C1C", function: "#1565C0", flow: "#4A148C", value: "#1B5E20", variable: "#E65100" }[node.nodeType] || "#333";
                  return (
                    <React.Fragment key={node.id}>
                      <View style={[styles.previewNode, { borderColor: nc + "80" }]}>
                        <View style={[styles.previewNodeHeader, { backgroundColor: nc }]}>
                          <Text style={styles.previewNodeTitle} numberOfLines={1}>{node.title}</Text>
                        </View>
                        <View style={styles.previewNodeBody}>
                          {node.outputs.map((pin) => (
                            <Text key={pin.id} style={styles.previewPin}>▷ {pin.label}</Text>
                          ))}
                        </View>
                      </View>
                      {idx < challenge.buildChallenge.nodes.length - 1 && (
                        <View style={styles.previewArrow}>
                          <Feather name="arrow-right" size={16} color={C.textTertiary} />
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>

          {stage === "result" && (
            <Animated.View entering={FadeIn.duration(300)}>
              <LinearGradient
                colors={isCorrect ? ["rgba(57,211,83,0.12)", "rgba(57,211,83,0.04)"] : ["rgba(255,71,87,0.12)", "rgba(255,71,87,0.04)"]}
                style={[styles.resultCard, { borderColor: isCorrect ? C.success : C.error }]}
              >
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: isCorrect ? "rgba(57,211,83,0.2)" : "rgba(255,71,87,0.2)" }]}>
                    <Feather name={isCorrect ? "check" : "x"} size={24} color={isCorrect ? C.success : C.error} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultTitle, { color: isCorrect ? C.success : C.error }]}>
                      {isCorrect ? "Правильно!" : "Не совсем верно..."}
                    </Text>
                    <Text style={styles.resultSub}>
                      {isCorrect ? `+${challenge.xpReward} XP · Серия: ${stats.streak} 🔥` : "Проверь направление соединений"}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <Text style={styles.solutionLabel}>ПРАВИЛЬНОЕ РЕШЕНИЕ</Text>
                {challenge.buildChallenge.solution.map((conn, idx) => (
                  <View key={idx} style={styles.connRow}>
                    <View style={styles.connBadge}><Text style={styles.connBadgeText}>{conn.fromNodeId}</Text></View>
                    <Feather name="arrow-right" size={12} color={C.tint} />
                    <View style={styles.connBadge}><Text style={styles.connBadgeText}>{conn.toNodeId}</Text></View>
                    <Text style={styles.connPins}>({conn.fromPinId} → {conn.toPinId})</Text>
                  </View>
                ))}
                <View style={styles.resultActions}>
                  {!isCorrect && (
                    <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
                      <Feather name="refresh-ccw" size={15} color={C.tint} />
                      <Text style={styles.retryText}>Попробовать снова</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
                    <LinearGradient colors={["#00D4FF", "#0099CC"]} style={styles.nextGrad}>
                      <Text style={styles.nextText}>Следующее задание</Text>
                      <Feather name="arrow-right" size={18} color="#0A0E14" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {stage === "intro" && (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.startSection}>
              <View style={styles.hintBox}>
                <Feather name="info" size={14} color={C.warning} />
                <Text style={styles.hintText}>{challenge.buildChallenge.hint}</Text>
              </View>
              <TouchableOpacity onPress={handleStart} activeOpacity={0.85} style={styles.startBtn}>
                <LinearGradient colors={["#00D4FF", "#0099CC"]} style={styles.startGrad}>
                  <Feather name="git-merge" size={18} color="#0A0E14" />
                  <Text style={styles.startText}>Открыть Blueprint редактор</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.skipBtn}>
                <Feather name="skip-forward" size={14} color={C.textSecondary} />
                <Text style={styles.skipText}>Пропустить задание</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(220)}>
            <View style={styles.statsCard}>
              <Text style={styles.statsCardTitle}>Моя статистика</Text>
              <View style={styles.statsGrid}>
                {[
                  { icon: "check-circle", label: "Решено", value: stats.totalSolved, color: C.success },
                  { icon: "zap", label: "XP заработано", value: stats.xpEarned, color: C.warning },
                  { icon: "help-circle", label: "Квиз верно", value: stats.totalQuizCorrect, color: C.tint },
                  { icon: "trending-up", label: "Серия", value: stats.streak, color: "#FF6B35" },
                ].map((s) => (
                  <View key={s.label} style={[styles.statItem, { borderColor: s.color + "33" }]}>
                    <Feather name={s.icon as any} size={16} color={s.color} />
                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      )}

      {mode === "blueprint" && stage === "building" && (
        <View style={[styles.builderWrap, { paddingTop: isWeb ? 67 : insets.top, paddingBottom: tabBarHeight }]}>
          <View style={styles.builderHeader}>
            <TouchableOpacity onPress={() => setStage("intro")} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={C.tint} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.builderTitle}>{challenge.title}</Text>
              <Text style={styles.builderSubtitle}>{challenge.buildChallenge.instruction}</Text>
            </View>
            <View style={[styles.diffBadgeMini, { backgroundColor: diffColor + "22" }]}>
              <Text style={[styles.diffBadgeMiniText, { color: diffColor }]}>{challenge.difficulty}</Text>
            </View>
          </View>
          <BlueprintBuilder challenge={challenge.buildChallenge} onComplete={handleCheck} />
        </View>
      )}

      {mode === "quiz" && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.container, { paddingTop: topPad, paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Быстрый квиз</Text>
              <Text style={styles.headerSub}>Случайные вопросы из всех уроков</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.solvedBadge}>
                <Feather name="help-circle" size={13} color={C.tint} />
                <Text style={[styles.solvedText, { color: C.tint }]}>{stats.totalQuizCorrect}</Text>
              </View>
            </View>
          </View>

          <View style={styles.modeTabs}>
            <Pressable style={[styles.modeTab]} onPress={() => setMode("blueprint")}>
              <Feather name="git-merge" size={14} color={C.textSecondary} />
              <Text style={styles.modeTabText}>Blueprint</Text>
            </Pressable>
            <Pressable style={[styles.modeTab, styles.modeTabActive]}>
              <Feather name="help-circle" size={14} color={C.tint} />
              <Text style={[styles.modeTabText, { color: C.tint }]}>Квиз</Text>
            </Pressable>
          </View>

          {quizStage === "picking" && (
            <Animated.View entering={FadeInDown.delay(60)} style={{ gap: 12 }}>
              <Text style={styles.sectionLabel}>ВЫБЕРИ КОЛИЧЕСТВО ВОПРОСОВ</Text>
              {[
                { count: 5, label: "Быстрый", sub: "5 вопросов · ~3 мин", color: C.success },
                { count: 10, label: "Стандартный", sub: "10 вопросов · ~6 мин", color: C.tint },
                { count: 20, label: "Марафон", sub: "20 вопросов · ~12 мин", color: C.warning },
              ].map((opt) => (
                <Pressable
                  key={opt.count}
                  style={({ pressed }) => [
                    styles.quizPickCard,
                    { borderColor: opt.color + "44" },
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => handleStartQuiz(opt.count)}
                >
                  <LinearGradient
                    colors={[opt.color + "18", "transparent"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={[styles.quizPickIcon, { backgroundColor: opt.color + "22" }]}>
                    <Feather name="help-circle" size={22} color={opt.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.quizPickTitle, { color: C.text }]}>{opt.label}</Text>
                    <Text style={[styles.quizPickSub, { color: C.textSecondary }]}>{opt.sub}</Text>
                  </View>
                  <Feather name="play" size={18} color={opt.color} />
                </Pressable>
              ))}

              <View style={[styles.statsCard, { marginTop: 8 }]}>
                <Text style={styles.statsCardTitle}>Из всех разделов курса</Text>
                <View style={styles.topicRow}>
                  {MODULES.slice(0, 6).map((m) => (
                    <View key={m.id} style={[styles.topicChip, { backgroundColor: m.color + "22", borderColor: m.color + "44" }]}>
                      <Text style={[styles.topicChipText, { color: m.color }]}>{m.title}</Text>
                    </View>
                  ))}
                  <View style={[styles.topicChip, { backgroundColor: C.backgroundTertiary, borderColor: C.cardBorder }]}>
                    <Text style={styles.topicChipText}>и ещё...</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {quizStage === "question" && quizQuestions.length > 0 && (
            <Animated.View entering={FadeIn.duration(250)} style={{ gap: 12 }}>
              <View style={styles.quizProgressRow}>
                <Text style={styles.quizProgressText}>{quizIndex + 1} / {quizQuestions.length}</Text>
                <View style={styles.quizProgressTrack}>
                  <View
                    style={[
                      styles.quizProgressFill,
                      { width: `${((quizIndex + (showQuizAnswer ? 1 : 0)) / quizQuestions.length) * 100}%` },
                    ]}
                  />
                </View>
                <View style={[styles.solvedBadge, { backgroundColor: C.success + "18" }]}>
                  <Feather name="check" size={12} color={C.success} />
                  <Text style={[styles.solvedText, { color: C.success }]}>
                    {quizAnswers.filter(Boolean).length}
                  </Text>
                </View>
              </View>

              <View style={styles.quizSourceBadge}>
                <Feather name="book-open" size={12} color={C.textTertiary} />
                <Text style={styles.quizSourceText}>{quizQuestions[quizIndex].lessonTitle}</Text>
              </View>

              <View style={styles.quizQuestionCard}>
                <Text style={styles.quizQuestion}>{quizQuestions[quizIndex].question}</Text>
              </View>

              <View style={{ gap: 8 }}>
                {quizQuestions[quizIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOpt = idx === quizQuestions[quizIndex].correctIndex;
                  let bg = C.card;
                  let border = C.cardBorder;
                  let textColor = C.text;
                  if (showQuizAnswer) {
                    if (isCorrectOpt) { bg = C.success + "20"; border = C.success + "66"; textColor = C.success; }
                    else if (isSelected) { bg = C.error + "20"; border = C.error + "66"; textColor = C.error; }
                  } else if (isSelected) {
                    border = C.tint;
                  }
                  return (
                    <Pressable
                      key={idx}
                      style={[styles.quizOption, { backgroundColor: bg, borderColor: border }]}
                      onPress={() => handleQuizSelect(idx)}
                      disabled={showQuizAnswer}
                    >
                      <View style={[styles.optLetter, {
                        backgroundColor: showQuizAnswer && isCorrectOpt ? C.success + "33" : showQuizAnswer && isSelected ? C.error + "33" : C.backgroundTertiary,
                      }]}>
                        <Text style={[styles.optLetterText, {
                          color: showQuizAnswer && isCorrectOpt ? C.success : showQuizAnswer && isSelected ? C.error : C.textSecondary,
                        }]}>
                          {["А", "Б", "В", "Г"][idx]}
                        </Text>
                      </View>
                      <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                      {showQuizAnswer && isCorrectOpt && <Feather name="check-circle" size={16} color={C.success} />}
                      {showQuizAnswer && isSelected && !isCorrectOpt && <Feather name="x-circle" size={16} color={C.error} />}
                    </Pressable>
                  );
                })}
              </View>

              {showQuizAnswer && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.explanationCard}>
                  <View style={styles.explanationHeader}>
                    <Feather
                      name={quizAnswers[quizAnswers.length - 1] ? "check-circle" : "info"}
                      size={15}
                      color={quizAnswers[quizAnswers.length - 1] ? C.success : C.warning}
                    />
                    <Text style={[styles.explanationTitle, { color: quizAnswers[quizAnswers.length - 1] ? C.success : C.warning }]}>
                      {quizAnswers[quizAnswers.length - 1] ? "Правильно!" : "Объяснение"}
                    </Text>
                  </View>
                  <Text style={styles.explanationText}>{quizQuestions[quizIndex].explanation}</Text>
                </Animated.View>
              )}

              {showQuizAnswer && (
                <Animated.View entering={FadeInDown.delay(100)}>
                  <TouchableOpacity style={styles.nextBtn} onPress={handleQuizNext} activeOpacity={0.85}>
                    <LinearGradient colors={["#00D4FF", "#0099CC"]} style={styles.nextGrad}>
                      <Text style={styles.nextText}>
                        {quizIndex < quizQuestions.length - 1 ? "Следующий вопрос" : "Завершить квиз"}
                      </Text>
                      <Feather name={quizIndex < quizQuestions.length - 1 ? "arrow-right" : "check"} size={18} color="#0A0E14" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          )}

          {quizStage === "finished" && (
            <Animated.View entering={ZoomIn.duration(400)} style={{ gap: 16 }}>
              {(() => {
                const correct = quizAnswers.filter(Boolean).length;
                const pct = Math.round((correct / quizQuestions.length) * 100);
                const isPerfect = pct === 100;
                const isPassing = pct >= 60;
                const resultColor = isPerfect ? C.warning : isPassing ? C.success : C.error;
                return (
                  <>
                    <View style={[styles.quizResultCard, { borderColor: resultColor + "44" }]}>
                      <LinearGradient
                        colors={[resultColor + "22", "transparent"]}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={[styles.scoreCircle, { borderColor: resultColor, backgroundColor: resultColor + "18" }]}>
                        <Text style={[styles.scorePercent, { color: resultColor }]}>{pct}%</Text>
                        <Text style={styles.scoreLabel}>Результат</Text>
                      </View>
                      <Text style={[styles.resultTitle, { color: C.text, fontSize: 22 }]}>
                        {isPerfect ? "Идеально! 🎯" : isPassing ? "Отлично! 👍" : "Продолжай учиться"}
                      </Text>
                      <Text style={[styles.resultSub, { color: C.textSecondary, fontSize: 14 }]}>
                        {correct} из {quizQuestions.length} правильных ответов
                      </Text>
                    </View>

                    <View style={styles.resultActions}>
                      <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => { setQuizStage("picking"); setQuizAnswers([]); setQuizIndex(0); }}
                        activeOpacity={0.8}
                      >
                        <Feather name="refresh-cw" size={15} color={C.tint} />
                        <Text style={styles.retryText}>Новый квиз</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.nextBtn}
                        onPress={() => setMode("blueprint")}
                        activeOpacity={0.85}
                      >
                        <LinearGradient colors={["#00D4FF", "#0099CC"]} style={styles.nextGrad}>
                          <Text style={styles.nextText}>К Blueprint</Text>
                          <Feather name="git-merge" size={16} color="#0A0E14" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              })()}
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    scroll: { flex: 1 },
    container: { paddingHorizontal: 16, gap: 14 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.text, letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: C.textSecondary, marginTop: 1, fontFamily: "Inter_400Regular" },
    statsRow: { flexDirection: "row", gap: 6, alignItems: "center" },
    streakBadge: {
      backgroundColor: "rgba(255,107,53,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
      borderWidth: 1, borderColor: "rgba(255,107,53,0.3)",
    },
    streakText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FF6B35" },
    solvedBadge: {
      flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: C.success + "18",
      borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.success + "33",
    },
    solvedText: { fontSize: 12, fontFamily: "Inter_700Bold", color: C.success },
    xpBadge: {
      backgroundColor: C.warning + "18", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
      borderWidth: 1, borderColor: C.warning + "33",
    },
    xpText: { fontSize: 12, fontFamily: "Inter_700Bold", color: C.warning },
    modeTabs: {
      flexDirection: "row", backgroundColor: C.card, borderRadius: 12, padding: 4,
      borderWidth: 1, borderColor: C.cardBorder, gap: 4,
    },
    modeTab: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 6, paddingVertical: 10, borderRadius: 8,
    },
    modeTabActive: { backgroundColor: C.backgroundTertiary },
    modeTabText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.textSecondary },
    dailyCard: {
      flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: "#7B4FFF44", overflow: "hidden", gap: 12,
    },
    dailyLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
    dailyIconBox: {
      width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center",
      backgroundColor: "#7B4FFF22", borderWidth: 1, borderColor: "#7B4FFF44",
    },
    dailyLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#7B4FFF", marginBottom: 2 },
    dailyTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: C.text },
    dailyDiff: { fontFamily: "Inter_400Regular", fontSize: 11, color: C.textSecondary },
    sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: C.textTertiary, letterSpacing: 0.8, marginBottom: 4 },
    filterScroll: { flexGrow: 0 },
    filterRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
    filterChip: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
      borderColor: C.cardBorder, backgroundColor: C.card,
    },
    filterChipText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: C.textSecondary },
    card: { borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.cardBorder, gap: 12 },
    cardMeta: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
    categoryTag: {
      backgroundColor: C.tint + "18", borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3,
      borderWidth: 1, borderColor: C.tint + "33",
    },
    categoryText: { fontSize: 11, color: C.tint, fontFamily: "Inter_600SemiBold" },
    difficultyTag: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1 },
    difficultyText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    xpTag: {
      backgroundColor: C.warning + "18", borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3,
      borderWidth: 1, borderColor: C.warning + "33",
    },
    xpTagText: { fontSize: 11, color: C.warning, fontFamily: "Inter_600SemiBold" },
    challengeTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#E8ECF0", letterSpacing: -0.3 },
    challengeDesc: { fontSize: 14, color: "#8B9BB4", lineHeight: 21, fontFamily: "Inter_400Regular" },
    divider: { height: 1, backgroundColor: C.cardBorder },
    instructionBox: {
      flexDirection: "row", alignItems: "flex-start", backgroundColor: C.tint + "0F",
      borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.tint + "28",
    },
    instructionText: { flex: 1, fontSize: 13, color: "#C8D0DC", lineHeight: 19, fontFamily: "Inter_400Regular" },
    previewRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
    previewNode: { borderRadius: 8, borderWidth: 1.5, overflow: "hidden", minWidth: 90, maxWidth: 130 },
    previewNodeHeader: { paddingHorizontal: 8, paddingVertical: 5 },
    previewNodeTitle: {
      fontSize: 10, color: "#FFF", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontWeight: "700",
    },
    previewNodeBody: { backgroundColor: "#111820", paddingHorizontal: 8, paddingVertical: 5, gap: 2 },
    previewPin: { fontSize: 9, color: "#8B9BB4", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
    previewArrow: { width: 28, alignItems: "center" },
    hintBox: {
      flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: C.warning + "14",
      borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.warning + "33",
    },
    hintText: { flex: 1, fontSize: 13, color: C.text, lineHeight: 19, fontFamily: "Inter_400Regular" },
    startSection: { gap: 10 },
    startBtn: { borderRadius: 14, overflow: "hidden" },
    startGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
    startText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0A0E14" },
    skipBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
    skipText: { fontSize: 13, color: C.textSecondary, fontFamily: "Inter_400Regular" },
    resultCard: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 12 },
    resultHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
    resultIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
    resultTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
    resultSub: { fontSize: 12, color: C.textSecondary, marginTop: 2, fontFamily: "Inter_400Regular" },
    solutionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: C.textTertiary, letterSpacing: 0.6 },
    connRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
    connBadge: {
      backgroundColor: C.tint + "18", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3,
      borderWidth: 1, borderColor: C.tint + "33",
    },
    connBadgeText: {
      fontSize: 11, color: C.tint, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontWeight: "600",
    },
    connPins: { fontSize: 10, color: C.textTertiary, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
    resultActions: { gap: 8, marginTop: 4, flexDirection: "row" },
    retryBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.tint + "40", backgroundColor: C.tint + "10",
    },
    retryText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.tint },
    nextBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
    nextGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14 },
    nextText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#0A0E14" },
    statsCard: {
      backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 12,
    },
    statsCardTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: C.text },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    statItem: {
      flex: 1, minWidth: "45%", backgroundColor: C.background, borderRadius: 12, padding: 12,
      alignItems: "center", gap: 4, borderWidth: 1,
    },
    statValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: C.textSecondary, textAlign: "center" },
    builderWrap: { flex: 1, backgroundColor: C.background },
    builderHeader: {
      flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: C.cardBorder,
    },
    backBtn: { padding: 4, marginTop: 2 },
    builderTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.text },
    builderSubtitle: { fontSize: 12, color: C.textSecondary, marginTop: 2, lineHeight: 17, fontFamily: "Inter_400Regular" },
    diffBadgeMini: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 2 },
    diffBadgeMiniText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
    quizPickCard: {
      flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, padding: 16,
      borderWidth: 1, overflow: "hidden",
    },
    quizPickIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    quizPickTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 2 },
    quizPickSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
    topicRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    topicChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
    topicChipText: { fontFamily: "Inter_500Medium", fontSize: 11, color: C.textSecondary },
    quizProgressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    quizProgressText: { fontFamily: "Inter_500Medium", fontSize: 12, color: C.textSecondary, minWidth: 36 },
    quizProgressTrack: {
      flex: 1, height: 6, backgroundColor: C.backgroundTertiary, borderRadius: 3, overflow: "hidden",
    },
    quizProgressFill: { height: "100%", backgroundColor: C.tint, borderRadius: 3 },
    quizSourceBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
    quizSourceText: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textTertiary },
    quizQuestionCard: {
      backgroundColor: C.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: C.cardBorder,
    },
    quizQuestion: { fontFamily: "Inter_700Bold", fontSize: 18, color: C.text, lineHeight: 26 },
    quizOption: {
      flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14,
      borderWidth: 1,
    },
    optLetter: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    optLetterText: { fontFamily: "Inter_700Bold", fontSize: 13 },
    optText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
    explanationCard: {
      backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.cardBorder,
    },
    explanationHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    explanationTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
    explanationText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary, lineHeight: 20 },
    quizResultCard: {
      backgroundColor: C.card, borderRadius: 24, padding: 28, alignItems: "center",
      borderWidth: 1, overflow: "hidden", gap: 10,
    },
    scoreCircle: {
      width: 110, height: 110, borderRadius: 55, borderWidth: 4,
      alignItems: "center", justifyContent: "center", marginBottom: 8,
    },
    scorePercent: { fontFamily: "Inter_700Bold", fontSize: 30 },
    scoreLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary },
  });
}
