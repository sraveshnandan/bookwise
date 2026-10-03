export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          preferences: UserPreferences;
          subscription_tier: 'free' | 'premium' | 'lifetime';
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
          subscription_current_period_end: string | null;
          subscription_cancel_at_period_end: boolean;
          entitlements: string[];
          stats: ReadingStats;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      books: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          author: string;
          authors: string[] | null;
          cover_url: string | null;
          cover_urls: Record<string, string> | null;
          description: string | null;
          genres: string[];
          published_date: string | null;
          page_count: number | null;
          language: string;
          isbn10: string | null;
          isbn13: string | null;
          publisher: string | null;
          maturity_rating: string | null;
          average_rating: number | null;
          ratings_count: number | null;
          preview_url: string | null;
          info_link: string | null;
          canonical_volume_link: string | null;
          google_books_id: string | null;
          open_library_id: string | null;
          open_library_key: string | null;
          gutenberg_id: string | null;
          librivox_id: string | null;
          has_epub: boolean;
          has_pdf: boolean;
          has_audiobook: boolean;
          has_summary: boolean;
          is_free: boolean;
          price: number | null;
          sale_price: number | null;
          currency: string;
          epub_url: string | null;
          pdf_url: string | null;
          audiobook_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['books']['Insert']>;
      };
      summaries: {
        Row: {
          id: string;
          book_id: string;
          type: 'text' | 'pdf' | 'audio';
          title: string;
          content: string;
          audio_url: string | null;
          pdf_url: string | null;
          duration: number | null;
          word_count: number;
          key_takeaways: string[];
          chapters: SummaryChapter[];
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['summaries']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['summaries']['Insert']>;
      };
      user_library: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          progress: number;
          current_position: ReadingPosition;
          last_read_at: string;
          added_at: string;
          downloaded_formats: DownloadedFormat[];
          is_purchased: boolean;
          is_favorite: boolean;
          rating: number | null;
          review: string | null;
          tags: string[];
          reading_goal: ReadingGoal | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_library']['Row'], 'added_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_library']['Insert']>;
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          chapter_index: number;
          chapter_progress: number;
          page_number: number | null;
          audio_position: number | null;
          cfi: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reading_progress']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['reading_progress']['Insert']>;
      };
      highlights: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          book_title: string;
          book_author: string;
          content: string;
          note: string | null;
          color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
          position: ReadingPosition;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['highlights']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['highlights']['Insert']>;
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          position: ReadingPosition;
          title: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>;
      };
      user_stats: {
        Row: {
          user_id: string;
          books_read: number;
          hours_listened: number;
          pages_turned: number;
          current_streak: number;
          longest_streak: number;
          total_reading_time: number;
          genres_explored: string[];
          authors_read: string[];
          last_read_date: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_stats']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_stats']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          progress: number | null;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'unlocked_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      downloads: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          format: 'epub' | 'pdf' | 'audiobook' | 'summary-text' | 'summary-pdf' | 'summary-audio';
          url: string;
          local_path: string;
          progress: number;
          status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
          file_size: number;
          downloaded_bytes: number;
          resume_data: string | null;
          error: string | null;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['downloads']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['downloads']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'reading_reminder' | 'new_release' | 'download_complete' | 'subscription_update' | 'achievement';
          title: string;
          body: string;
          data: Record<string, any> | null;
          scheduled_at: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      UserPreferences: UserPreferences;
      ReadingStats: ReadingStats;
      ReadingPosition: ReadingPosition;
      DownloadedFormat: DownloadedFormat;
      ReadingGoal: ReadingGoal;
      SummaryChapter: SummaryChapter;
    };
  };
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

export interface ReadingStats {
  booksRead: number;
  hoursListened: number;
  pagesTurned: number;
  currentStreak: number;
  longestStreak: number;
  totalReadingTime: number;
  genresExplored: string[];
  authorsRead: string[];
  lastReadDate: string | null;
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

export interface SummaryChapter {
  id: string;
  title: string;
  content: string;
  audioUrl: string | null;
  startTime: number | null;
  endTime: number | null;
  order: number;
}