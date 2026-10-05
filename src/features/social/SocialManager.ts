import { useState, useCallback } from 'react';
import { Platform, Share, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImageManipulator from 'expo-image-manipulator';
import { Book, Highlight, Summary } from '@/types';

export interface ShareContent {
  type: 'book' | 'highlight' | 'summary' | 'achievement' | 'progress' | 'quote';
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
  data?: any;
}

export interface ShareOptions {
  subject?: string;
  url?: string;
  image?: string;
}

export class SocialManager {
  private static instance: SocialManager;

  static getInstance(): SocialManager {
    if (!SocialManager.instance) {
      SocialManager.instance = new SocialManager();
    }
    return SocialManager.instance;
  }

  async initialize(): Promise<void> {}

  async shareBook(book: Book, options: ShareOptions = {}): Promise<boolean> {
    const content: ShareContent = {
      type: 'book',
      title: book.title,
      message: `Check out "${book.title}" by ${book.author}`,
      url: options.url || book.infoLink,
      imageUrl: options.image || book.coverUrl,
    };

    return this.shareContent(content, options);
  }

  async shareHighlight(highlight: Highlight, options: ShareOptions = {}): Promise<boolean> {
    const content: ShareContent = {
      type: 'highlight',
      title: `"${highlight.content.substring(0, 50)}..."`,
      message: `${highlight.content}\n\n— ${highlight.bookTitle} by ${highlight.bookAuthor}`,
      url: options.url,
      imageUrl: options.image,
      data: { highlightId: highlight.id, bookId: highlight.bookId },
    };

    return this.shareContent(content, options);
  }

  async shareSummary(summary: Summary, options: ShareOptions = {}): Promise<boolean> {
    const content: ShareContent = {
      type: 'summary',
      title: summary.title,
      message: summary.keyTakeaways.slice(0, 3).join('\n\n'),
      url: options.url,
      imageUrl: options.image,
    };

    return this.shareContent(content, options);
  }

  async shareAchievement(
    achievementName: string,
    description: string,
    options: ShareOptions = {}
  ): Promise<boolean> {
    const content: ShareContent = {
      type: 'achievement',
      title: `🏆 Achievement Unlocked: ${achievementName}`,
      message: `${description}\n\nEarned on BookWise`,
      url: options.url,
    };

    return this.shareContent(content, options);
  }

  async shareProgress(
    bookTitle: string,
    author: string,
    progress: number,
    options: ShareOptions = {}
  ): Promise<boolean> {
    const content: ShareContent = {
      type: 'progress',
      title: `Reading Progress: ${Math.round(progress * 100)}%`,
      message: `I'm ${Math.round(progress * 100)}% through "${bookTitle}" by ${author} on BookWise!`,
      url: options.url,
    };

    return this.shareContent(content, options);
  }

  async shareQuote(
    quote: string,
    author: string,
    bookTitle?: string,
    options: ShareOptions = {}
  ): Promise<boolean> {
    const content: ShareContent = {
      type: 'quote',
      title: `"${quote.substring(0, 50)}..."`,
      message: `"${quote}"\n\n— ${author}${bookTitle ? ` (${bookTitle})` : ''}\n\nShared from BookWise`,
      url: options.url,
    };

    return this.shareContent(content, options);
  }

  private async shareContent(content: ShareContent, options: ShareOptions = {}): Promise<boolean> {
    try {
      const shareOptions: Share.SharedContent = {
        title: content.title,
        message: content.message,
        url: content.url,
      };

      if (content.imageUrl) {
        if (Platform.OS === 'ios') {
          shareOptions.url = content.imageUrl;
        } else {
          // Android can share images directly
        }
      }

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Share failed:', error);
      
      if (error instanceof Error && error.message.includes('cancelled')) {
        return false;
      }
      
      await this.fallbackShare(content);
      return false;
    }
  }

  private async fallbackShare(content: ShareContent): Promise<void> {
    const text = `${content.title}\n\n${content.message}${content.url ? `\n\n${content.url}` : ''}`;
    
    try {
      await Clipboard.setStringAsync(text);
      console.log('Copied to clipboard as fallback');
    } catch (error) {
      console.error('Clipboard fallback failed:', error);
    }
  }

  async shareToSpecificApp(
    content: ShareContent,
    packageName: string
  ): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const intent = `intent://send?text=${encodeURIComponent(content.message)}#Intent;package=${packageName};scheme=share;end`;
      await Linking.openURL(intent);
      return true;
    } catch (error) {
      console.error('Direct share failed:', error);
      return false;
    }
  }

  async generateShareImage(
    type: 'quote' | 'progress' | 'achievement',
    data: { text: string; author?: string; bookTitle?: string; progress?: number; color?: string }
  ): Promise<string | null> {
    try {
      // This would generate a shareable image using expo-image-manipulator
      // For now, return null and let the caller handle it
      return null;
    } catch (error) {
      console.error('Failed to generate share image:', error);
      return null;
    }
  }

  async openAppStore(): Promise<void> {
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/bookwise/id123456789'
      : 'https://play.google.com/store/apps/details?id=com.anonymous.bookwise';
    
    await Linking.openURL(url);
  }

  async sendFeedback(email: string, message: string): Promise<boolean> {
    const url = `mailto:support@bookwise.app?subject=Feedback&body=${encodeURIComponent(
      `Email: ${email}\n\n${message}`
    )}`;
    
    try {
      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.error('Feedback failed:', error);
      return false;
    }
  }

  async openInBrowser(url: string): Promise<void> {
    await Linking.openURL(url);
  }

  async openInApp(url: string, fallbackUrl?: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
    } catch (error) {
      console.warn('Cannot open in app:', error);
    }
    
    if (fallbackUrl) {
      await Linking.openURL(fallbackUrl);
    }
    
    return false;
  }
}

