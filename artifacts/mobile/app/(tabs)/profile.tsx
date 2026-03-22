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

import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";
import { MODULES } from "@/data/curriculum";

const BOOSTY_URL = "https://boosty.to/ue5bluprintsacademy";
const TELEGRAM_URL = "https://t.me/ue5blueprintsacademy";
const GITHUB_URL = "https://github.com/ue5blueprintsacademy";

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

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "dark", label: "Тёмная", icon: "moon" },
  { mode: "light", label: "Светлая", icon: "sun" },
  { mode: "system", label: "Системная", icon: "smartphone" },
];

function DonationModal({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: any }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.modalOverlay]} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.cardBorder }]} onPress={() => {}}>
          <View style={[styles.modalHandle, { backgroundColor: C.cardBorder }]} />
          <Text style={[styles.modalTitle, { color: C.text }]}>Поддержать проект</Text>
          <Text style={[styles.modalSubtitle, { color: C.textSecondary }]}>
            Помоги развивать UE5 Blueprints Academy — добавлять уроки, механики и новые функции
          </Text>
          <View style={styles.tierRow}>
            {DONATION_TIERS.map((tier) => (
              <Pressable
                key={tier.id}
                style={({ pressed }) => [
                  styles.tierCard,
                  { borderColor: tier.color + "55", backgroundColor: C.background },
                  pressed && { opacity: 0.82 },
                ]}
                onPress={() => { onClose(); Linking.openURL(tier.url); }}
              >
                <LinearGradient
                  colors={[tier.color + "18", tier.color + "06"]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                <Text style={[styles.tierAmount, { color: tier.color }]}>{tier.amount}</Text>
                <Text style={[styles.tierTitle, { color: C.text }]}>{tier.title}</Text>
                <Text style={[styles.tierDesc, { color: C.textSecondary }]}>{tier.description}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.monetizeGrid}>
            <Pressable
              style={({ pressed }) => [styles.monetizeBtn, { borderColor: "#0088CC44", backgroundColor: "#0088CC11" }, pressed && { opacity: 0.8 }]}
              onPress={() => { onClose(); Linking.openURL(TELEGRAM_URL); }}
            >
              <Text style={styles.monetizeEmoji}>💬</Text>
              <Text style={[styles.monetizeName, { color: C.text }]}>Telegram</Text>
              <Text style={[styles.monetizeSub, { color: C.textSecondary }]}>Сообщество</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.monetizeBtn, { borderColor: "#7B4FFF44", backgroundColor: "#7B4FFF11" }, pressed && { opacity: 0.8 }]}
              onPress={() => { onClose(); Linking.openURL(GITHUB_URL); }}
            >
              <Text style={styles.monetizeEmoji}>⭐</Text>
              <Text style={[styles.monetizeName, { color: C.text }]}>GitHub</Text>
              <Text style={[styles.monetizeSub, { color: C.textSecondary }]}>Исходный код</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.boostyBtn, pressed && { opacity: 0.85 }]}
            onPress={() => { onClose(); Linking.openURL(BOOSTY_URL); }}
          >
            <LinearGradient colors={["#FF6B35", "#FF4500"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            <Feather name="heart" size={18} color="#fff" />
            <Text style={styles.boostyBtnText}>Открыть Boosty</Text>
            <Feather name="external-link" size={16} color="#fff" />
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: C.textSecondary }]}>Отмена</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C, themeMode, setThemeMode } = useTheme();
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

  const favLessons = MODULES.flatMap((m) => m.lessons.filter((l) => favoriteIds.includes(l.id)));
  const reviewLessons = MODULES.flatMap((m) => m.lessons.filter((l) => reviewLaterIds.includes(l.id)));

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <DonationModal visible={donationVisible} onClose={() => setDonationVisible(false)} C={C} />

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
        <Animated.View entering={FadeInDown.delay(50)} style={[styles.profileHero, { backgroundColor: C.card, borderColor: C.tint + "33" }]}>
          <LinearGradient
            colors={[C.tint + "20", C.accent + "10"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[styles.avatarCircle, { backgroundColor: C.tint + "22", borderColor: C.tint + "55" }]}>
            <Feather name="user" size={32} color={C.tint} />
          </View>
          <Text style={[styles.rankName, { color: C.text }]}>{getRankName()}</Text>
          <View style={[styles.levelBadge, { backgroundColor: C.tint + "22" }]}>
            <Text style={[styles.levelBadgeText, { color: C.tint }]}>Уровень {level}</Text>
          </View>
          <Text style={[styles.xpText, { color: C.textSecondary }]}>{xp.toLocaleString()} XP</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: C.text }]}>{totalCompleted}</Text>
              <Text style={[styles.heroStatLabel, { color: C.textSecondary }]}>Уроков</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: C.cardBorder }]} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: C.text }]}>{streak}</Text>
              <Text style={[styles.heroStatLabel, { color: C.textSecondary }]}>Серия</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: C.cardBorder }]} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: C.text }]}>{unlockedAchievements.length}</Text>
              <Text style={[styles.heroStatLabel, { color: C.textSecondary }]}>Значки</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: C.cardBorder }]} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: C.text }]}>
                {Math.round((totalCompleted / Math.max(totalLessons, 1)) * 100)}%
              </Text>
              <Text style={[styles.heroStatLabel, { color: C.textSecondary }]}>Готово</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80)}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Поддержать проект</Text>
          <Pressable
            style={({ pressed }) => [styles.donateHeroCard, { backgroundColor: C.card, borderColor: "#7B4FFF33" }, pressed && { opacity: 0.88 }]}
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
                <Text style={[styles.buildTitle, { color: C.text }]}>Поддержать разработку</Text>
                <Text style={[styles.buildSubtitle, { color: C.textSecondary }]}>☕ Кофе · 🍕 Пицца · ⚡ Герой · 💬 Telegram</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={C.textTertiary} />
          </Pressable>
        </Animated.View>

        {favLessons.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120)}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Избранное</Text>
            {favLessons.slice(0, 5).map((lesson) => (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [styles.favCard, { backgroundColor: C.card, borderColor: C.cardBorder }, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              >
                <Feather name="heart" size={14} color="#FF4757" />
                <Text style={[styles.favTitle, { color: C.text }]} numberOfLines={1}>{lesson.title}</Text>
                <Feather name="chevron-right" size={14} color={C.textTertiary} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        {reviewLessons.length > 0 && (
          <Animated.View entering={FadeInDown.delay(140)}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Повторить позже</Text>
            {reviewLessons.slice(0, 5).map((lesson) => (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [styles.favCard, { backgroundColor: C.card, borderColor: C.cardBorder }, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              >
                <Feather name="bookmark" size={14} color={C.warning} />
                <Text style={[styles.favTitle, { color: C.text }]} numberOfLines={1}>{lesson.title}</Text>
                <Feather name="chevron-right" size={14} color={C.textTertiary} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(160)}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Оформление</Text>
          <View style={[styles.settingGroup, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
            <View style={[styles.themeRow, { borderBottomColor: C.separator }]}>
              <View style={[styles.settingIcon, { backgroundColor: C.tint + "22" }]}>
                <Feather name="moon" size={16} color={C.tint} />
              </View>
              <Text style={[styles.settingLabel, { color: C.text }]}>Тема</Text>
            </View>
            <View style={styles.themeSegmentRow}>
              {THEME_OPTIONS.map((opt) => {
                const active = themeMode === opt.mode;
                return (
                  <Pressable
                    key={opt.mode}
                    style={[
                      styles.themeSegment,
                      { borderColor: active ? C.tint : C.cardBorder, backgroundColor: active ? C.tint + "22" : "transparent" },
                    ]}
                    onPress={() => setThemeMode(opt.mode)}
                  >
                    <Feather name={opt.icon as any} size={14} color={active ? C.tint : C.textSecondary} />
                    <Text style={[styles.themeSegmentText, { color: active ? C.tint : C.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180)}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>О приложении</Text>
          <View style={[styles.settingGroup, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
            {[
              { icon: "info", label: "О приложении", value: "v1.0", action: () => Alert.alert("UE5 Blueprints Academy", "Изучайте Blueprint для Unreal Engine 5 — от новичка до эксперта. 100+ механик, визуальные практики, система достижений.") },
              { icon: "star", label: "Оценить приложение", action: () => Linking.openURL("https://play.google.com/store/apps/details?id=com.zebradf.ue5blueprintsacademy") },
              { icon: "send", label: "Telegram сообщество", action: () => Linking.openURL(TELEGRAM_URL), color: "#0088CC" },
              { icon: "message-circle", label: "Написать разработчику", action: () => Linking.openURL("mailto:zebrailwkottop@gmail.com") },
              { icon: "heart", label: "Поддержать на Boosty", action: () => Linking.openURL(BOOSTY_URL), color: "#FF6B35" },
            ].map((item, idx, arr) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.settingRow,
                  { borderBottomColor: C.separator, borderBottomWidth: idx < arr.length - 1 ? 1 : 0 },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={item.action}
              >
                <View style={[styles.settingIcon, { backgroundColor: ((item.color || C.tint) + "22") }]}>
                  <Feather name={item.icon as any} size={16} color={item.color || C.tint} />
                </View>
                <Text style={[styles.settingLabel, { color: C.text }]}>{item.label}</Text>
                {item.value && <Text style={[styles.settingValue, { color: C.textSecondary }]}>{item.value}</Text>}
                <Feather name="chevron-right" size={16} color={C.textTertiary} />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Опасная зона</Text>
          <View style={[styles.settingGroup, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
            <Pressable
              style={({ pressed }) => [styles.settingRow, { borderBottomWidth: 0 }, pressed && { opacity: 0.7 }]}
              onPress={handleReset}
            >
              <View style={[styles.settingIcon, { backgroundColor: "#FF475722" }]}>
                <Feather name="trash-2" size={16} color="#FF4757" />
              </View>
              <Text style={[styles.settingLabel, { color: "#FF4757" }]}>Сбросить весь прогресс</Text>
              <Feather name="chevron-right" size={16} color={C.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  profileHero: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 2,
  },
  rankName: { fontFamily: "Inter_700Bold", fontSize: 20, marginBottom: 8 },
  levelBadge: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 6 },
  levelBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  xpText: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 20 },
  heroStatsRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  heroStatItem: { flex: 1, alignItems: "center" },
  heroStatDivider: { width: 1, height: 30 },
  heroStatValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  heroStatLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 12, marginTop: 4 },
  donateHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  donateHeroLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  buildIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buildTextBlock: { flex: 1 },
  buildTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 2 },
  buildSubtitle: { fontFamily: "Inter_400Regular", fontSize: 11 },
  settingGroup: { borderRadius: 16, marginBottom: 20, borderWidth: 1, overflow: "hidden" },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  themeSegmentRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  themeSegment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  themeSegmentText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15 },
  settingValue: { fontFamily: "Inter_400Regular", fontSize: 14, marginRight: 4 },
  favCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  favTitle: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 22, textAlign: "center", marginBottom: 8 },
  modalSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  tierRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  tierCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
    gap: 4,
  },
  tierEmoji: { fontSize: 26, marginBottom: 4 },
  tierAmount: { fontFamily: "Inter_700Bold", fontSize: 18 },
  tierTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  tierDesc: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center", lineHeight: 15 },
  monetizeGrid: { flexDirection: "row", gap: 8, marginBottom: 16 },
  monetizeBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  monetizeEmoji: { fontSize: 22 },
  monetizeName: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  monetizeSub: { fontFamily: "Inter_400Regular", fontSize: 10 },
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
  boostyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelText: { fontFamily: "Inter_500Medium", fontSize: 15 },
});
