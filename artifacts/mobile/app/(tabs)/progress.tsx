import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useProgress } from "@/context/ProgressContext";
import { ACHIEVEMENTS, MODULES, getDifficultyColor } from "@/data/curriculum";

const C = Colors.dark;

function ProgressRing({ percentage, size = 80, color = C.tint, label }: {
  percentage: number; size?: number; color?: string; label: string;
}) {
  const pct = Math.round(percentage * 100);
  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <View style={[styles.ringOuter, { width: size, height: size, borderRadius: size / 2, borderColor: color + "33" }]}>
        <View style={[styles.ringInner, { width: size - 16, height: size - 16, borderRadius: (size - 16) / 2, backgroundColor: C.backgroundTertiary }]}>
          <Text style={[styles.ringPct, { color, fontSize: size > 70 ? 18 : 14 }]}>{pct}%</Text>
          <Text style={styles.ringLabel}>{label}</Text>
        </View>
      </View>
      <View style={[styles.ringProgress, {
        position: "absolute",
        width: size,
        height: size / 2,
        borderTopLeftRadius: size / 2,
        borderTopRightRadius: size / 2,
        borderWidth: 5,
        borderBottomWidth: 0,
        borderColor: pct > 50 ? color : "transparent",
        top: 0,
      }]} />
    </View>
  );
}