export const socialManager = SocialManager.getInstance();

export function useSocial(): {
  shareBook: (book: Book, options?: ShareOptions) => Promise<boolean>;
  shareHighlight: (highlight: Highlight, options?: ShareOptions) => Promise<boolean>;
  shareSummary: (summary: Summary, options?: ShareOptions) => Promise<boolean>;
  shareAchievement: (name: string, description: string, options?: ShareOptions) => Promise<boolean>;
  shareProgress: (bookTitle: string, author: string, progress: number, options?: ShareOptions) => Promise<boolean>;
  shareQuote: (quote: string, author: string, bookTitle?: string, options?: ShareOptions) => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<void>;
  openAppStore: () => Promise<void>;
  sendFeedback: (email: string, message: string) => Promise<boolean>;
} {
  const manager = SocialManager.getInstance();

  const shareBook = useCallback(async (book: Book, options?: ShareOptions) => {
    return manager.shareBook(book, options);
  }, []);

  const shareHighlight = useCallback(async (highlight: Highlight, options?: ShareOptions) => {
    return manager.shareHighlight(highlight, options);
  }, []);

  const shareSummary = useCallback(async (summary: Summary, options?: ShareOptions) => {
    return manager.shareSummary(summary, options);
  }, []);

  const shareAchievement = useCallback(async (name: string, description: string, options?: ShareOptions) => {
    return manager.shareAchievement(name, description, options);
  }, []);

  const shareProgress = useCallback(async (bookTitle: string, author: string, progress: number, options?: ShareOptions) => {
    return manager.shareProgress(bookTitle, author, progress, options);
  }, []);

  const shareQuote = useCallback(async (quote: string, author: string, bookTitle?: string, options?: ShareOptions) => {
    return manager.shareQuote(quote, author, bookTitle, options);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
  }, []);

  const openAppStore = useCallback(async () => {
    await manager.openAppStore();
  }, []);

  const sendFeedback = useCallback(async (email: string, message: string) => {
    return manager.sendFeedback(email, message);
  }, []);

  return {
    shareBook,
    shareHighlight,
    shareSummary,
    shareAchievement,
    shareProgress,
    shareQuote,
    copyToClipboard,
    openAppStore,
    sendFeedback,
  };
}

export function useShareableContent(): {
  generateBookShareText: (book: Book) => string;
  generateHighlightShareText: (highlight: Highlight) => string;
  generateSummaryShareText: (summary: Summary) => string;
  generateProgressShareText: (bookTitle: string, author: string, progress: number) => string;
} {
  const generateBookShareText = useCallback((book: Book) => {
    return `"${book.title}" by ${book.author}\n\n${book.description?.substring(0, 200) || 'No description available.'}\n\nRead it on BookWise: ${book.infoLink || book.previewUrl || 'bookwise://book/' + book.id}`;
  }, []);

  const generateHighlightShareText = useCallback((highlight: Highlight) => {
    return `"${highlight.content}"\n\n— ${highlight.bookTitle} by ${highlight.bookAuthor}\n\nHighlighted on BookWise`;
  }, []);

  const generateSummaryShareText = useCallback((summary: Summary) => {
    const takeaways = summary.keyTakeaways.slice(0, 3).map(t => `• ${t}`).join('\n');
    return `${summary.title}\n\nKey Takeaways:\n${takeaways}\n\nRead the full summary on BookWise`;
  }, []);

  const generateProgressShareText = useCallback((bookTitle: string, author: string, progress: number) => {
    return `I'm ${Math.round(progress * 100)}% through "${bookTitle}" by ${author} on BookWise! 📚`;
  }, []);

  return {
    generateBookShareText,
    generateHighlightShareText,
    generateSummaryShareText,
    generateProgressShareText,
  };
}

export function useDeepLinking(): {
  openBook: (bookId: string) => Promise<void>;
  openReader: (bookId: string, format?: 'epub' | 'pdf') => Promise<void>;
  openAudioPlayer: (bookId: string) => Promise<void>;
  openSummary: (bookId: string) => Promise<void>;
  openSearch: (query?: string) => Promise<void>;
  openLibrary: () => Promise<void>;
  openSettings: () => Promise<void>;
  openProfile: () => Promise<void>;
} {
  const openBook = useCallback(async (bookId: string) => {
    await Linking.openURL(`bookwise://book/${bookId}`);
  }, []);

  const openReader = useCallback(async (bookId: string, format: 'epub' | 'pdf' = 'epub') => {
    await Linking.openURL(`bookwise://reader/${bookId}?format=${format}`);
  }, []);

  const openAudioPlayer = useCallback(async (bookId: string) => {
    await Linking.openURL(`bookwise://audioPlayer/${bookId}`);
  }, []);

  const openSummary = useCallback(async (bookId: string) => {
    await Linking.openURL(`bookwise://summary/${bookId}`);
  }, []);

  const openSearch = useCallback(async (query?: string) => {
    const url = query ? `bookwise://search?q=${encodeURIComponent(query)}` : 'bookwise://search';
    await Linking.openURL(url);
  }, []);

  const openLibrary = useCallback(async () => {
    await Linking.openURL('bookwise://library');
  }, []);

  const openSettings = useCallback(async () => {
    await Linking.openURL('bookwise://settings');
  }, []);

  const openProfile = useCallback(async () => {
    await Linking.openURL('bookwise://profile');
  }, []);

  return {
    openBook,
    openReader,
    openAudioPlayer,
    openSummary,
    openSearch,
    openLibrary,
    openSettings,
    openProfile,
  };
}