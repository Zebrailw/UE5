import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { useProgress } from "@/context/ProgressContext";
import { MODULES } from "@/data/curriculum";

const C = Colors.dark;

const BOOSTY_URL = "https://boosty.to/ue5bluprintsacademy";

const DONATION_TIERS = [
  {
    id: "coffee",
    emoji: "☕",
    title: "Кофе",
    amount: "1$",
    description: "Угостить разработчика кофе",
    color: "#C8A96E",
    url: BOOSTY_URL,
  },
  {
    id: "pizza",
    emoji: "🍕",
    title: "Пицца",
    amount: "5$",
    description: "Поддержать новые уроки",
    color: "#FF6B35",
    url: BOOSTY_URL,
  },
  {
    id: "hero",
    emoji: "⚡",
    title: "Герой",
    amount: "15$",
    description: "Вы — легенда Blueprint Academy!",
    color: "#00D4FF",
    url: BOOSTY_URL,
  },
];

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

function DonationModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Поддержать проект</Text>
          <Text style={styles.modalSubtitle}>
            Помоги развивать UE5 Blueprints Academy — добавлять уроки,
            механики и новые функции
          </Text>

          <View style={styles.tierRow}>
            {DONATION_TIERS.map((tier) => (
              <Pressable
                key={tier.id}
                style={({ pressed }) => [
                  styles.tierCard,
                  { borderColor: tier.color + "55" },
                  pressed && { opacity: 0.82 },
                ]}
                onPress={() => {
                  onClose();
                  Linking.openURL(tier.url);
                }}
              >
                <LinearGradient
                  colors={[tier.color + "18", tier.color + "06"]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                <Text style={[styles.tierAmount, { color: tier.color }]}>{tier.amount}</Text>
                <Text style={styles.tierTitle}>{tier.title}</Text>
                <Text style={styles.tierDesc}>{tier.description}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.boostyBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => {
              onClose();
              Linking.openURL(BOOSTY_URL);
            }}
          >
            <LinearGradient
              colors={["#FF6B35", "#FF4500"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Feather name="heart" size={18} color="#fff" />
            <Text style={styles.boostyBtnText}>Открыть Boosty</Text>
            <Feather name="external-link" size={16} color="#fff" />
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Отмена</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    xp, level, streak, getTotalLessonsCompleted,
    unlockedAchievements, favoriteIds, reviewLaterIds,
  } = useProgress();
  const [donationVisible, setDonationVisible] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const totalCompleted = getTotalLessonsCompleted();
  const totalLessons = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);

  const handleReset = () => {
    Alert.alert(
      "Сбросить прогресс",
      "Это удалит весь ваш XP, выполненные уроки и достижения. Действие необратимо.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("@ue5_academy_progress");
            Alert.alert("Готово", "Прогресс сброшен. Перезапустите приложение.");
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
      <DonationModal visible={donationVisible} onClose={() => setDonationVisible(false)} />

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
            <Text style={styles.levelBadgeText}>Уровень {level}</Text>
          </View>
          <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{totalCompleted}</Text>
              <Text style={styles.heroStatLabel}>Уроков</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{streak}</Text>
              <Text style={styles.heroStatLabel}>Серия</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{unlockedAchievements.length}</Text>
              <Text style={styles.heroStatLabel}>Значки</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>
                {Math.round((totalCompleted / Math.max(totalLessons, 1)) * 100)}%
              </Text>
              <Text style={styles.heroStatLabel}>Готово</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80)}>
          <Text style={styles.sectionTitle}>Поддержать проект</Text>
          <Pressable
            style={({ pressed }) => [styles.donateHeroCard, pressed && { opacity: 0.88 }]}
            onPress={() => setDonationVisible(true)}
          >
            <LinearGradient
              colors={["#7B4FFF22", "#FF6B3511"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.donateHeroLeft}>
              <View style={[styles.buildIconCircle, { backgroundColor: "#7B4FFF22", borderColor: "#7B4FFF44" }]}>
                <Feather name="heart" size={22} color="#7B4FFF" />
              </View>
              <View style={styles.buildTextBlock}>
                <Text style={styles.buildTitle}>Поддержать разработку</Text>
                <Text style={styles.buildSubtitle}>☕ Кофе · 🍕 Пицца · ⚡ Герой</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={C.textTertiary} />
          </Pressable>
        </Animated.View>

        {favLessons.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120)}>
            <Text style={styles.sectionTitle}>Избранное</Text>
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
          <Animated.View entering={FadeInDown.delay(140)}>
            <Text style={styles.sectionTitle}>Повторить позже</Text>
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

        <Animated.View entering={FadeInDown.delay(160)}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <View style={styles.settingGroup}>
            <SettingRow
              icon="info"
              label="О приложении"
              value="v1.0"
              onPress={() =>
                Alert.alert(
                  "UE5 Blueprints Academy",
                  "Изучайте Blueprint для Unreal Engine 5 — от новичка до эксперта. 100+ механик, визуальные практики, система достижений."
                )
              }
            />
            <SettingRow
              icon="star"
              label="Оценить приложение"
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.zebradf.ue5blueprintsacademy"
                )
              }
            />
            <SettingRow
              icon="message-circle"
              label="Написать разработчику"
              onPress={() => Linking.openURL("mailto:zebrailwkottop@gmail.com")}
            />
            <SettingRow
              icon="heart"
              label="Поддержать на Boosty"
              onPress={() => Linking.openURL(BOOSTY_URL)}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180)}>
          <Text style={styles.sectionTitle}>Опасная зона</Text>
          <View style={styles.settingGroup}>
            <SettingRow
              icon="trash-2"
              label="Сбросить весь прогресс"
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
  donateHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#7B4FFF33",
    overflow: "hidden",
  },
  donateHeroLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  buildCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#39D35333",
    overflow: "hidden",
  },
  buildIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#39D35322",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#39D35344",
  },
  buildTextBlock: { flex: 1 },
  buildTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
    marginBottom: 2,
  },
  buildSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.cardBorder,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: C.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  tierRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tierCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: C.background,
    overflow: "hidden",
    gap: 4,
  },
  tierEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  tierAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  tierTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: C.text,
  },
  tierDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 15,
  },
  boostyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  boostyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.textSecondary,
  },
});
