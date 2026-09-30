import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NativeWindThemeProvider } from 'nativewind';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useDownloadStore } from '@/store/downloadStore';
import { useUIStore } from '@/store/uiStore';
import { useReaderStore } from '@/store/readerStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const initializeAuth = useAuthStore((state) => state.setLoading);
  const initializeLibrary = useLibraryStore((state) => state.setLoading);
  const initializeDownloads = useDownloadStore((state) => state.setLoading);
  const initializeUI = useUIStore((state) => state.setLoading);
  const initializeReader = useReaderStore((state) => state.setLoading);

  React.useEffect(() => {
    initializeAuth(false);
    initializeLibrary(false);
    initializeDownloads(false);
    initializeUI(false);
    initializeReader(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NativeWindThemeProvider value={colorScheme ?? 'light'}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </NativeWindThemeProvider>
    </QueryClientProvider>
  );
}