import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

export default function PrivacyPolicyScreen() {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Политика конфиденциальности</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Последнее обновление: 1 января 2025 г.</Text>

        <Section title="1. Общие положения" C={C}>
          Приложение «UE5 Blueprints Academy» разработано как образовательный инструмент
          для изучения Unreal Engine 5 Blueprints. Мы серьёзно относимся к вашей
          конфиденциальности и стремимся быть максимально прозрачными.
        </Section>

        <Section title="2. Какие данные мы собираем" C={C}>
          Приложение работает полностью офлайн и не собирает никаких персональных данных.
          {"\n\n"}
          Все данные о прогрессе (XP, уровень, пройденные уроки, достижения, streak)
          хранятся исключительно на вашем устройстве в локальном хранилище (AsyncStorage)
          и недоступны нам или третьим лицам.
          {"\n\n"}
          Мы не используем аналитику, счётчики или инструменты отслеживания.
        </Section>

        <Section title="3. Разрешения" C={C}>
          Приложение запрашивает только минимально необходимые разрешения:{"\n\n"}
          • INTERNET — для загрузки шрифтов и возможности открывать внешние ссылки
          (Telegram, Boosty){"\n"}
          • VIBRATE — для тактильной обратной связи при прохождении квизов
        </Section>

        <Section title="4. Сторонние сервисы" C={C}>
          Приложение содержит ссылки на внешние ресурсы (Telegram, Boosty, Google Play).
          При переходе по этим ссылкам вы покидаете наше приложение. Рекомендуем
          ознакомиться с политиками конфиденциальности этих сервисов отдельно.
        </Section>

        <Section title="5. Дети" C={C}>
          Приложение предназначено для общей аудитории и не собирает данные о детях
          до 13 лет. Родители могут сбросить все локальные данные через раздел
          «Опасная зона» в профиле.
        </Section>

        <Section title="6. Удаление данных" C={C}>
          Все ваши данные хранятся только на устройстве. Чтобы удалить их:{"\n\n"}
          • Воспользуйтесь кнопкой «Сбросить весь прогресс» в разделе «Профиль»{"\n"}
          • Или удалите приложение — все данные будут удалены автоматически
        </Section>

        <Section title="7. Изменения политики" C={C}>
          Мы можем обновлять данную политику конфиденциальности. Текущая версия всегда
          доступна внутри приложения в разделе «Профиль → О приложении».
        </Section>

        <Section title="8. Контакты" C={C}>
          Если у вас есть вопросы, напишите нам:{"\n"}
          zebrailwkottop@gmail.com
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, C }: { title: string; children: React.ReactNode; C: typeof Colors.dark }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: C.text, marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, lineHeight: 22 }}>
        {children}
      </Text>
    </View>
  );
}

function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.cardBorder,
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
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: C.text,
      flex: 1,
      textAlign: "center",
      marginHorizontal: 8,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    updated: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: C.textTertiary,
      marginBottom: 24,
    },
  });
}
