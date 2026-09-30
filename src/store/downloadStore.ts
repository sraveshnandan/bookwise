import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DownloadTask } from '@/types';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { DOWNLOAD_CONFIG } from '@/constants/app';

interface DownloadState {
  queue: DownloadTask[];
  activeCount: number;
  maxConcurrent: number;
  wifiOnly: boolean;
  
  addToQueue: (task: DownloadTask) => void;
  removeFromQueue: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<DownloadTask>) => void;
  updateProgress: (taskId: string, progress: number, downloadedBytes: number) => void;
  setTaskStatus: (taskId: string, status: DownloadTask['status'], error?: string) => void;
  pauseTask: (taskId: string) => void;
  resumeTask: (taskId: string) => void;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  setWifiOnly: (wifiOnly: boolean) => void;
  setMaxConcurrent: (count: number) => void;
  getNextPendingTask: () => DownloadTask | null;
  getTasksByStatus: (status: DownloadTask['status']) => DownloadTask[];
  getTasksByBookId: (bookId: string) => DownloadTask[];
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      queue: [],
      activeCount: 0,
      maxConcurrent: DOWNLOAD_CONFIG.maxConcurrent,
      wifiOnly: DOWNLOAD_CONFIG.wifiOnly,

      addToQueue: (task) => set((state) => ({
        queue: [...state.queue, task].sort((a, b) => b.priority - a.priority),
      })),

      removeFromQueue: (taskId) => set((state) => ({
        queue: state.queue.filter((task) => task.id !== taskId),
      })),

      updateTask: (taskId, updates) => set((state) => ({
        queue: state.queue.map((task) =>
          task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        ),
      })),

      updateProgress: (taskId, progress, downloadedBytes) => set((state) => ({
        queue: state.queue.map((task) =>
          task.id === taskId
            ? { ...task, progress, downloadedBytes, updatedAt: new Date().toISOString() }
            : task
        ),
      })),

      setTaskStatus: (taskId, status, error) => set((state) => {
        const task = state.queue.find((t) => t.id === taskId);
        const wasActive = task?.status === 'downloading';
        const isActive = status === 'downloading';
        
        return {
          queue: state.queue.map((task) =>
            task.id === taskId
              ? { ...task, status, error, updatedAt: new Date().toISOString() }
              : task
          ),
          activeCount: state.activeCount + (isActive ? 1 : 0) - (wasActive ? 1 : 0),
        };
      }),

      pauseTask: (taskId) => set((state) => {
        const task = state.queue.find((t) => t.id === taskId);
        if (task?.status !== 'downloading') return state;
        
        return {
          queue: state.queue.map((task) =>
            task.id === taskId
              ? { ...task, status: 'paused' as const, updatedAt: new Date().toISOString() }
              : task
          ),
          activeCount: Math.max(0, state.activeCount - 1),
        };
      }),

      resumeTask: (taskId) => set((state) => {
        const task = state.queue.find((t) => t.id === taskId);
        if (task?.status !== 'paused') return state;
        if (state.activeCount >= state.maxConcurrent) return state;
        
        return {
          queue: state.queue.map((task) =>
            task.id === taskId
              ? { ...task, status: 'downloading' as const, updatedAt: new Date().toISOString() }
              : task
          ),
          activeCount: state.activeCount + 1,
        };
      }),

      cancelTask: (taskId) => set((state) => {
        const task = state.queue.find((t) => t.id === taskId);
        const wasActive = task?.status === 'downloading';
        
        return {
          queue: state.queue.map((task) =>
            task.id === taskId
              ? { ...task, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
              : task
          ),
          activeCount: wasActive ? Math.max(0, state.activeCount - 1) : state.activeCount,
        };
      }),

      retryTask: (taskId) => set((state) => {
        const task = state.queue.find((t) => t.id === taskId);
        if (!task || task.status !== 'failed') return state;
        if (state.activeCount >= state.maxConcurrent) {
          return {
            queue: state.queue.map((task) =>
              task.id === taskId
                ? { ...task, status: 'pending' as const, error: undefined, retryAttempts: (task.retryAttempts || 0) + 1, updatedAt: new Date().toISOString() }
                : task
            ),
          };
        }
        
        return {
          queue: state.queue.map((task) =>
            task.id === taskId
              ? { ...task, status: 'downloading' as const, error: undefined, retryAttempts: (task.retryAttempts || 0) + 1, updatedAt: new Date().toISOString() }
              : task
          ),
          activeCount: state.activeCount + 1,
        };
      }),

      clearCompleted: () => set((state) => ({
        queue: state.queue.filter((task) => task.status !== 'completed'),
      })),

      clearFailed: () => set((state) => ({
        queue: state.queue.filter((task) => task.status !== 'failed'),
      })),

      setWifiOnly: (wifiOnly) => set({ wifiOnly }),

      setMaxConcurrent: (maxConcurrent) => set({ maxConcurrent }),

      getNextPendingTask: () => {
        const { queue, activeCount, maxConcurrent } = get();
        if (activeCount >= maxConcurrent) return null;
        return queue.find((task) => task.status === 'pending') || null;
      },

      getTasksByStatus: (status) => {
        return get().queue.filter((task) => task.status === status);
      },

      getTasksByBookId: (bookId) => {
        return get().queue.filter((task) => task.bookId === bookId);
      },
    }),
    {
      name: 'download-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        queue: state.queue.filter((t) => t.status !== 'completed' && t.status !== 'cancelled'),
        maxConcurrent: state.maxConcurrent,
        wifiOnly: state.wifiOnly,
      }),
    }
  )
);

export const useDownloadQueue = () => useDownloadStore((state) => state.queue);
export const useActiveDownloadCount = () => useDownloadStore((state) => state.activeCount);
export const useDownloadWifiOnly = () => useDownloadStore((state) => state.wifiOnly);