function AchievementCard({ achId }: { achId: string }) {
  const ach = ACHIEVEMENTS.find((a) => a.id === achId);
  const { unlockedAchievements } = useProgress();
  if (!ach) return null;
  const unlocked = unlockedAchievements.includes(achId);

  return (
    <View style={[styles.achCard, unlocked && styles.achCardUnlocked]}>
      <View style={[styles.achIcon, unlocked && { backgroundColor: C.tint + "22", borderColor: C.tint + "44" }]}>
        <Feather name={ach.icon as any} size={18} color={unlocked ? C.tint : C.textTertiary} />
      </View>
      <View style={styles.achText}>
        <Text style={[styles.achTitle, !unlocked && { color: C.textTertiary }]}>{ach.title}</Text>
        <Text style={styles.achDesc}>{ach.description}</Text>
      </View>
      {unlocked && <Feather name="check-circle" size={18} color={C.success} />}
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const {
    xp,
    level,
    streak,
    getLevelProgress,
    isLessonCompleted,
    isModuleUnlocked,
    getTotalLessonsCompleted,
    unlockedAchievements,
    totalQuizzesPerfect,
  } = useProgress();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const levelProgress = getLevelProgress();
  const totalLessons = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalCompleted = getTotalLessonsCompleted();
  const overallPct = totalLessons > 0 ? totalCompleted / totalLessons : 0;

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
        <Text style={styles.screenTitle}>Your Progress</Text>

        <Animated.View entering={FadeInDown.delay(50)} style={styles.heroCard}>
          <LinearGradient
            colors={[C.tint + "22", C.accent + "11"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLevel}>Level {level}</Text>
              <Text style={styles.heroXP}>{xp.toLocaleString()} total XP</Text>
            </View>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Feather name="zap" size={16} color={C.warning} />
                <Text style={styles.heroStatVal}>{streak}</Text>
                <Text style={styles.heroStatLabel}>Streak</Text>
              </View>
              <View style={styles.heroStat}>
                <Feather name="check-circle" size={16} color={C.success} />
                <Text style={styles.heroStatVal}>{totalCompleted}</Text>
                <Text style={styles.heroStatLabel}>Done</Text>
              </View>
              <View style={styles.heroStat}>
                <Feather name="award" size={16} color={C.accent} />
                <Text style={styles.heroStatVal}>{unlockedAchievements.length}</Text>
                <Text style={styles.heroStatLabel}>Badges</Text>
              </View>
            </View>
          </View>

          <View style={styles.levelProgressSection}>
            <View style={styles.levelLabels}>
              <Text style={styles.levelLabel}>Level {level}</Text>
              <Text style={styles.levelLabel}>Level {level + 1}</Text>
            </View>
            <View style={styles.levelTrack}>
              <Animated.View
                style={[styles.levelFill, { width: `${Math.round(levelProgress.percentage * 100)}%` }]}
              />
            </View>
            <Text style={styles.levelSubtext}>
              {levelProgress.current} / {levelProgress.required} XP
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.sectionTitle}>Module Progress</Text>
          {MODULES.map((mod, i) => {
            const unlocked = isModuleUnlocked(mod.id);
            const completedCount = mod.lessons.filter((l) => isLessonCompleted(l.id)).length;
            const pct = mod.lessons.length > 0 ? completedCount / mod.lessons.length : 0;
            return (
              <View key={mod.id} style={styles.moduleProgressCard}>
                <View style={[styles.modIcon, { borderColor: unlocked ? mod.color + "55" : C.cardBorder }]}>
                  <Feather
                    name={mod.icon as any}
                    size={16}
                    color={unlocked ? mod.color : C.textTertiary}
                  />
                </View>
                <View style={styles.modContent}>
                  <View style={styles.modHeader}>
                    <Text style={[styles.modTitle, !unlocked && { color: C.textTertiary }]}>
                      {mod.title}
                    </Text>
                    <Text style={[styles.modPct, { color: unlocked ? mod.color : C.textTertiary }]}>
                      {completedCount}/{mod.lessons.length}
                    </Text>
                  </View>
                  <View style={styles.modTrack}>
                    <Animated.View
                      style={[
                        styles.modFill,
                        {
                          width: `${Math.round(pct * 100)}%`,
                          backgroundColor: unlocked ? mod.color : C.textTertiary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150)}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {ACHIEVEMENTS.map((ach) => (
            <AchievementCard key={ach.id} achId={ach.id} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: C.tint }]}>{totalCompleted}</Text>
              <Text style={styles.statLbl}>Lessons Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: C.success }]}>{totalQuizzesPerfect}</Text>
              <Text style={styles.statLbl}>Perfect Quizzes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: C.warning }]}>{streak}</Text>
              <Text style={styles.statLbl}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: C.accent }]}>{Math.round(overallPct * 100)}%</Text>
              <Text style={styles.statLbl}>Complete</Text>
            </View>
          </View>
        </Animated.View>
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
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.tint + "33",
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroLevel: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: C.text,
  },
  heroXP: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  heroStats: {
    flexDirection: "row",
    gap: 16,
  },
  heroStat: {
    alignItems: "center",
    gap: 2,
  },
  heroStatVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: C.text,
  },
  heroStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: C.textSecondary,
  },
  levelProgressSection: {},
  levelLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  levelLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.textSecondary,
  },
  levelTrack: {
    height: 10,
    backgroundColor: C.backgroundTertiary,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 6,
  },
  levelFill: {
    height: "100%",
    backgroundColor: C.tint,
    borderRadius: 5,
  },
  levelSubtext: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
    textAlign: "right",
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: C.text,
    marginBottom: 14,
    marginTop: 8,
  },
  moduleProgressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  modIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modContent: { flex: 1 },
  modHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.text,
    flex: 1,
    marginRight: 8,
  },
  modPct: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  modTrack: {
    height: 6,
    backgroundColor: C.backgroundTertiary,
    borderRadius: 3,
    overflow: "hidden",
  },
  modFill: {
    height: "100%",
    borderRadius: 3,
  },
  achCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
    opacity: 0.55,
  },
  achCardUnlocked: { opacity: 1 },
  achIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  achText: { flex: 1 },
  achTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.text,
    marginBottom: 2,
  },
  achDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  statVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
  statLbl: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringPct: {
    fontFamily: "Inter_700Bold",
  },
  ringLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: C.textSecondary,
  },
  ringProgress: {},
});
