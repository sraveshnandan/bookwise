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
import { AudioService } from '@/services/audioService';
import { downloadService } from '@/services/downloadService';
import { NotificationService } from '@/services/notificationService';
import { SubscriptionService } from '@/services/revenueCat';
import { AuthService } from '@/services/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  React.useEffect(() => {
    initializeAuth(false);
    initializeLibrary(false);
    initializeDownloads(false);
    initializeUI(false);
    initializeReader(false);
    
    AudioService.initialize();
    downloadService.initialize();
    NotificationService.registerForPushNotifications();
    
    const initializeServices = async () => {
      await SubscriptionService.initialize();
      
      const { data: { session } } = await AuthService.getSession();
      if (session?.user) {
        const { data: { user } } = await AuthService.getUser();
        if (user) {
          const customerInfo = await SubscriptionService.getCustomerInfo();
          const isPremium = SubscriptionService.isPremium(customerInfo);
          
          setAuth({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            avatarUrl: user.user_metadata?.avatar_url,
            preferences: {
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
            },
            subscription: {
              tier: isPremium ? 'premium' : 'free',
              status: SubscriptionService.getSubscriptionStatus(customerInfo),
              currentPeriodEnd: SubscriptionService.getCurrentPeriodEnd(customerInfo)?.toISOString(),
              cancelAtPeriodEnd: !SubscriptionService.hasActiveEntitlement(customerInfo, 'premium'),
              entitlements: SubscriptionService.getEntitlements(customerInfo),
            },
            stats: {
              booksRead: 0,
              hoursListened: 0,
              pagesTurned: 0,
              currentStreak: 0,
              longestStreak: 0,
              totalReadingTime: 0,
              genresExplored: [],
              authorsRead: [],
            },
            createdAt: user.created_at,
            updatedAt: user.updated_at || user.created_at,
          }, {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresIn: session.expires_in,
          });
        }
      }
    };
    
    initializeServices();
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    
    const { data: { subscription } } = AuthService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const customerInfo = SubscriptionService.getCustomerInfo();
        const isPremium = SubscriptionService.isPremium(customerInfo);
        
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          avatarUrl: session.user.user_metadata?.avatar_url,
          preferences: {
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
          },
          subscription: {
            tier: isPremium ? 'premium' : 'free',
            status: SubscriptionService.getSubscriptionStatus(customerInfo),
            currentPeriodEnd: SubscriptionService.getCurrentPeriodEnd(customerInfo)?.toISOString(),
            cancelAtPeriodEnd: !SubscriptionService.hasActiveEntitlement(customerInfo, 'premium'),
            entitlements: SubscriptionService.getEntitlements(customerInfo),
          },
          stats: {
            booksRead: 0,
            hoursListened: 0,
            pagesTurned: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalReadingTime: 0,
            genresExplored: [],
            authorsRead: [],
          },
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at || session.user.created_at,
        }, {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
        });
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().clearAuth();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        useAuthStore.getState().setTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [isAuthenticated, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <NativeWindThemeProvider value={colorScheme ?? 'light'}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </NativeWindThemeProvider>
    </QueryClientProvider>
  );
}