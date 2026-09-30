import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserPreferences, AuthTokens, SubscriptionStatus, ReadingStats } from '@/types';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateSubscription: (subscription: SubscriptionStatus) => void;
  updateStats: (stats: Partial<ReadingStats>) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 16,
  fontFamily: 'serif',
  lineHeight: 1.6,
  margin: 24,
  scrollDirection: 'vertical',
  playbackRate: 1.0,
  volume: 1.0,
  skipInterval: 15,
  downloadQuality: 'medium',
  wifiOnlyDownloads: true,
  autoPlayAudio: false,
  dailyReminder: true,
  reminderTime: '20:00',
  language: 'en',
  genres: [],
};

const defaultStats: ReadingStats = {
  booksRead: 0,
  hoursListened: 0,
  pagesTurned: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalReadingTime: 0,
  genresExplored: [],
  authorsRead: [],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      isOnboardingComplete: false,

      setAuth: (user, tokens) => set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        isOnboardingComplete: user.preferences?.genres?.length > 0,
      }),

      setUser: (user) => set({ user }),

      setTokens: (tokens) => set({ tokens }),

      clearAuth: () => set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isOnboardingComplete: false,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setOnboardingComplete: (isOnboardingComplete) => set({ isOnboardingComplete }),

      updatePreferences: (preferences) => set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: { ...state.user.preferences, ...preferences },
        } : null,
      })),

      updateSubscription: (subscription) => set((state) => ({
        user: state.user ? {
          ...state.user,
          subscription,
        } : null,
      })),

      updateStats: (stats) => set((state) => ({
        user: state.user ? {
          ...state.user,
          stats: { ...state.user.stats, ...stats },
        } : null,
      })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        isOnboardingComplete: state.isOnboardingComplete,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);

export const useUserPreferences = () => useAuthStore((state) => state.user?.preferences ?? defaultPreferences);
export const useUserSubscription = () => useAuthStore((state) => state.user?.subscription);
export const useUserStats = () => useAuthStore((state) => state.user?.stats ?? defaultStats);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsOnboardingComplete = () => useAuthStore((state) => state.isOnboardingComplete);