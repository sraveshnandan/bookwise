import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { READER_DEFAULTS, AUDIO_DEFAULTS } from '@/constants/app';

interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  margin: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  theme: 'light' | 'dark' | 'sepia' | 'auto';
  scrollDirection: 'vertical' | 'horizontal';
  showPageNumbers: boolean;
  enableHyphenation: boolean;
  justifyText: boolean;
}

interface AudioSettings {
  playbackRate: number;
  volume: number;
  skipInterval: number;
  sleepTimer: number | null;
  autoPlayNext: boolean;
  normalizeAudio: boolean;
}

interface ReaderState {
  settings: ReaderSettings;
  audioSettings: AudioSettings;
  currentBookId: string | null;
  currentFormat: 'epub' | 'pdf' | 'audiobook' | null;
  isReaderOpen: boolean;
  readingProgress: Record<string, number>;
  chapterProgress: Record<string, number>;
  
  setSettings: (settings: Partial<ReaderSettings>) => void;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;
  setCurrentBook: (bookId: string | null, format?: ReaderState['currentFormat']) => void;
  setReaderOpen: (open: boolean) => void;
  updateReadingProgress: (bookId: string, progress: number) => void;
  updateChapterProgress: (bookId: string, chapterIndex: number, progress: number) => void;
  resetSettings: () => void;
  resetAudioSettings: () => void;
}

const defaultReaderSettings: ReaderSettings = {
  fontSize: READER_DEFAULTS.fontSize,
  lineHeight: READER_DEFAULTS.lineHeight,
  margin: READER_DEFAULTS.margin,
  fontFamily: READER_DEFAULTS.fontFamily,
  theme: READER_DEFAULTS.theme,
  scrollDirection: READER_DEFAULTS.scrollDirection,
  showPageNumbers: true,
  enableHyphenation: true,
  justifyText: true,
};

const defaultAudioSettings: AudioSettings = {
  playbackRate: AUDIO_DEFAULTS.playbackRate,
  volume: AUDIO_DEFAULTS.volume,
  skipInterval: AUDIO_DEFAULTS.skipInterval,
  sleepTimer: AUDIO_DEFAULTS.sleepTimer,
  autoPlayNext: true,
  normalizeAudio: false,
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      settings: defaultReaderSettings,
      audioSettings: defaultAudioSettings,
      currentBookId: null,
      currentFormat: null,
      isReaderOpen: false,
      readingProgress: {},
      chapterProgress: {},

      setSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings },
      })),

      setAudioSettings: (settings) => set((state) => ({
        audioSettings: { ...state.audioSettings, ...settings },
      })),

      setCurrentBook: (currentBookId, currentFormat) => set({
        currentBookId,
        currentFormat,
        isReaderOpen: !!currentBookId,
      }),

      setReaderOpen: (isReaderOpen) => set({ isReaderOpen }),

      updateReadingProgress: (bookId, progress) => set((state) => ({
        readingProgress: { ...state.readingProgress, [bookId]: progress },
      })),

      updateChapterProgress: (bookId, chapterIndex, progress) => set((state) => ({
        chapterProgress: {
          ...state.chapterProgress,
          [`${bookId}-${chapterIndex}`]: progress,
        },
      })),

      resetSettings: () => set({ settings: defaultReaderSettings }),
      resetAudioSettings: () => set({ audioSettings: defaultAudioSettings }),
    }),
    {
      name: 'reader-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        audioSettings: state.audioSettings,
        readingProgress: state.readingProgress,
        chapterProgress: state.chapterProgress,
      }),
    }
  )
);

export const useReaderSettings = () => useReaderStore((state) => state.settings);
export const useAudioSettings = () => useReaderStore((state) => state.audioSettings);
export const useCurrentBook = () => useReaderStore((state) => ({
  bookId: state.currentBookId,
  format: state.currentFormat,
  isOpen: state.isReaderOpen,
}));