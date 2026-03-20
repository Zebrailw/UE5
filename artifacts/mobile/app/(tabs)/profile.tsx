import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { useProgress } from "@/context/ProgressContext";
import { MODULES } from "@/data/curriculum";
import { router } from "expo-router";

const C = Colors.dark;

function SettingRow({
  icon,
  label,
  color,
  onPress,
  value,
}: {
  icon: string;
  label: string;
  color?: string;
  onPress?: () => void;
  value?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: (color || C.tint) + "22" }]}>
        <Feather name={icon as any} size={16} color={color || C.tint} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Feather name="chevron-right" size={16} color={C.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    xp, level, streak, getTotalLessonsCompleted,
    unlockedAchievements, favoriteIds, reviewLaterIds,
    isLessonCompleted,
  } = useProgress();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const totalCompleted = getTotalLessonsCompleted();
  const totalLessons = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);

  const handleReset = () => {
    Alert.alert(
      "Reset Progress",
      "This will erase all your XP, completed lessons, and achievements. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("@ue5_academy_progress");
            Alert.alert("Done", "Progress reset. Restart the app to see changes.");
          },
        },
      ]
    );
  };

  const getRankName = () => {
    if (xp < 200) return "Blueprint Newcomer";
    if (xp < 500) return "Blueprint Novice";
    if (xp < 1000) return "Blueprint Student";
    if (xp < 2000) return "Blueprint Developer";
    if (xp < 4000) return "Blueprint Architect";
    return "Blueprint Master";
  };

  const favLessons = MODULES.flatMap((m) =>
    m.lessons.filter((l) => favoriteIds.includes(l.id))
  );

  const reviewLessons = MODULES.flatMap((m) =>
    m.lessons.filter((l) => reviewLaterIds.includes(l.id))
  );

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
        <Animated.View entering={FadeInDown.delay(50)} style={styles.profileHero}>
          <LinearGradient
            colors={[C.tint + "20", C.accent + "10"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.avatarCircle}>
            <Feather name="user" size={32} color={C.tint} />
          </View>
          <Text style={styles.rankName}>{getRankName()}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {level}</Text>
          </View>
          <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{totalCompleted}</Text>
              <Text style={styles.heroStatLabel}>Lessons</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{streak}</Text>
              <Text style={styles.heroStatLabel}>Streak</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{unlockedAchievements.length}</Text>
              <Text style={styles.heroStatLabel}>Badges</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>
                {Math.round((totalCompleted / Math.max(totalLessons, 1)) * 100)}%
              </Text>
              <Text style={styles.heroStatLabel}>Complete</Text>
            </View>
          </View>
        </Animated.View>

        {favLessons.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            {favLessons.slice(0, 5).map((lesson) => (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [styles.favCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              >
                <Feather name="heart" size={14} color="#FF4757" />
                <Text style={styles.favTitle} numberOfLines={1}>{lesson.title}</Text>
                <Feather name="chevron-right" size={14} color={C.textTertiary} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        {reviewLessons.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120)}>
            <Text style={styles.sectionTitle}>Review Later</Text>
            {reviewLessons.slice(0, 5).map((lesson) => (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [styles.favCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              >
                <Feather name="bookmark" size={14} color={C.warning} />
                <Text style={styles.favTitle} numberOfLines={1}>{lesson.title}</Text>
                <Feather name="chevron-right" size={14} color={C.textTertiary} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(150)}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.settingGroup}>
            <SettingRow
              icon="info"
              label="About"
              value="v1.0"
              onPress={() =>
                Alert.alert(
                  "UE5 Blueprints Academy",
                  "Learn Unreal Engine 5 Blueprints from beginner to expert. Built for game developers."
                )
              }
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180)}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.settingGroup}>
            <SettingRow
              icon="trash-2"
              label="Reset All Progress"
              color="#FF4757"
              onPress={handleReset}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scrollContent: { paddingHorizontal: 20 },
  profileHero: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.tint + "33",
    overflow: "hidden",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.tint + "22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: C.tint + "55",
  },
  rankName: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: C.text,
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: C.tint + "22",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 6,
  },
  levelBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: C.tint,
  },
  xpText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 20,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.cardBorder,
  },
  heroStatValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: C.text,
  },
  heroStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: C.text,
    marginBottom: 12,
    marginTop: 4,
  },
  settingGroup: {
    backgroundColor: C.card,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.separator,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.text,
  },
  settingValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    marginRight: 4,
  },
  favCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  favTitle: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.text,
  },
});
