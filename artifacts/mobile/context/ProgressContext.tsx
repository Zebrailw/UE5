import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ACHIEVEMENTS, MODULES } from "@/data/curriculum";

const STORAGE_KEY = "@ue5_academy_progress";

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  quizScore?: number;
  completedAt?: string;
}

interface ProgressState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  lessonsCompleted: LessonProgress[];
  unlockedAchievements: string[];
  dailyGoalCompleted: boolean;
  totalQuizzesPerfect: number;
  favoriteIds: string[];
  reviewLaterIds: string[];
}

interface ProgressContextValue {
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: LessonProgress[];
  unlockedAchievements: string[];
  dailyGoalCompleted: boolean;
  totalQuizzesPerfect: number;
  favoriteIds: string[];
  reviewLaterIds: string[];
  getLevelProgress: () => { current: number; required: number; percentage: number };
  isLessonCompleted: (lessonId: string) => boolean;
  getLessonScore: (lessonId: string) => number | undefined;
  completeLesson: (lessonId: string, xpReward: number, quizScore?: number) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleReviewLater: (id: string) => Promise<void>;
  isModuleUnlocked: (moduleId: string) => boolean;
  getTotalLessonsCompleted: () => number;
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const XP_PER_LEVEL = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 11500, 16000, 22000];

function calculateLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1;
  }
  return 1;
}

function getLevelXpRange(level: number): { min: number; max: number } {
  const idx = Math.min(level - 1, XP_PER_LEVEL.length - 1);
  const min = XP_PER_LEVEL[idx] ?? 0;
  const max = XP_PER_LEVEL[Math.min(level, XP_PER_LEVEL.length - 1)] ?? min + 5000;
  return { min, max };
}

const defaultState: ProgressState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  lessonsCompleted: [],
  unlockedAchievements: [],
  dailyGoalCompleted: false,
  totalQuizzesPerfect: 0,
  favoriteIds: [],
  reviewLaterIds: [],
};

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ProgressState;
        const today = new Date().toDateString();
        const lastActive = parsed.lastActiveDate;
        let streak = parsed.streak;
        let dailyGoalCompleted = parsed.dailyGoalCompleted;

        if (lastActive !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastActive !== yesterday.toDateString()) {
            streak = 0;
          }
          dailyGoalCompleted = false;
        }

        setState({ ...parsed, streak, dailyGoalCompleted });
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (newState: ProgressState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      // ignore
    }
  };

  const checkAchievements = useCallback(
    (
      newState: ProgressState,
      completedCount: number
    ): string[] => {
      const unlocked = [...newState.unlockedAchievements];
      const stats = {
        totalLessons: completedCount,
        xp: newState.xp,
        streak: newState.streak,
        perfectQuizzes: newState.totalQuizzesPerfect,
      };

      for (const ach of ACHIEVEMENTS) {
        if (unlocked.includes(ach.id)) continue;
        try {
          if ((ach as { id: string; condition: (s: typeof stats) => boolean }).condition(stats)) {
            unlocked.push(ach.id);
          }
        } catch {
        }
      }

      return unlocked;
    },
    []
  );

  const completeLesson = useCallback(
    async (lessonId: string, xpReward: number, quizScore?: number) => {
      setState((prev) => {
        const alreadyCompleted = prev.lessonsCompleted.find(
          (l) => l.lessonId === lessonId && l.completed
        );

        const newXp = alreadyCompleted ? prev.xp : prev.xp + xpReward;
        const newLevel = calculateLevel(newXp);
        const today = new Date().toDateString();
        const wasPerfect = quizScore === 100;
        const newPerfect = prev.totalQuizzesPerfect + (wasPerfect && !alreadyCompleted ? 1 : 0);

        let newStreak = prev.streak;
        let newDailyGoal = prev.dailyGoalCompleted;

        if (prev.lastActiveDate !== today) {
          newStreak = prev.streak + 1;
          newDailyGoal = true;
        }

        const updatedLessons = prev.lessonsCompleted.filter(
          (l) => l.lessonId !== lessonId
        );
        updatedLessons.push({
          lessonId,
          completed: true,
          quizScore,
          completedAt: new Date().toISOString(),
        });

        const completedCount = updatedLessons.filter((l) => l.completed).length;

        const newAchievements = checkAchievements(
          {
            ...prev,
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            totalQuizzesPerfect: newPerfect,
          },
          completedCount
        );

        const newState: ProgressState = {
          ...prev,
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          lastActiveDate: today,
          dailyGoalCompleted: newDailyGoal,
          lessonsCompleted: updatedLessons,
          unlockedAchievements: newAchievements,
          totalQuizzesPerfect: newPerfect,
        };

        saveProgress(newState);
        return newState;
      });
    },
    [checkAchievements]
  );

  const toggleFavorite = useCallback(async (id: string) => {
    setState((prev) => {
      const isFav = prev.favoriteIds.includes(id);
      const newFavs = isFav
        ? prev.favoriteIds.filter((f) => f !== id)
        : [...prev.favoriteIds, id];
      const newState = { ...prev, favoriteIds: newFavs };
      saveProgress(newState);
      return newState;
    });
  }, []);

  const toggleReviewLater = useCallback(async (id: string) => {
    setState((prev) => {
      const isReview = prev.reviewLaterIds.includes(id);
      const newReview = isReview
        ? prev.reviewLaterIds.filter((r) => r !== id)
        : [...prev.reviewLaterIds, id];
      const newState = { ...prev, reviewLaterIds: newReview };
      saveProgress(newState);
      return newState;
    });
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) =>
      state.lessonsCompleted.some((l) => l.lessonId === lessonId && l.completed),
    [state.lessonsCompleted]
  );

  const getLessonScore = useCallback(
    (lessonId: string) =>
      state.lessonsCompleted.find((l) => l.lessonId === lessonId)?.quizScore,
    [state.lessonsCompleted]
  );

  const isModuleUnlocked = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return false;
      return state.xp >= mod.xpRequired;
    },
    [state.xp]
  );

  const getTotalLessonsCompleted = useCallback(
    () => state.lessonsCompleted.filter((l) => l.completed).length,
    [state.lessonsCompleted]
  );

  const getLevelProgress = useCallback(() => {
    const range = getLevelXpRange(state.level);
    const current = state.xp - range.min;
    const required = range.max - range.min;
    const percentage = Math.min(current / required, 1);
    return { current, required, percentage };
  }, [state.xp, state.level]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      lessonsCompleted: state.lessonsCompleted,
      unlockedAchievements: state.unlockedAchievements,
      dailyGoalCompleted: state.dailyGoalCompleted,
      totalQuizzesPerfect: state.totalQuizzesPerfect,
      favoriteIds: state.favoriteIds,
      reviewLaterIds: state.reviewLaterIds,
      getLevelProgress,
      isLessonCompleted,
      getLessonScore,
      completeLesson,
      toggleFavorite,
      toggleReviewLater,
      isModuleUnlocked,
      getTotalLessonsCompleted,
      isLoading,
    }),
    [
      state,
      getLevelProgress,
      isLessonCompleted,
      getLessonScore,
      completeLesson,
      toggleFavorite,
      toggleReviewLater,
      isModuleUnlocked,
      getTotalLessonsCompleted,
      isLoading,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
