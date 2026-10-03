import { useState, useCallback, useEffect } from 'react';
import { Book, Summary } from '@/types';
import { searchAllSources, SearchFilters } from '@/api';
import { useLibraryStore } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';

export interface Recommendation {
  book: Book;
  score: number;
  reason: string;
  type: 'similar' | 'genre' | 'author' | 'trending' | 'personalized' | 'because-you-read';
}

export interface RecommendationFilters {
  excludeRead?: boolean;
  excludeWishlist?: boolean;
  genres?: string[];
  formats?: ('book' | 'audiobook' | 'summary')[];
  minRating?: number;
  maxResults?: number;
}

export interface RecommendationEngine {
  getRecommendations: (filters?: RecommendationFilters) => Promise<Recommendation[]>;
  getSimilarBooks: (bookId: string, limit?: number) => Promise<Recommendation[]>;
  getTrendingBooks: (genre?: string, limit?: number) => Promise<Recommendation[]>;
  getPersonalizedRecommendations: (userId: string, limit?: number) => Promise<Recommendation[]>;
  getBecauseYouRead: (bookId: string, limit?: number) => Promise<Recommendation[]>;
  getByGenre: (genre: string, limit?: number) => Promise<Recommendation[]>;
  getByAuthor: (author: string, limit?: number) => Promise<Recommendation[]>;
}

class RecommendationsManager {
  private static instance: RecommendationsManager;
  private cache: Map<string, { data: Recommendation[]; timestamp: number }> = new Map();
  private cacheTTL = 10 * 60 * 1000; // 10 minutes

  static getInstance(): RecommendationsManager {
    if (!RecommendationsManager.instance) {
      RecommendationsManager.instance = new RecommendationsManager();
    }
    return RecommendationsManager.instance;
  }

  async initialize(): Promise<void> {}

