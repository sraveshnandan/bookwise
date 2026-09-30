import { apiClient } from './books';
import { UserLibraryItem, ReadingPosition, Highlight, Bookmark, ReadingGoal, ApiResponse, PaginatedResponse, DownloadedFormat } from '@/types';

export interface LibraryFilters {
  format?: 'book' | 'audiobook' | 'summary' | 'all';
  status?: 'reading' | 'finished' | 'want_to_read' | 'all';
  sortBy?: 'recent' | 'title' | 'author' | 'progress' | 'added';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const libraryApi = {
  async getLibrary(filters: LibraryFilters = {}): Promise<PaginatedResponse<UserLibraryItem>> {
    const params = new URLSearchParams();
    if (filters.format) params.append('format', filters.format);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<UserLibraryItem>>>(`/library?${params}`);
    return response.data.data;
  },

  async getLibraryItem(bookId: string): Promise<UserLibraryItem | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserLibraryItem>>(`/library/${bookId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.statusCode === 404) return null;
      throw error;
    }
  },

  async addToLibrary(bookId: string, format: 'book' | 'audiobook' | 'summary' = 'book'): Promise<UserLibraryItem> {
    const response = await apiClient.post<ApiResponse<UserLibraryItem>>('/library', { bookId, format });
    return response.data.data;
  },

  async removeFromLibrary(bookId: string): Promise<void> {
    await apiClient.delete(`/library/${bookId}`);
  },

  async updateProgress(bookId: string, position: ReadingPosition): Promise<UserLibraryItem> {
    const response = await apiClient.patch<ApiResponse<UserLibraryItem>>(`/library/${bookId}/progress`, position);
    return response.data.data;
  },

  async updateReadingPosition(bookId: string, position: ReadingPosition): Promise<void> {
    await apiClient.patch(`/library/${bookId}/position`, position);
  },

  async toggleFavorite(bookId: string): Promise<UserLibraryItem> {
    const response = await apiClient.post<ApiResponse<UserLibraryItem>>(`/library/${bookId}/favorite`);
    return response.data.data;
  },

  async rateBook(bookId: string, rating: number, review?: string): Promise<UserLibraryItem> {
    const response = await apiClient.post<ApiResponse<UserLibraryItem>>(`/library/${bookId}/rating`, { rating, review });
    return response.data.data;
  },

  async addTag(bookId: string, tag: string): Promise<UserLibraryItem> {
    const response = await apiClient.post<ApiResponse<UserLibraryItem>>(`/library/${bookId}/tags`, { tag });
    return response.data.data;
  },

  async removeTag(bookId: string, tag: string): Promise<UserLibraryItem> {
    const response = await apiClient.delete<ApiResponse<UserLibraryItem>>(`/library/${bookId}/tags/${tag}`);
    return response.data.data;
  },

  async setReadingGoal(bookId: string, goal: ReadingGoal): Promise<UserLibraryItem> {
    const response = await apiClient.post<ApiResponse<UserLibraryItem>>(`/library/${bookId}/goal`, goal);
    return response.data.data;
  },

  async getContinueReading(): Promise<UserLibraryItem[]> {
    const response = await apiClient.get<ApiResponse<UserLibraryItem[]>>('/library/continue-reading');
    return response.data.data;
  },

  async getDownloadedBooks(): Promise<UserLibraryItem[]> {
    const response = await apiClient.get<ApiResponse<UserLibraryItem[]>>('/library/downloaded');
    return response.data.data;
  },

  async getWishlist(): Promise<UserLibraryItem[]> {
    const response = await apiClient.get<ApiResponse<UserLibraryItem[]>>('/library/wishlist');
    return response.data.data;
  },

  async getHistory(): Promise<UserLibraryItem[]> {
    const response = await apiClient.get<ApiResponse<UserLibraryItem[]>>('/library/history');
    return response.data.data;
  },

  async syncProgress(items: Array<{ bookId: string; position: ReadingPosition }>): Promise<void> {
    await apiClient.post('/library/sync', { items });
  },
};

export const highlightsApi = {
  async getHighlights(bookId?: string): Promise<Highlight[]> {
    const params = bookId ? `?bookId=${bookId}` : '';
    const response = await apiClient.get<ApiResponse<Highlight[]>>(`/highlights${params}`);
    return response.data.data;
  },

  async createHighlight(data: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>): Promise<Highlight> {
    const response = await apiClient.post<ApiResponse<Highlight>>('/highlights', data);
    return response.data.data;
  },

  async updateHighlight(id: string, data: Partial<Highlight>): Promise<Highlight> {
    const response = await apiClient.patch<ApiResponse<Highlight>>(`/highlights/${id}`, data);
    return response.data.data;
  },

  async deleteHighlight(id: string): Promise<void> {
    await apiClient.delete(`/highlights/${id}`);
  },

  async exportHighlights(bookId?: string, format: 'json' | 'csv' | 'markdown' = 'json'): Promise<string> {
    const params = new URLSearchParams();
    if (bookId) params.append('bookId', bookId);
    params.append('format', format);
    const response = await apiClient.get<ApiResponse<{ content: string }>>(`/highlights/export?${params}`);
    return response.data.data.content;
  },
};

export const bookmarksApi = {
  async getBookmarks(bookId?: string): Promise<Bookmark[]> {
    const params = bookId ? `?bookId=${bookId}` : '';
    const response = await apiClient.get<ApiResponse<Bookmark[]>>(`/bookmarks${params}`);
    return response.data.data;
  },

  async createBookmark(data: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    const response = await apiClient.post<ApiResponse<Bookmark>>('/bookmarks', data);
    return response.data.data;
  },

  async updateBookmark(id: string, data: Partial<Bookmark>): Promise<Bookmark> {
    const response = await apiClient.patch<ApiResponse<Bookmark>>(`/bookmarks/${id}`, data);
    return response.data.data;
  },

  async deleteBookmark(id: string): Promise<void> {
    await apiClient.delete(`/bookmarks/${id}`);
  },
};

export const downloadsApi = {
  async getDownloadQueue(): Promise<DownloadedFormat[]> {
    const response = await apiClient.get<ApiResponse<DownloadedFormat[]>>('/downloads/queue');
    return response.data.data;
  },

  async startDownload(bookId: string, format: DownloadedFormat['format']): Promise<DownloadedFormat> {
    const response = await apiClient.post<ApiResponse<DownloadedFormat>>('/downloads', { bookId, format });
    return response.data.data;
  },

  async pauseDownload(downloadId: string): Promise<void> {
    await apiClient.post(`/downloads/${downloadId}/pause`);
  },

  async resumeDownload(downloadId: string): Promise<void> {
    await apiClient.post(`/downloads/${downloadId}/resume`);
  },

  async cancelDownload(downloadId: string): Promise<void> {
    await apiClient.delete(`/downloads/${downloadId}`);
  },

  async retryDownload(downloadId: string): Promise<void> {
    await apiClient.post(`/downloads/${downloadId}/retry`);
  },

  async clearCompleted(): Promise<void> {
    await apiClient.delete('/downloads/completed');
  },

  async getStorageInfo(): Promise<{ used: number; available: number; total: number }> {
    const response = await apiClient.get<ApiResponse<{ used: number; available: number; total: number }>>('/downloads/storage');
    return response.data.data;
  },
};