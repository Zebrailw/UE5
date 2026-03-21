import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import BlueprintBuilder from "@/components/BlueprintBuilder";
import { BLUEPRINT_CHALLENGES, BlueprintChallenge, getRandomChallenge } from "@/data/blueprintChallenges";
import { BuildConnection } from "@/data/curriculum";

const C = Colors.dark;

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#00D4FF",
  Basic: "#39D353",
  Intermediate: "#FFB800",
  Advanced: "#FF6B35",
  Expert: "#FF4757",
};

type Stage = "intro" | "building" | "result";

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const tabBarHeight = isWeb ? 84 : insets.bottom + 50;

  const [challenge, setChallenge] = useState<BlueprintChallenge>(() => getRandomChallenge());
  const [stage, setStage] = useState<Stage>("intro");
  const [isCorrect, setIsCorrect] = useState(false);
  const [userConnections, setUserConnections] = useState<BuildConnection[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const handleStart = useCallback(() => {
    setStage("building");
    setUserConnections([]);
  }, []);

  const handleCheck = useCallback(
    (connections: BuildConnection[]) => {
      setUserConnections(connections);
      const solution = challenge.buildChallenge.solution;
      const correct =
        connections.length === solution.length &&
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
        setStreak((s) => s + 1);
        setTotalSolved((t) => t + 1);
        setXpEarned((x) => x + challenge.xpReward);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setStreak(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [challenge]
  );

  const handleNext = useCallback(() => {
    const next = getRandomChallenge(challenge.id);
    setChallenge(next);
    setStage("intro");
    setUserConnections([]);
    setIsCorrect(false);
  }, [challenge.id]);

  const handleRetry = useCallback(() => {
    setStage("building");
    setUserConnections([]);
    setIsCorrect(false);
  }, []);

  const diffColor = DIFFICULTY_COLORS[challenge.difficulty] || C.tint;

  return (
    <View style={styles.root}>
      {stage !== "building" && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: isWeb ? 67 : insets.top + 12,
              paddingBottom: tabBarHeight + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Практика</Text>
              <Text style={styles.headerSub}>Соединяй ноды как в Unreal</Text>
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
              {xpEarned > 0 && (
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{xpEarned} XP</Text>
                </View>
              )}
            </View>
          </View>

          {/* Challenge Card */}
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

          {/* Node Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>НОДЫ ДЛЯ СОЕДИНЕНИЯ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
              <View style={styles.previewRow}>
                {challenge.buildChallenge.nodes.map((node, idx) => {
                  const nodeColors: Record<string, string> = {
                    event: "#B71C1C",
                    function: "#1565C0",
                    flow: "#4A148C",
                    value: "#1B5E20",
                    variable: "#E65100",
                  };
                  const nc = nodeColors[node.nodeType] || "#333";
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
          </View>

          {/* Result */}
          {stage === "result" && (
            <LinearGradient
              colors={
                isCorrect
                  ? ["rgba(57,211,83,0.12)", "rgba(57,211,83,0.04)"]
                  : ["rgba(255,71,87,0.12)", "rgba(255,71,87,0.04)"]
              }
              style={[styles.resultCard, { borderColor: isCorrect ? C.success : C.error }]}
            >
              <View style={styles.resultHeader}>
                <View
                  style={[
                    styles.resultIcon,
                    { backgroundColor: isCorrect ? "rgba(57,211,83,0.2)" : "rgba(255,71,87,0.2)" },
                  ]}
                >
                  <Feather
                    name={isCorrect ? "check" : "x"}
                    size={24}
                    color={isCorrect ? C.success : C.error}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: isCorrect ? C.success : C.error }]}>
                    {isCorrect ? "Правильно! Ноды соединены!" : "Не совсем верно..."}
                  </Text>
                  <Text style={styles.resultSub}>
                    {isCorrect
                      ? `Получено +${challenge.xpReward} XP за Blueprint задание`
                      : "Проверь направление соединений"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.solutionLabel}>ПРАВИЛЬНОЕ РЕШЕНИЕ</Text>
              {challenge.buildChallenge.solution.map((conn, idx) => (
                <View key={idx} style={styles.connRow}>
                  <View style={styles.connBadge}>
                    <Text style={styles.connBadgeText}>{conn.fromNodeId}</Text>
                  </View>
                  <Feather name="arrow-right" size={12} color={C.tint} />
                  <View style={styles.connBadge}>
                    <Text style={styles.connBadgeText}>{conn.toNodeId}</Text>
                  </View>
                  <Text style={styles.connPins}>
                    ({conn.fromPinId} → {conn.toPinId})
                  </Text>
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
          )}

          {/* Start Button */}
          {stage === "intro" && (
            <View style={styles.startSection}>
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
            </View>
          )}
        </ScrollView>
      )}

      {/* Blueprint Builder */}
      {stage === "building" && (
        <View style={[styles.builderWrap, { paddingTop: isWeb ? 67 : insets.top, paddingBottom: tabBarHeight }]}>
          <View style={styles.builderHeader}>
            <TouchableOpacity onPress={() => setStage("intro")} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={C.tint} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.builderTitle}>{challenge.title}</Text>
              <Text style={styles.builderSubtitle}>{challenge.buildChallenge.instruction}</Text>
            </View>
          </View>
          <BlueprintBuilder
            challenge={challenge.buildChallenge}
            onComplete={handleCheck}
          />
        </View>
      )}
    </View>
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
    gap: 6,
    alignItems: "center",
  },
  streakBadge: {
    backgroundColor: "rgba(255,107,53,0.15)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.3)",
  },
  streakText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6B35",
  },
  solvedBadge: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: "rgba(57,211,83,0.1)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(57,211,83,0.25)",
  },
  solvedText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.success,
  },
  xpBadge: {
    backgroundColor: "rgba(255,184,0,0.1)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.3)",
  },
  xpText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.warning,
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
    gap: 7,
    flexWrap: "wrap",
  },
  categoryTag: {
    backgroundColor: "rgba(0,212,255,0.1)",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
  },
  categoryText: {
    fontSize: 11,
    color: C.tint,
    fontWeight: "600",
  },
  difficultyTag: {
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  xpTag: {
    backgroundColor: "rgba(255,184,0,0.1)",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.25)",
  },
  xpTagText: {
    fontSize: 11,
    color: C.warning,
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
  instructionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,212,255,0.06)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.15)",
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    lineHeight: 19,
  },
  previewSection: {
    gap: 8,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textTertiary,
    letterSpacing: 0.8,
  },
  previewScroll: {
    flexGrow: 0,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    paddingVertical: 4,
  },
  previewNode: {
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: "hidden",
    minWidth: 90,
    maxWidth: 130,
  },
  previewNodeHeader: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  previewNodeTitle: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  previewNodeBody: {
    backgroundColor: "#111820",
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 2,
  },
  previewPin: {
    fontSize: 9,
    color: C.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  previewArrow: {
    width: 28,
    alignItems: "center",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,184,0,0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.2)",
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    lineHeight: 19,
  },
  startSection: {
    gap: 10,
  },
  startBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  startGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  startText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0E14",
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  resultCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 12,
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
    fontSize: 17,
    fontWeight: "700",
  },
  resultSub: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
  solutionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.textTertiary,
    letterSpacing: 0.6,
  },
  connRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  connBadge: {
    backgroundColor: "rgba(0,212,255,0.1)",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
  },
  connBadgeText: {
    fontSize: 11,
    color: C.tint,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  connPins: {
    fontSize: 10,
    color: C.textTertiary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  resultActions: {
    gap: 8,
    marginTop: 4,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.tint + "40",
    backgroundColor: C.tint + "10",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.tint,
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
    paddingVertical: 14,
  },
  nextText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A0E14",
  },
  builderWrap: {
    flex: 1,
    backgroundColor: C.background,
  },
  builderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  backBtn: {
    padding: 4,
    marginTop: 2,
  },
  builderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  builderSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
});
