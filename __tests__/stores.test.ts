import { act } from 'react-dom/test-utils';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useDownloadStore } from '@/store/downloadStore';
import { useUIStore } from '@/store/uiStore';
import { useReaderStore } from '@/store/readerStore';

describe('stores', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().clearAuth();
      useLibraryStore.getState().clearLibrary();
      useDownloadStore.getState().clearCompleted();
      useUIStore.getState().clearModals();
      useUIStore.getState().clearToasts();
      useReaderStore.getState().resetSettings();
      useReaderStore.getState().resetAudioSettings();
    });
  });

  describe('authStore', () => {
    it('initializes with correct defaults', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
      expect(state.isOnboardingComplete).toBe(false);
    });

    it('sets auth correctly', () => {
      const { setAuth, clearAuth } = useAuthStore.getState();
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        preferences: { theme: 'system' as const, fontSize: 16 },
        subscription: { tier: 'free' as const, status: 'active' as const, cancelAtPeriodEnd: false, entitlements: [] },
        stats: { booksRead: 0, hoursListened: 0, pagesTurned: 0, currentStreak: 0, longestStreak: 0, totalReadingTime: 0, genresExplored: [], authorsRead: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };
      
      act(() => {
        setAuth(mockUser, mockTokens);
      });
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.tokens).toEqual(mockTokens);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      
      act(() => {
        clearAuth();
      });
      
      const clearedState = useAuthStore.getState();
      expect(clearedState.user).toBeNull();
      expect(clearedState.isAuthenticated).toBe(false);
    });

    it('updates preferences', () => {
      const { setAuth, updatePreferences } = useAuthStore.getState();
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        preferences: { theme: 'system' as const, fontSize: 16, fontFamily: 'serif' as const, lineHeight: 1.6, margin: 24, scrollDirection: 'vertical' as const, playbackRate: 1.0, volume: 1.0, skipInterval: 15, downloadQuality: 'medium' as const, wifiOnlyDownloads: true, autoPlayAudio: false, dailyReminder: true, reminderTime: '20:00', language: 'en', genres: [] },
        subscription: { tier: 'free' as const, status: 'active' as const, cancelAtPeriodEnd: false, entitlements: [] },
        stats: { booksRead: 0, hoursListened: 0, pagesTurned: 0, currentStreak: 0, longestStreak: 0, totalReadingTime: 0, genresExplored: [], authorsRead: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      act(() => {
        setAuth(mockUser, { accessToken: '', refreshToken: '', expiresIn: 3600 });
        updatePreferences({ theme: 'dark', fontSize: 18 });
      });
      
      const state = useAuthStore.getState();
      expect(state.user?.preferences.theme).toBe('dark');
      expect(state.user?.preferences.fontSize).toBe(18);
    });
  });

  describe('libraryStore', () => {
    it('initializes with empty library', () => {
      const state = useLibraryStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.continueReading).toHaveLength(0);
      expect(state.downloaded).toHaveLength(0);
      expect(state.wishlist).toHaveLength(0);
      expect(state.history).toHaveLength(0);
    });

    it('adds and removes items', () => {
      const { addItem, removeItem, items } = useLibraryStore.getState();
      
      const mockItem = {
        id: 'lib-1',
        userId: 'user-1',
        bookId: 'book-1',
        book: { id: 'book-1', title: 'Test Book', author: 'Test Author', genres: [], language: 'en', isFree: true, hasEpub: true, hasPdf: false, hasAudiobook: false, hasSummary: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        progress: 0,
        currentPosition: { chapterIndex: 0, chapterProgress: 0, timestamp: Date.now() },
        lastReadAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
        downloadedFormats: [],
        isPurchased: true,
        isFavorite: false,
        tags: [],
      };
      
      act(() => {
        addItem(mockItem);
      });
      
      expect(useLibraryStore.getState().items).toHaveLength(1);
      
      act(() => {
        removeItem('book-1');
      });
      
      expect(useLibraryStore.getState().items).toHaveLength(0);
    });

    it('updates reading progress', () => {
      const { addItem, updateProgress, items } = useLibraryStore.getState();
      
      const mockItem = {
        id: 'lib-1',
        userId: 'user-1',
        bookId: 'book-1',
        book: { id: 'book-1', title: 'Test Book', author: 'Test Author', genres: [], language: 'en', isFree: true, hasEpub: true, hasPdf: false, hasAudiobook: false, hasSummary: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        progress: 0,
        currentPosition: { chapterIndex: 0, chapterProgress: 0, timestamp: Date.now() },
        lastReadAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
        downloadedFormats: [],
        isPurchased: true,
        isFavorite: false,
        tags: [],
      };
      
      act(() => {
        addItem(mockItem);
        updateProgress('book-1', { chapterIndex: 2, chapterProgress: 0.5, timestamp: Date.now() });
      });
      
      const state = useLibraryStore.getState();
      expect(state.items[0].progress).toBe(0.5);
      expect(state.items[0].currentPosition.chapterIndex).toBe(2);
    });

    it('toggles favorite', () => {
      const { addItem, toggleFavorite } = useLibraryStore.getState();
      
      const mockItem = {
        id: 'lib-1',
        userId: 'user-1',
        bookId: 'book-1',
        book: { id: 'book-1', title: 'Test Book', author: 'Test Author', genres: [], language: 'en', isFree: true, hasEpub: true, hasPdf: false, hasAudiobook: false, hasSummary: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        progress: 0,
        currentPosition: { chapterIndex: 0, chapterProgress: 0, timestamp: Date.now() },
        lastReadAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
        downloadedFormats: [],
        isPurchased: true,
        isFavorite: false,
        tags: [],
      };
      
      act(() => {
        addItem(mockItem);
        toggleFavorite('book-1');
      });
      
      expect(useLibraryStore.getState().items[0].isFavorite).toBe(true);
      
      act(() => {
        toggleFavorite('book-1');
      });
      
      expect(useLibraryStore.getState().items[0].isFavorite).toBe(false);
    });

    it('manages highlights and bookmarks', () => {
      const { addHighlight, removeHighlight, addBookmark, removeBookmark } = useLibraryStore.getState();
      
      const mockHighlight = {
        id: 'hl-1',
        userId: 'user-1',
        bookId: 'book-1',
        bookTitle: 'Test Book',
        bookAuthor: 'Test Author',
        content: 'Test highlight',
        color: 'yellow' as const,
        position: { chapterIndex: 1, chapterProgress: 0.3, timestamp: Date.now() },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      act(() => {
        addHighlight(mockHighlight);
      });
      
      expect(useLibraryStore.getState().highlights).toHaveLength(1);
      
      act(() => {
        removeHighlight('hl-1');
      });
      
      expect(useLibraryStore.getState().highlights).toHaveLength(0);
    });
  });

  describe('downloadStore', () => {
    it('initializes with empty queue', () => {
      const state = useDownloadStore.getState();
      expect(state.queue).toHaveLength(0);
      expect(state.activeCount).toBe(0);
    });

    it('manages download queue', () => {
      const { addToQueue, updateTask, removeFromQueue, queue } = useDownloadStore.getState();
      
      const mockTask = {
        id: 'dl-1',
        bookId: 'book-1',
        format: 'epub' as const,
        url: 'https://example.com/book.epub',
        localPath: '/path/to/book.epub',
        progress: 0,
        status: 'pending' as const,
        fileSize: 1024,
        downloadedBytes: 0,
        priority: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      act(() => {
        addToQueue(mockTask);
      });
      
      expect(useDownloadStore.getState().queue).toHaveLength(1);
      
      act(() => {
        updateTask('dl-1', { status: 'downloading', progress: 0.5 });
      });
      
      expect(useDownloadStore.getState().queue[0].status).toBe('downloading');
      expect(useDownloadStore.getState().queue[0].progress).toBe(0.5);
      
      act(() => {
        removeFromQueue('dl-1');
      });
      
      expect(useDownloadStore.getState().queue).toHaveLength(0);
    });

    it('respects max concurrent downloads', () => {
      const { addToQueue, getNextPendingTask, maxConcurrent } = useDownloadStore.getState();
      
      for (let i = 0; i < 5; i++) {
        act(() => {
          addToQueue({
            id: `dl-${i}`,
            bookId: `book-${i}`,
            format: 'epub',
            url: `https://example.com/book${i}.epub`,
            localPath: `/path/book${i}.epub`,
            progress: 0,
            status: 'pending' as const,
            fileSize: 1024,
            downloadedBytes: 0,
            priority: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      }
      
      // Only maxConcurrent should be active
      for (let i = 0; i < maxConcurrent; i++) {
        const task = getNextPendingTask();
        if (task) {
          act(() => {
            useDownloadStore.getState().updateTask(task.id, { status: 'downloading' });
          });
        }
      }
      
      const nextTask = getNextPendingTask();
      expect(nextTask).toBeNull();
    });
  });

  describe('uiStore', () => {
    it('manages UI state', () => {
      const { toggleSidebar, showMiniPlayer, hideMiniPlayer, setActiveTab, pushModal, popModal, addToast, removeToast } = useUIStore.getState();
      
      act(() => {
        toggleSidebar();
      });
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
      
      act(() => {
        showMiniPlayer('book-1');
      });
      expect(useUIStore.getState().isMiniPlayerVisible).toBe(true);
      expect(useUIStore.getState().currentMiniPlayerBookId).toBe('book-1');
      
      act(() => {
        hideMiniPlayer();
      });
      expect(useUIStore.getState().isMiniPlayerVisible).toBe(false);
      
      act(() => {
        setActiveTab('library');
      });
      expect(useUIStore.getState().activeTab).toBe('library');
      
      act(() => {
        pushModal('settings');
      });
      expect(useUIStore.getState().modalStack).toEqual(['settings']);
      
      act(() => {
        popModal();
      });
      expect(useUIStore.getState().modalStack).toHaveLength(0);
      
      act(() => {
        addToast({ type: 'success', title: 'Test', message: 'Test message' });
      });
      expect(useUIStore.getState().toasts).toHaveLength(1);
      
      const toastId = useUIStore.getState().toasts[0].id;
      act(() => {
        removeToast(toastId);
      });
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('readerStore', () => {
    it('manages reader settings', () => {
      const { setSettings, setAudioSettings, settings, audioSettings } = useReaderStore.getState();
      
      act(() => {
        setSettings({ fontSize: 18, theme: 'dark' });
        setAudioSettings({ playbackRate: 1.5, volume: 0.8 });
      });
      
      expect(useReaderStore.getState().settings.fontSize).toBe(18);
      expect(useReaderStore.getState().settings.theme).toBe('dark');
      expect(useReaderStore.getState().audioSettings.playbackRate).toBe(1.5);
      expect(useReaderStore.getState().audioSettings.volume).toBe(0.8);
    });

    it('tracks reading progress', () => {
      const { updateReadingProgress, updateChapterProgress, readingProgress, chapterProgress } = useReaderStore.getState();
      
      act(() => {
        updateReadingProgress('book-1', 0.5);
        updateChapterProgress('book-1', 2, 0.3);
      });
      
      expect(useReaderStore.getState().readingProgress['book-1']).toBe(0.5);
      expect(useReaderStore.getState().chapterProgress['book-1-2']).toBe(0.3);
    });
  });
});