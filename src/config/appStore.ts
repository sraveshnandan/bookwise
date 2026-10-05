export const APP_STORE_CONFIG = {
  name: 'BookWise',
  subtitle: 'Read More, Learn Faster',
  description: `
BookWise is your personal micro-reading companion. Access millions of books, audiobooks, and expert summaries—all in one beautiful app.

KEY FEATURES:

📚 VAST LIBRARY
• Millions of books from Google Books, Open Library, Project Gutenberg, and LibriVox
• Free public domain classics and bestsellers
• Search by title, author, genre, or topic

🎧 AUDIOBOOKS & TEXT-TO-SPEECH
• Professional audiobooks with speed control (0.5x–3x)
• Sleep timer with fade-out
• Offline listening
• Text-to-speech for any book

📝 SMART SUMMARIES
• Key insights in 15 minutes or less
• Text, PDF, and audio formats
• Key takeaways and chapter breakdowns
• Premium: unlimited summaries

📱 OFFLINE FIRST
• Download books for offline reading
• Background downloads with resume
• Smart storage management
• Cross-device sync

📊 READING ANALYTICS
• Books finished, hours listened, pages turned
• Reading streaks and goals
• Genre exploration tracking
• Achievements and milestones

✨ PERSONALIZED EXPERIENCE
• Custom fonts, themes, and layouts
• Reading goals and reminders
• AI-powered recommendations
• Cross-device progress sync

💎 PREMIUM FEATURES
• Unlimited summaries & audio summaries
• Offline downloads
• Ad-free experience
• Advanced statistics
• All themes & fonts
• 5-device sync

SUBSCRIPTION OPTIONS:
• Monthly: $9.99/month
• Annual: $79.99/year (33% off)
• 7-day free trial
• Cancel anytime

PRIVACY & SECURITY:
• Your data is encrypted and never sold
• GDPR & CCPA compliant
• Offline-first architecture
• Local-first storage

SUPPORTED PLATFORMS:
• iOS 15+
• Android 8+
• Web (PWA)

CONTACT:
• support@bookwise.app
• @BookWiseApp on Twitter
• bookwise.app

BookWise — Read More, Learn Faster, Grow Daily
  `.trim(),

  keywords: [
    'books', 'reading', 'audiobooks', 'summaries', 'ebooks',
    'literature', 'education', 'learning', 'productivity',
    'self-improvement', 'book tracker', 'reading tracker',
    'goodreads alternative', 'kindle alternative',
  ],

  categories: {
    primary: 'Books',
    secondary: 'Education',
  },

  ageRating: '4+',

  supportedDevices: [
    'iPhone',
    'iPad',
    'iPod touch',
    'Android phones',
    'Android tablets',
  ],

  languages: [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
    'Korean',
    'Chinese (Simplified)',
    'Chinese (Traditional)',
  ],

  screenshots: {
    iPhone: [
      'screenshots/iphone/home.png',
      'screenshots/iphone/library.png',
      'screenshots/iphone/reader.png',
      'screenshots/iphone/audio.png',
      'screenshots/iphone/summary.png',
      'screenshots/iphone/stats.png',
      'screenshots/iphone/settings.png',
      'screenshots/iphone/search.png',
      'screenshots/iphone/onboarding.png',
      'screenshots/iphone/subscription.png',
    ],
    iPad: [
      'screenshots/ipad/home.png',
      'screenshots/ipad/library.png',
      'screenshots/ipad/reader.png',
      'screenshots/ipad/split-view.png',
    ],
    appleWatch: [
      'screenshots/watch/reading-progress.png',
      'screenshots/watch/audio-controls.png',
    ],
  },

  appPreviewVideos: {
    iPhone: 'previews/iphone-demo.mp4',
    iPad: 'previews/ipad-demo.mp4',
  },

  privacyPolicyUrl: 'https://bookwise.app/privacy',
  termsOfServiceUrl: 'https://bookwise.app/terms',
  supportUrl: 'https://bookwise.app/support',
  marketingUrl: 'https://bookwise.app',

  inAppPurchases: [
    {
      productId: 'premium_monthly',
      name: 'Premium Monthly',
      description: 'Unlimited summaries, offline access, audio summaries, no ads',
      price: 9.99,
      priceLocale: '$9.99',
      subscriptionPeriod: 'monthly',
      freeTrialPeriod: '7 days',
    },
    {
      productId: 'premium_annual',
      name: 'Premium Annual',
      description: 'Unlimited summaries, offline access, audio summaries, no ads (33% off)',
      price: 79.99,
      priceLocale: '$79.99',
      subscriptionPeriod: 'yearly',
      freeTrialPeriod: '7 days',
    },
    {
      productId: 'lifetime_access',
      name: 'Lifetime Access',
      description: 'One-time purchase for lifetime premium access',
      price: 199.99,
      priceLocale: '$199.99',
      subscriptionPeriod: 'lifetime',
    },
  ],

  appStoreReviewGuidelines: {
    // Ensure compliance with Apple's guidelines
    noHiddenFeatures: true,
    noPrivateAPIs: true,
    properSubscriptionHandling: true,
    properRestorePurchases: true,
    clearPrivacyPolicy: true,
    properAgeRating: true,
    noMisleadingContent: true,
    functionalLinks: true,
    properErrorHandling: true,
    accessibilitySupport: true,
  },

  googlePlayConfig: {
    shortDescription: 'Read more, learn faster. Millions of books, audiobooks & summaries.',
    fullDescription: APP_STORE_CONFIG.description,
    promotionalText: 'Your personal micro-reading companion. Read more, learn faster, grow daily.',
    category: 'BOOKS_AND_REFERENCE',
    tags: ['books', 'reading', 'audiobooks', 'summaries', 'education', 'learning'],
    targetAudience: 'Everyone',
    contentRating: 'Everyone',
    permissions: [
      'INTERNET',
      'WAKE_LOCK',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'POST_NOTIFICATIONS',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
    targetSdkVersion: 34,
    minSdkVersion: 26,
    versionCode: 1,
    versionName: '1.0.0',
  },

  releaseNotes: {
    '1.0.0': `
• Initial release of BookWise
• Millions of books, audiobooks & summaries
• Offline reading & listening
• Reading stats & achievements
• Personalized recommendations
• Cross-device sync
• 7-day free trial
    `.trim(),
  },
};

export const PLAY_STORE_CONFIG = APP_STORE_CONFIG.googlePlayConfig;
export const APP_STORE_METADATA = {
  name: APP_STORE_CONFIG.name,
  subtitle: APP_STORE_CONFIG.subtitle,
  description: APP_STORE_CONFIG.description,
  keywords: APP_STORE_CONFIG.keywords.join(','),
  primaryCategory: APP_STORE_CONFIG.categories.primary,
  secondaryCategory: APP_STORE_CONFIG.categories.secondary,
  ageRating: APP_STORE_CONFIG.ageRating,
  languages: APP_STORE_CONFIG.languages.join(','),
  supportUrl: APP_STORE_CONFIG.supportUrl,
  marketingUrl: APP_STORE_CONFIG.marketingUrl,
  privacyPolicyUrl: APP_STORE_CONFIG.privacyPolicyUrl,
  termsOfServiceUrl: APP_STORE_CONFIG.termsOfServiceUrl,
};