import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserLibraryItem, ReadingPosition, DownloadedFormat, Highlight, Bookmark, ReadingGoal } from '@/types';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

interface LibraryState {
  items: UserLibraryItem[];
  continueReading: UserLibraryItem[];
  downloaded: UserLibraryItem[];
  wishlist: UserLibraryItem[];
  history: UserLibraryItem[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  
  setItems: (items: UserLibraryItem[]) => void;
  addItem: (item: UserLibraryItem) => void;
  removeItem: (bookId: string) => void;
  updateItem: (bookId: string, updates: Partial<UserLibraryItem>) => void;
  updateProgress: (bookId: string, position: ReadingPosition) => void;
  toggleFavorite: (bookId: string) => void;
  setRating: (bookId: string, rating: number, review?: string) => void;
  addTag: (bookId: string, tag: string) => void;
  removeTag: (bookId: string, tag: string) => void;
  setReadingGoal: (bookId: string, goal: ReadingGoal) => void;
  setContinueReading: (items: UserLibraryItem[]) => void;
  setDownloaded: (items: UserLibraryItem[]) => void;
  setWishlist: (items: UserLibraryItem[]) => void;
  setHistory: (items: UserLibraryItem[]) => void;
  addDownloadedFormat: (bookId: string, format: DownloadedFormat) => void;
  removeDownloadedFormat: (bookId: string, format: DownloadedFormat['format']) => void;
  setHighlights: (highlights: Highlight[]) => void;
  addHighlight: (highlight: Highlight) => void;
  updateHighlight: (id: string, updates: Partial<Highlight>) => void;
  removeHighlight: (id: string) => void;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  removeBookmark: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearLibrary: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: [],
      continueReading: [],
      downloaded: [],
      wishlist: [],
      history: [],
      highlights: [],
      bookmarks: [],
      isLoading: false,
      error: null,

      setItems: (items) => set({ items }),

      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),

      removeItem: (bookId) => set((state) => ({
        items: state.items.filter((item) => item.bookId !== bookId),
        continueReading: state.continueReading.filter((item) => item.bookId !== bookId),
        downloaded: state.downloaded.filter((item) => item.bookId !== bookId),
        wishlist: state.wishlist.filter((item) => item.bookId !== bookId),
        history: state.history.filter((item) => item.bookId !== bookId),
        highlights: state.highlights.filter((h) => h.bookId !== bookId),
        bookmarks: state.bookmarks.filter((b) => b.bookId !== bookId),
      })),

      updateItem: (bookId, updates) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId ? { ...item, ...updates } : item
        ),
        continueReading: state.continueReading.map((item) =>
          item.bookId === bookId ? { ...item, ...updates } : item
        ),
        downloaded: state.downloaded.map((item) =>
          item.bookId === bookId ? { ...item, ...updates } : item
        ),
        wishlist: state.wishlist.map((item) =>
          item.bookId === bookId ? { ...item, ...updates } : item
        ),
        history: state.history.map((item) =>
          item.bookId === bookId ? { ...item, ...updates } : item
        ),
      })),

      updateProgress: (bookId, position) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId
            ? { ...item, currentPosition: position, progress: position.chapterProgress, lastReadAt: new Date().toISOString() }
            : item
        ),
        continueReading: state.continueReading.map((item) =>
          item.bookId === bookId
            ? { ...item, currentPosition: position, progress: position.chapterProgress, lastReadAt: new Date().toISOString() }
            : item
        ),
      })),

      toggleFavorite: (bookId) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId ? { ...item, isFavorite: !item.isFavorite } : item
        ),
      })),

      setRating: (bookId, rating, review) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId ? { ...item, rating, review } : item
        ),
      })),

      addTag: (bookId, tag) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId && !item.tags.includes(tag)
            ? { ...item, tags: [...item.tags, tag] }
            : item
        ),
      })),

      removeTag: (bookId, tag) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId
            ? { ...item, tags: item.tags.filter((t) => t !== tag) }
            : item
        ),
      })),

      setReadingGoal: (bookId, goal) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId ? { ...item, readingGoal: goal } : item
        ),
      })),

      setContinueReading: (continueReading) => set({ continueReading }),

      setDownloaded: (downloaded) => set({ downloaded }),

      setWishlist: (wishlist) => set({ wishlist }),

      setHistory: (history) => set({ history }),

      addDownloadedFormat: (bookId, format) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId && !item.downloadedFormats.some((f) => f.format === format.format)
            ? { ...item, downloadedFormats: [...item.downloadedFormats, format] }
            : item
        ),
      })),

      removeDownloadedFormat: (bookId, format) => set((state) => ({
        items: state.items.map((item) =>
          item.bookId === bookId
            ? { ...item, downloadedFormats: item.downloadedFormats.filter((f) => f.format !== format) }
            : item
        ),
      })),

      setHighlights: (highlights) => set({ highlights }),

      addHighlight: (highlight) => set((state) => ({
        highlights: [...state.highlights, highlight],
      })),

      updateHighlight: (id, updates) => set((state) => ({
        highlights: state.highlights.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      })),

      removeHighlight: (id) => set((state) => ({
        highlights: state.highlights.filter((h) => h.id !== id),
      })),

      setBookmarks: (bookmarks) => set({ bookmarks }),

      addBookmark: (bookmark) => set((state) => ({
        bookmarks: [...state.bookmarks, bookmark],
      })),

      updateBookmark: (id, updates) => set((state) => ({
        bookmarks: state.bookmarks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      })),

      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearLibrary: () => set({
        items: [],
        continueReading: [],
        downloaded: [],
        wishlist: [],
        history: [],
        highlights: [],
        bookmarks: [],
      }),
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        continueReading: state.continueReading,
        downloaded: state.downloaded,
        wishlist: state.wishlist,
        history: state.history,
        highlights: state.highlights,
        bookmarks: state.bookmarks,
      }),
    }
  )
);

export const useLibraryItems = () => useLibraryStore((state) => state.items);
export const useContinueReading = () => useLibraryStore((state) => state.continueReading);
export const useDownloadedBooks = () => useLibraryStore((state) => state.downloaded);
export const useWishlist = () => useLibraryStore((state) => state.wishlist);
export const useHistory = () => useLibraryStore((state) => state.history);
export const useHighlights = () => useLibraryStore((state) => state.highlights);
export const useBookmarks = () => useLibraryStore((state) => state.bookmarks);