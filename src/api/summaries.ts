import { apiClient } from './books';
import { Summary, ApiResponse, PaginatedResponse } from '@/types';

export interface SummaryFilters {
  bookId?: string;
  type?: 'text' | 'pdf' | 'audio';
  isPremium?: boolean;
  page?: number;
  limit?: number;
}

export const summaryApi = {
  async getSummary(summaryId: string): Promise<Summary> {
    const response = await apiClient.get<ApiResponse<Summary>>(`/summaries/${summaryId}`);
    return response.data.data;
  },

  async getSummaryByBookId(bookId: string): Promise<Summary | null> {
    try {
      const response = await apiClient.get<ApiResponse<Summary>>(`/summaries/book/${bookId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.statusCode === 404) return null;
      throw error;
    }
  },

  async getSummaries(filters: SummaryFilters = {}): Promise<PaginatedResponse<Summary>> {
    const params = new URLSearchParams();
    if (filters.bookId) params.append('bookId', filters.bookId);
    if (filters.type) params.append('type', filters.type);
    if (filters.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Summary>>>(`/summaries?${params}`);
    return response.data.data;
  },

  async getRecommendedSummaries(limit = 10): Promise<Summary[]> {
    const response = await apiClient.get<ApiResponse<Summary[]>>('/summaries/recommended', {
      params: { limit },
    });
    return response.data.data;
  },

  async getPopularSummaries(limit = 10): Promise<Summary[]> {
    const response = await apiClient.get<ApiResponse<Summary[]>>('/summaries/popular', {
      params: { limit },
    });
    return response.data.data;
  },

  async getNewSummaries(limit = 10): Promise<Summary[]> {
    const response = await apiClient.get<ApiResponse<Summary[]>>('/summaries/new', {
      params: { limit },
    });
    return response.data.data;
  },

  async getSummaryAudioUrl(summaryId: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(`/summaries/${summaryId}/audio-url`);
    return response.data.data.url;
  },

  async getSummaryPdfUrl(summaryId: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(`/summaries/${summaryId}/pdf-url`);
    return response.data.data.url;
  },

  async markSummaryAsRead(summaryId: string, progress: number): Promise<void> {
    await apiClient.post(`/summaries/${summaryId}/progress`, { progress });
  },

  async getSummaryProgress(summaryId: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ progress: number }>>(`/summaries/${summaryId}/progress`);
    return response.data.data.progress;
  },
};

export const keyTakeawaysApi = {
  async getKeyTakeaways(summaryId: string): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(`/summaries/${summaryId}/takeaways`);
    return response.data.data;
  },

  async saveKeyTakeaway(summaryId: string, takeaway: string): Promise<void> {
    await apiClient.post(`/summaries/${summaryId}/takeaways`, { takeaway });
  },

  async deleteKeyTakeaway(summaryId: string, takeawayId: string): Promise<void> {
    await apiClient.delete(`/summaries/${summaryId}/takeaways/${takeawayId}`);
  },
};