  private getCacheKey(method: string, params: any): string {
    return `${method}:${JSON.stringify(params)}`;
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getRecommendations(filters: RecommendationFilters = {}): Promise<Recommendation[]> {
    const cacheKey = this.getCacheKey('recommendations', filters);
    const cached = this.getCached<Recommendation[]>(cacheKey);
    if (cached) return cached;

    const results = await this.generateRecommendations(filters);
    this.setCache(cacheKey, results);
    return results;
  }

  private async generateRecommendations(filters: RecommendationFilters): Promise<Recommendation[]> {
    const allResults: Recommendation[] = [];

    const searchFilters: SearchFilters = {
      limit: filters.maxResults || 20,
      sortBy: 'rating',
      sortOrder: 'desc',
      rating: filters.minRating,
      genres: filters.genres,
      formats: filters.formats,
    };

    try {
      const { books } = await searchAllSources(searchFilters);
      
      for (const book of books) {
        if (filters.excludeRead || filters.excludeWishlist) {
          // Would check against user library here
        }

        allResults.push({
          book,
          score: this.calculateBookScore(book),
          reason: this.generateReason(book),
          type: 'trending',
        });
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    }

    return allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, filters.maxResults || 20);
  }

  private calculateBookScore(book: Book): number {
    let score = 0;
    
    if (book.averageRating) {
      score += book.averageRating * 20;
    }
    
    if (book.ratingsCount) {
      score += Math.min(Math.log10(book.ratingsCount) * 10, 50);
    }
    
    if (book.isFree) {
      score += 15;
    }
    
    if (book.hasAudiobook) {
      score += 10;
    }
    
    if (book.hasSummary) {
      score += 10;
    }
    
    return Math.round(score);
  }

  private generateReason(book: Book): string {
    const reasons = [];
    
    if (book.averageRating && book.averageRating >= 4.5) {
      reasons.push('Highly rated');
    }
    
    if (book.isFree) {
      reasons.push('Free to read');
    }
    
    if (book.hasAudiobook) {
      reasons.push('Available as audiobook');
    }
    
    if (book.hasSummary) {
      reasons.push('Summary available');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Popular choice';
  }

  async getSimilarBooks(bookId: string, limit = 10): Promise<Recommendation[]> {
    const cacheKey = this.getCacheKey('similar', { bookId, limit });
    const cached = this.getCached<Recommendation[]>(cacheKey);
    if (cached) return cached;

    // In a real implementation, this would use a similarity algorithm
    // For now, search by genres of the book
    try {
      // Would fetch the book first to get its genres
      const searchFilters: SearchFilters = {
        genres: ['Fiction'], // Placeholder
        limit: limit * 2,
        sortBy: 'rating',
      };

      const { books } = await searchAllSources(searchFilters);
      
      const results: Recommendation[] = books
        .filter(b => b.id !== bookId)
        .slice(0, limit)
        .map(book => ({
          book,
          score: this.calculateBookScore(book),
          reason: `Similar to books you've enjoyed`,
          type: 'similar',
        }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Failed to get similar books:', error);
      return [];
    }
  }

  async getTrendingBooks(genre?: string, limit = 10): Promise<Recommendation[]> {
    const cacheKey = this.getCacheKey('trending', { genre, limit });
    const cached = this.getCached<Recommendation[]>(cacheKey);
    if (cached) return cached;

    try {
      const searchFilters: SearchFilters = {
        genres: genre ? [genre] : undefined,
        limit: limit * 2,
        sortBy: 'popular',
        sortOrder: 'desc',
      };

      const { books } = await searchAllSources(searchFilters);
      
      const results: Recommendation[] = books
        .slice(0, limit)
        .map(book => ({
          book,
          score: this.calculateBookScore(book) + 20,
          reason: genre ? `Trending in ${genre}` : 'Trending now',
          type: 'trending',
        }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Failed to get trending books:', error);
      return [];
    }
  }

  async getPersonalizedRecommendations(userId: string, limit = 20): Promise<Recommendation[]> {
    const cacheKey = this.getCacheKey('personalized', { userId, limit });
    const cached = this.getCached<Recommendation[]>(cacheKey);
    if (cached) return cached;

    // In a real implementation, this would use collaborative filtering
    // based on user's reading history, ratings, and preferences
    try {
      const { user } = useAuthStore.getState();
      if (!user) return [];

      const searchFilters: SearchFilters = {
        genres: user.preferences?.genres,
        limit: limit * 2,
        sortBy: 'rating',
      };

      const { books } = await searchAllSources(searchFilters);
      
      const libraryItems = useLibraryStore.getState().items;
      const readBookIds = new Set(libraryItems.map(item => item.bookId));
      
      const results: Recommendation[] = books
        .filter(book => !readBookIds.has(book.id))
        .slice(0, limit)
        .map(book => ({
          book,
          score: this.calculateBookScore(book) + 30,
          reason: 'Recommended for you',
          type: 'personalized',
        }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return [];
    }
  }

  async getBecauseYouRead(bookId: string, limit = 5): Promise<Recommendation[]> {
    // Get books by the same author or similar genre
    return this.getSimilarBooks(bookId, limit);
  }

  async getByGenre(genre: string, limit = 20): Promise<Recommendation[]> {
    return this.getRecommendations({ genres: [genre], maxResults: limit });
  }

  async getByAuthor(author: string, limit = 10): Promise<Recommendation[]> {
    const cacheKey = this.getCacheKey('author', { author, limit });
    const cached = this.getCached<Recommendation[]>(cacheKey);
    if (cached) return cached;

    try {
      const searchFilters: SearchFilters = {
        query: author,
        limit: limit * 2,
        sortBy: 'rating',
      };

      const { books } = await searchAllSources(searchFilters);
      
      const results: Recommendation[] = books
        .filter(b => b.author.toLowerCase().includes(author.toLowerCase()))
        .slice(0, limit)
        .map(book => ({
          book,
          score: this.calculateBookScore(book) + 15,
          reason: `More by ${author}`,
          type: 'author',
        }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Failed to get books by author:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const recommendationsManager = RecommendationsManager.getInstance();

export function useRecommendations(filters: RecommendationFilters = {}): {
  recommendations: Recommendation[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getSimilar: (bookId: string, limit?: number) => Promise<Recommendation[]>;
  getTrending: (genre?: string, limit?: number) => Promise<Recommendation[]>;
  getPersonalized: (userId: string, limit?: number) => Promise<Recommendation[]>;
  getByGenre: (genre: string, limit?: number) => Promise<Recommendation[]>;
  getByAuthor: (author: string, limit?: number) => Promise<Recommendation[]>;
} {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const manager = RecommendationsManager.getInstance();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await manager.getRecommendations(filters);
      setRecommendations(results);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refresh = useCallback(async () => {
    manager.invalidateCache('recommendations');
    await fetch();
  }, [fetch]);

  const getSimilar = useCallback(async (bookId: string, limit = 10) => {
    return manager.getSimilarBooks(bookId, limit);
  }, []);

  const getTrending = useCallback(async (genre?: string, limit = 10) => {
    return manager.getTrendingBooks(genre, limit);
  }, []);

  const getPersonalized = useCallback(async (userId: string, limit = 20) => {
    return manager.getPersonalizedRecommendations(userId, limit);
  }, []);

  const getByGenre = useCallback(async (genre: string, limit = 20) => {
    return manager.getByGenre(genre, limit);
  }, []);

  const getByAuthor = useCallback(async (author: string, limit = 10) => {
    return manager.getByAuthor(author, limit);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    recommendations,
    loading,
    error,
    refresh,
    getSimilar,
    getTrending,
    getPersonalized,
    getByGenre,
    getByAuthor,
  };
}

export function useSimilarBooks(bookId: string, limit = 5): {
  books: Recommendation[];
  loading: boolean;
} {
  const [books, setBooks] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const manager = RecommendationsManager.getInstance();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await manager.getSimilarBooks(bookId, limit);
        setBooks(results);
      } catch (error) {
        console.error('Failed to load similar books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) load();
  }, [bookId, limit]);

  return { books, loading };
}

export function useTrendingBooks(genre?: string, limit = 10): {
  books: Recommendation[];
  loading: boolean;
} {
  const [books, setBooks] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const manager = RecommendationsManager.getInstance();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await manager.getTrendingBooks(genre, limit);
        setBooks(results);
      } catch (error) {
        console.error('Failed to load trending books:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [genre, limit]);

  return { books, loading };
}

export function usePersonalizedRecommendations(userId: string, limit = 20): {
  books: Recommendation[];
  loading: boolean;
} {
  const [books, setBooks] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const manager = RecommendationsManager.getInstance();

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setBooks([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const results = await manager.getPersonalizedRecommendations(userId, limit);
        setBooks(results);
      } catch (error) {
        console.error('Failed to load personalized recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, limit]);

  return { books, loading };
}

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';