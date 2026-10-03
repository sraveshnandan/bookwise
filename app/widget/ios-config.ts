// iOS Widget Configuration for BookWise
// This is a conceptual configuration - actual widget implementation requires Swift

export const IOS_WIDGET_CONFIG = {
  name: 'BookWise',
  description: 'Track your reading progress and continue where you left off',
  supportedFamilies: [
    'systemSmall',
    'systemMedium', 
    'systemLarge',
    'systemExtraLarge',
  ],
  
  small: {
    name: 'Current Book',
    description: 'Shows your current book cover and progress',
    content: [
      'Book cover image',
      'Book title',
      'Author name',
      'Progress bar',
      'Percentage complete',
    ],
    actions: [
      'Open book in app',
      'Mark as finished',
    ],
  },
  
  medium: {
    name: 'Reading Stack',
    description: 'Shows up to 3 books you\'re currently reading',
    content: [
      'Up to 3 book covers',
      'Titles and authors',
      'Progress indicators',
    ],
    actions: [
      'Open specific book',
      'View full library',
    ],
  },
  
  large: {
    name: 'Reading Dashboard',
    description: 'Comprehensive reading stats and current books',
    content: [
      'Reading streak',
      'Books finished this month',
      'Hours listened',
      'Top genre',
      'Current book with progress',
      'Up next recommendations',
    ],
    actions: [
      'Open current book',
      'View stats',
      'Browse recommendations',
    ],
  },
  
  extraLarge: {
    name: 'Full Reading View',
    description: 'iPad-only expanded view with more content',
    content: [
      'All medium widget content',
      'Additional stats',
      'Recent activity',
      'Achievement progress',
    ],
    actions: [
      'All medium actions',
      'Open specific sections',
    ],
  },
  
  timeline: {
    updateFrequency: 'hourly',
    relevancy: {
      'reading-time': 'morning, evening',
      'streak-risk': 'evening',
      'new-release': 'anytime',
    },
  },
  
  intents: [
    'openBook',
    'markFinished',
    'continueReading',
    'openLibrary',
    'viewStats',
  ],
};

export const WIDGET_DEEP_LINKS = {
  openBook: 'bookwise://book/{bookId}',
  openReader: 'bookwise://reader/{bookId}?format=epub',
  openAudioPlayer: 'bookwise://audioPlayer/{bookId}',
  openLibrary: 'bookwise://library',
  openStats: 'bookwise://stats',
  openSearch: 'bookwise://search',
};

export default IOS_WIDGET_CONFIG;