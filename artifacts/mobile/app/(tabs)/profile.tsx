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
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { useProgress } from "@/context/ProgressContext";
import { MODULES } from "@/data/curriculum";

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

function BuildModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const steps = [
    {
      num: "1",
      title: "Установите EAS CLI",
      code: "npm install -g eas-cli",
      desc: "Инструмент сборки Expo",
    },
    {
      num: "2",
      title: "Войдите в аккаунт Expo",
      code: "eas login",
      desc: "Нужен аккаунт на expo.dev",
    },
    {
      num: "3",
      title: "Запустите сборку APK",
      code: "eas build -p android --profile preview",
      desc: "Сборка займёт 5–15 минут",
    },
    {
      num: "4",
      title: "Скачайте APK",
      desc: "Ссылка придёт на email или откройте expo.dev/accounts/[ваш-аккаунт]/projects",
      code: null,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View style={styles.modalIconCircle}>
              <Feather name="package" size={26} color={C.tint} />
            </View>
            <Text style={styles.modalTitle}>Сборка APK</Text>
            <Text style={styles.modalSubtitle}>
              Инструкция по сборке Android-приложения через EAS Build
            </Text>
          </View>

          {steps.map((step) => (
            <View key={step.num} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
                {step.code && (
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{step.code}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          <Pressable
            style={styles.expoBtn}
            onPress={() => Linking.openURL("https://expo.dev")}
          >
            <Feather name="external-link" size={16} color={C.background} />
            <Text style={styles.expoBtnText}>Открыть expo.dev</Text>
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Закрыть</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    xp, level, streak, getTotalLessonsCompleted,
    unlockedAchievements, favoriteIds, reviewLaterIds,
  } = useProgress();
  const [buildModalVisible, setBuildModalVisible] = useState(false);

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
          <Text style={styles.sectionTitle}>Установить на телефон</Text>
          <Pressable
            style={({ pressed }) => [styles.buildCard, pressed && { opacity: 0.9 }]}
            onPress={() => setBuildModalVisible(true)}
          >
            <LinearGradient
              colors={[C.tint + "22", C.accent + "15"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.buildCardLeft}>
              <View style={styles.buildIconCircle}>
                <Feather name="package" size={24} color={C.tint} />
              </View>
              <View>
                <Text style={styles.buildTitle}>Собрать APK</Text>
                <Text style={styles.buildSubtitle}>Android · EAS Build</Text>
              </View>
            </View>
            <View style={styles.buildBtn}>
              <Feather name="play" size={14} color={C.background} />
              <Text style={styles.buildBtnText}>Старт</Text>
            </View>
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
                  "Изучайте Blueprint для Unreal Engine 5 — от новичка до эксперта."
                )
              }
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

      <BuildModal
        visible={buildModalVisible}
        onClose={() => setBuildModalVisible(false)}
      />
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
  buildCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.tint + "44",
    overflow: "hidden",
  },
  buildCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  buildIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.tint + "22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.tint + "44",
  },
  buildTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: C.text,
    marginBottom: 3,
  },
  buildSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  buildBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.tint,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buildBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: C.background,
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
    backgroundColor: "rgba(0,0,0,0.6)",
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
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.cardBorder,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.tint + "22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.tint + "44",
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: C.text,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
    alignItems: "flex-start",
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.tint + "22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.tint + "44",
    marginTop: 2,
  },
  stepNumText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: C.tint,
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
    marginBottom: 3,
  },
  stepDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  codeBox: {
    backgroundColor: C.backgroundTertiary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 13,
    color: C.tint,
  },
  expoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.tint,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 10,
  },
  expoBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: C.background,
  },
  closeBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  closeBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.textSecondary,
  },
});
