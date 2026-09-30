export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  subscription: SubscriptionStatus;
  stats: ReadingStats;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  lineHeight: number;
  margin: number;
  scrollDirection: 'vertical' | 'horizontal';
  playbackRate: number;
  volume: number;
  skipInterval: number;
  downloadQuality: 'low' | 'medium' | 'high';
  wifiOnlyDownloads: boolean;
  autoPlayAudio: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  language: string;
  genres: string[];
}

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'lifetime';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  entitlements: string[];
}

export interface ReadingStats {
  booksRead: number;
  hoursListened: number;
  pagesTurned: number;
  currentStreak: number;
  longestStreak: number;
  totalReadingTime: number;
  genresExplored: string[];
  authorsRead: string[];
  lastReadDate?: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authors?: string[];
  coverUrl?: string;
  coverUrls?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  description?: string;
  genres: string[];
  publishedDate?: string;
  pageCount?: number;
  language: string;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  maturityRating?: string;
  averageRating?: number;
  ratingsCount?: number;
  previewUrl?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
  // Source identifiers
  googleBooksId?: string;
  openLibraryId?: string;
  openLibraryKey?: string;
  gutenbergId?: string;
  librivoxId?: string;
  // Availability
  hasEpub: boolean;
  hasPdf: boolean;
  hasAudiobook: boolean;
  hasSummary: boolean;
  // Pricing
  isFree: boolean;
  price?: number;
  salePrice?: number;
  currency?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  id: string;
  bookId: string;
  type: 'text' | 'pdf' | 'audio';
  title: string;
  content: string;
  audioUrl?: string;
  pdfUrl?: string;
  duration?: number;
  wordCount: number;
  keyTakeaways: string[];
  chapters: SummaryChapter[];
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryChapter {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  startTime?: number;
  endTime?: number;
  order: number;
}

export interface UserLibraryItem {
  id: string;
  userId: string;
  bookId: string;
  book: Book;
  progress: number;
  currentPosition: ReadingPosition;
  lastReadAt: string;
  addedAt: string;
  downloadedFormats: DownloadedFormat[];
  isPurchased: boolean;
  isFavorite: boolean;
  rating?: number;
  review?: string;
  tags: string[];
  readingGoal?: ReadingGoal;
}

export interface ReadingPosition {
  chapterIndex: number;
  chapterProgress: number;
  cfi?: string;
  pageNumber?: number;
  timestamp: number;
  audioPosition?: number;
}

export interface DownloadedFormat {
  format: 'epub' | 'pdf' | 'audiobook' | 'summary-text' | 'summary-pdf' | 'summary-audio';
  localPath: string;
  fileSize: number;
  downloadedAt: string;
  version: string;
}

export interface ReadingGoal {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target: number;
  unit: 'minutes' | 'pages' | 'books';
  current: number;
  periodStart: string;
  periodEnd: string;
}

export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  content: string;
  note?: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  position: ReadingPosition;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  position: ReadingPosition;
  title?: string;
  note?: string;
  createdAt: string;
}

export interface DownloadTask {
  id: string;
  bookId: string;
  format: 'epub' | 'pdf' | 'audiobook' | 'summary-text' | 'summary-pdf' | 'summary-audio';
  url: string;
  localPath: string;
  progress: number;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  fileSize: number;
  downloadedBytes: number;
  resumeData?: string;
  error?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  genres?: string[];
  formats?: ('book' | 'audiobook' | 'summary')[];
  price?: 'free' | 'paid' | 'all';
  length?: 'short' | 'medium' | 'long' | 'all';
  language?: string;
  rating?: number;
  sortBy?: 'relevance' | 'newest' | 'popular' | 'rating' | 'title' | 'author';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets?: SearchFacets;
}

export interface SearchFacets {
  genres: { value: string; count: number }[];
  formats: { value: string; count: number }[];
  languages: { value: string; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NotificationPayload {
  id: string;
  type: 'reading_reminder' | 'new_release' | 'download_complete' | 'subscription_update' | 'achievement';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  scheduledAt?: string;
  readAt?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface OnboardingData {
  step: number;
  selectedGenres: string[];
  readingGoal?: ReadingGoal;
  notificationPermission: boolean;
  completed: boolean;
}

export interface DeepLinkParams {
  bookId?: string;
  summaryId?: string;
  tab?: 'home' | 'library' | 'search' | 'profile';
  action?: 'read' | 'listen' | 'summary' | 'download';
}

export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  modal: undefined;
  book: { id: string };
  reader: { bookId: string; format: 'epub' | 'pdf' };
  audioPlayer: { bookId: string; chapterId?: string };
  summary: { bookId: string; summaryId?: string };
  search: { query?: string };
  settings: undefined;
  profile: undefined;
  subscription: undefined;
  downloads: undefined;
  stats: undefined;
};

export type TabParamList = {
  index: undefined;
  library: undefined;
  search: undefined;
  profile: undefined;
};

export type AuthStackParamList = {
  welcome: undefined;
  login: undefined;
  register: undefined;
  onboarding: undefined;
  forgotPassword: undefined;
};