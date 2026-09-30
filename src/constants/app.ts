export const APP_CONFIG = {
  name: 'BookWise',
  version: '1.0.0',
  bundleId: 'com.bookwise.app',
} as const;

export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  userPreferences: 'user_preferences',
  readingProgress: 'reading_progress',
  downloadedBooks: 'downloaded_books',
  downloadQueue: 'download_queue',
  lastSync: 'last_sync',
} as const;

export const API_CONFIG = {
  googleBooks: {
    baseUrl: 'https://www.googleapis.com/books/v1',
    maxResults: 40,
  },
  openLibrary: {
    baseUrl: 'https://openlibrary.org',
    coversBaseUrl: 'https://covers.openlibrary.org/b',
  },
  gutenberg: {
    baseUrl: 'https://gutendex.com',
  },
  librivox: {
    baseUrl: 'https://librivox.org/api',
  },
} as const;

export const READER_DEFAULTS = {
  fontSize: 16,
  lineHeight: 1.6,
  margin: 24,
  fontFamily: 'serif',
  theme: 'light',
  scrollDirection: 'vertical',
} as const;

export const AUDIO_DEFAULTS = {
  playbackRate: 1.0,
  volume: 1.0,
  skipInterval: 15,
  sleepTimer: null,
} as const;

export const DOWNLOAD_CONFIG = {
  maxConcurrent: 3,
  chunkSize: 1024 * 1024,
  retryAttempts: 3,
  retryDelay: 1000,
  wifiOnly: true,
} as const;

export const FREE_TIER_LIMITS = {
  summariesPerDay: 3,
  highlightsTotal: 10,
  offlineDownloads: 0,
  syncDevices: 1,
} as const;

export const PREMIUM_FEATURES = {
  unlimitedSummaries: true,
  offlineAccess: true,
  audioSummaries: true,
  noAds: true,
  unlimitedHighlights: true,
  advancedStats: true,
  allThemes: true,
  allFonts: true,
  syncDevices: 5,
} as const;

export const SUBSCRIPTION_PRODUCTS = {
  monthly: 'premium_monthly',
  annual: 'premium_annual',
  lifetime: 'lifetime_access',
} as const;

export const ENTITLEMENTS = {
  premium: 'premium',
  offlineAccess: 'offline_access',
  audioSummaries: 'audio_summaries',
  noAds: 'no_ads',
} as const;

export const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery & Thriller',
  'Romance',
  'Science Fiction & Fantasy',
  'Biography & Memoir',
  'History',
  'Self-Help',
  'Business & Money',
  'Health & Fitness',
  'Psychology',
  'Philosophy',
  'Science & Technology',
  'Arts & Photography',
  'Cooking & Food',
  'Travel',
  'Religion & Spirituality',
  'Parenting & Relationships',
  'Children\'s Books',
  'Young Adult',
] as const;

export const READING_STATS_KEYS = [
  'booksRead',
  'hoursListened',
  'pagesTurned',
  'currentStreak',
  'longestStreak',
  'totalReadingTime',
  'genresExplored',
  'authorsRead',
] as const;

export const ACHIEVEMENTS = [
  { id: 'first_book', name: 'First Steps', description: 'Complete your first book', icon: 'book-open' },
  { id: 'night_owl', name: 'Night Owl', description: 'Read after midnight', icon: 'moon' },
  { id: 'early_bird', name: 'Early Bird', description: 'Read before 6 AM', icon: 'sunrise' },
  { id: 'speed_reader', name: 'Speed Reader', description: 'Finish a book in one day', icon: 'zap' },
  { id: 'genre_explorer', name: 'Genre Explorer', description: 'Read 5 different genres', icon: 'compass' },
  { id: 'century_club', name: 'Century Club', description: 'Read 100 books', icon: 'trophy' },
  { id: 'streak_week', name: 'Week Streak', description: 'Read 7 days in a row', icon: 'flame' },
  { id: 'streak_month', name: 'Month Streak', description: 'Read 30 days in a row', icon: 'calendar' },
  { id: 'audiobook_lover', name: 'Audiobook Lover', description: 'Listen to 10 audiobooks', icon: 'headphones' },
  { id: 'summary_master', name: 'Summary Master', description: 'Read 50 summaries', icon: 'file-text' },
] as const;