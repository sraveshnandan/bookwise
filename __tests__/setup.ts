import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
vi.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo modules
vi.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

vi.mock('expo-font', () => ({
  loadAsync: vi.fn(),
  isLoaded: true,
}));

vi.mock('expo-haptics', () => ({
  impactLight: vi.fn(),
  impactMedium: vi.fn(),
  impactHeavy: vi.fn(),
}));

vi.mock('expo-image', () => ({
  Image: 'Image',
}));

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

vi.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

vi.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: vi.fn(),
    },
    AudioStatus: {},
  },
}));

vi.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  cacheDirectory: '/mock/cache/',
  getInfoAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
  readAsStringAsync: vi.fn(),
  writeAsStringAsync: vi.fn(),
  downloadAsync: vi.fn(),
  deleteAsync: vi.fn(),
}));

vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  getPermissionsAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  getExpoPushTokenAsync: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  addNotificationReceivedListener: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn(),
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('@react-native-community/netinfo', () => ({
  addEventListener: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        getPublicUrl: vi.fn(),
        createSignedUrl: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  })),
}));

vi.mock('react-native-purchases', () => ({
  configure: vi.fn(),
  getOfferings: vi.fn(),
  getCustomerInfo: vi.fn(),
  purchasePackage: vi.fn(),
  restorePurchases: vi.fn(),
  logIn: vi.fn(),
  logOut: vi.fn(),
  setEmail: vi.fn(),
  setAttributes: vi.fn(),
  LOG_LEVEL: { DEBUG: 'DEBUG' },
}));

vi.mock('react-native-track-player', () => ({
  setupPlayer: vi.fn(),
  updateOptions: vi.fn(),
  add: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  seekTo: vi.fn(),
  skipNext: vi.fn(),
  skipPrevious: vi.fn(),
  setRate: vi.fn(),
  setVolume: vi.fn(),
  getCurrentTrack: vi.fn(),
  getProgress: vi.fn(),
  getState: vi.fn(),
  getQueue: vi.fn(),
  removeUpcomingTracks: vi.fn(),
  updateMetadataForTrack: vi.fn(),
  destroy: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  Event: {
    PlaybackState: 'playback-state',
    PlaybackError: 'playback-error',
    PlaybackQueueEnded: 'playback-queue-ended',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
    RemotePause: 'remote-pause',
    RemotePlay: 'remote-play',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteSeek: 'remote-seek',
  },
  State: {
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    Stop: 'stop',
    SeekTo: 'seek-to',
    Skip: 'skip',
    SkipNext: 'skip-next',
    SkipPrevious: 'skip-previous',
  },
  AppKilledPlaybackBehavior: {
    StopPlaybackAndRemoveNotification: 'stop-playback-and-remove-notification',
  },
}));

vi.mock('react-native-pdf', () => ({
  Document: vi.fn(),
}));

vi.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

vi.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  GestureHandlerRootView: 'GestureHandlerRootView',
}));

vi.mock('lucide-react-native', () => {
  const icons = {};
  const createIcon = (name: string) => ({ name, $$typeof: Symbol.for('react.element') });
  return new Proxy({}, {
    get: (_, name) => {
      if (!icons[name]) {
        icons[name] = createIcon(name);
      }
      return icons[name];
    },
  });
});

// Mock react-native-redash
vi.mock('react-native-redash', () => ({
  interpolate: vi.fn(),
  clamp: vi.fn(),
}));

// Mock expo-linking
vi.mock('expo-linking', () => ({
  createURL: vi.fn(),
  parse: vi.fn(),
  openURL: vi.fn(),
}));

// Mock expo-router
vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: any) => children,
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
}));

// Mock @shopify/flash-list
vi.mock('@shopify/flash-list', () => ({
  FlashList: 'FlashList',
}));

// Global test utilities
global.performance = global.performance || {
  now: () => Date.now(),
  mark: vi.fn(),
  measure: vi.fn(),
};

// Console suppressions for tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('act(...)') ||
      args[0]?.includes?.('useLayoutEffect')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});