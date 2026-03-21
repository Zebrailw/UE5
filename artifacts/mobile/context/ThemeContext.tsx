import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import Colors from "@/constants/colors";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeContextValue {
  themeMode: ThemeMode;
  colors: typeof Colors.dark;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const STORAGE_KEY = "@ue5_academy_theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "dark" || saved === "light" || saved === "system") {
        setThemeModeState(saved);
      }
    });
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemScheme === "dark") ||
    (themeMode === "system" && systemScheme == null);

  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ themeMode, colors, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
