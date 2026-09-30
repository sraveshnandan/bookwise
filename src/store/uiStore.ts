import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

interface UIState {
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  isMiniPlayerVisible: boolean;
  currentMiniPlayerBookId: string | null;
  activeTab: 'home' | 'library' | 'search' | 'profile';
  modalStack: string[];
  toasts: Toast[];
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  showMiniPlayer: (bookId: string) => void;
  hideMiniPlayer: () => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  pushModal: (modalName: string) => void;
  popModal: () => void;
  clearModals: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isSidebarOpen: false,
      isSearchOpen: false,
      isMiniPlayerVisible: false,
      currentMiniPlayerBookId: null,
      activeTab: 'home',
      modalStack: [],
      toasts: [],

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),

      showMiniPlayer: (bookId) => set({
        isMiniPlayerVisible: true,
        currentMiniPlayerBookId: bookId,
      }),

      hideMiniPlayer: () => set({
        isMiniPlayerVisible: false,
        currentMiniPlayerBookId: null,
      }),

      setActiveTab: (activeTab) => set({ activeTab }),

      pushModal: (modalName) => set((state) => ({
        modalStack: [...state.modalStack, modalName],
      })),

      popModal: () => set((state) => ({
        modalStack: state.modalStack.slice(0, -1),
      })),

      clearModals: () => set({ modalStack: [] }),

      addToast: (toast) => set((state) => ({
        toasts: [
          ...state.toasts,
          { ...toast, id: Math.random().toString(36).slice(2, 9) }
        ],
      })),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        isMiniPlayerVisible: state.isMiniPlayerVisible,
        currentMiniPlayerBookId: state.currentMiniPlayerBookId,
      }),
    }
  )
);

export const useToasts = () => useUIStore((state) => state.toasts);
export const useActiveTab = () => useUIStore((state) => state.activeTab);
export const useMiniPlayer = () => useUIStore((state) => ({
  isVisible: state.isMiniPlayerVisible,
  bookId: state.currentMiniPlayerBookId,
}));