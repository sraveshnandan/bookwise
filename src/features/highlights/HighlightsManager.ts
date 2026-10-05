import { useState, useCallback, useEffect } from 'react';
import { Highlight, ReadingPosition } from '@/types';
import { useLibraryStore } from '@/store/libraryStore';
import { SyncService } from '@/services/syncService';

export interface HighlightColor {
  id: string;
  name: string;
  hex: string;
  bgHex: string;
}

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  { id: 'yellow', name: 'Yellow', hex: '#fef08a', bgHex: '#fef9c3' },
  { id: 'green', name: 'Green', hex: '#86efac', bgHex: '#dcfce7' },
  { id: 'blue', name: 'Blue', hex: '#93c5fd', bgHex: '#dbeafe' },
  { id: 'pink', name: 'Pink', hex: '#fbcfe8', bgHex: '#fce7f3' },
  { id: 'purple', name: 'Purple', hex: '#ddd6fe', bgHex: '#ede9fe' },
  { id: 'orange', name: 'Orange', hex: '#fdba74', bgHex: '#ffedd5' },
  { id: 'red', name: 'Red', hex: '#fca5a5', bgHex: '#fee2e2' },
  { id: 'gray', name: 'Gray', hex: '#d1d5db', bgHex: '#f3f4f6' },
];

export class HighlightsManager {
  private static instance: HighlightsManager;
  private highlights: Map<string, Highlight[]> = new Map();
  private maxHighlightsPerBook = 1000;

  static getInstance(): HighlightsManager {
    if (!HighlightsManager.instance) {
      HighlightsManager.instance = new HighlightsManager();
    }
    return HighlightsManager.instance;
  }

  async initialize(userId: string): Promise<void> {
    const { data } = await SyncService.getHighlights(userId);
    if (data) {
      this.highlights.clear();
      for (const highlight of data) {
        const bookHighlights = this.highlights.get(highlight.bookId) || [];
        bookHighlights.push(highlight);
        this.highlights.set(highlight.bookId, bookHighlights);
      }
    }
  }

  async createHighlight(
    userId: string,
    bookId: string,
    bookTitle: string,
    bookAuthor: string,
    content: string,
    position: ReadingPosition,
    color: HighlightColor['id'] = 'yellow',
    note?: string
  ): Promise<Highlight> {
    const highlight: Highlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      bookId,
      bookTitle,
      bookAuthor,
      content,
      note,
      color,
      position,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveHighlight(highlight);
    return highlight;
  }

  private async saveHighlight(highlight: Highlight): Promise<void> {
    const bookHighlights = this.highlights.get(highlight.bookId) || [];
    
    if (bookHighlights.length >= this.maxHighlightsPerBook) {
      bookHighlights.shift();
    }
    
    bookHighlights.push(highlight);
    this.highlights.set(highlight.bookId, bookHighlights);
    
    await SyncService.addToQueue({
      type: 'highlight',
      payload: highlight,
    });
  }

  async updateHighlight(highlightId: string, updates: Partial<Highlight>): Promise<Highlight | null> {
    for (const [bookId, highlights] of this.highlights) {
      const index = highlights.findIndex(h => h.id === highlightId);
      if (index !== -1) {
        const updated = { ...highlights[index], ...updates, updatedAt: new Date().toISOString() };
        highlights[index] = updated;
        
        await SyncService.addToQueue({
          type: 'highlight',
          payload: { ...updates, id: highlightId },
        });
        
        return updated;
      }
    }
    return null;
  }

  async deleteHighlight(highlightId: string): Promise<boolean> {
    for (const [bookId, highlights] of this.highlights) {
      const index = highlights.findIndex(h => h.id === highlightId);
      if (index !== -1) {
        highlights.splice(index, 1);
        
        await SyncService.addToQueue({
          type: 'highlight',
          payload: { id: highlightId, _deleted: true },
        });
        
        return true;
      }
    }
    return false;
  }

  getHighlightsForBook(bookId: string): Highlight[] {
    return this.highlights.get(bookId) || [];
  }

  getAllHighlights(): Highlight[] {
    const all: Highlight[] = [];
    for (const highlights of this.highlights.values()) {
      all.push(...highlights);
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getHighlightsByColor(bookId: string, color: HighlightColor['id']): Highlight[] {
    return (this.highlights.get(bookId) || []).filter(h => h.color === color);
  }

  searchHighlights(query: string, bookId?: string): Highlight[] {
    const highlights = bookId ? this.getHighlightsForBook(bookId) : this.getAllHighlights();
    const lowerQuery = query.toLowerCase();
    
    return highlights.filter(h => 
      h.content.toLowerCase().includes(lowerQuery) ||
      (h.note && h.note.toLowerCase().includes(lowerQuery))
    );
  }

  exportHighlights(bookId?: string, format: 'json' | 'markdown' | 'csv' = 'markdown'): string {
    const highlights = bookId ? this.getHighlightsForBook(bookId) : this.getAllHighlights();
    
    switch (format) {
      case 'json':
        return JSON.stringify(highlights, null, 2);
      
      case 'csv': {
        const headers = ['Book', 'Author', 'Content', 'Note', 'Color', 'Chapter', 'Progress', 'Date'];
        const rows = highlights.map(h => [
          h.bookTitle,
          h.bookAuthor,
          `"${h.content.replace(/"/g, '""')}"`,
          `"${(h.note || '').replace(/"/g, '""')}"`,
          h.color,
          h.position.chapterIndex.toString(),
          `${(h.position.chapterProgress * 100).toFixed(1)}%`,
          new Date(h.createdAt).toLocaleDateString(),
        ].join(','));
        return [headers.join(','), ...rows].join('\n');
      }
      
      case 'markdown':
      default: {
        const grouped = new Map<string, Highlight[]>();
        for (const h of highlights) {
          const key = `${h.bookTitle} by ${h.bookAuthor}`;
          const arr = grouped.get(key) || [];
          arr.push(h);
          grouped.set(key, arr);
        }
        
        let md = '# Highlights & Notes\n\n';
        for (const [book, hs] of grouped) {
          md += `## ${book}\n\n`;
          for (const h of hs) {
            md += `> ${h.content}\n\n`;
            if (h.note) {
              md += `**Note:** ${h.note}\n\n`;
            }
            md += `*Color: ${h.color} | Chapter ${h.position.chapterIndex + 1} | ${(h.position.chapterProgress * 100).toFixed(1)}% | ${new Date(h.createdAt).toLocaleDateString()}*\n\n`;
            md += '---\n\n';
          }
        }
        return md;
      }
    }
  }

  getHighlightStats(bookId?: string): {
    total: number;
    byColor: Record<string, number>;
    withNotes: number;
    totalCharacters: number;
  } {
    const highlights = bookId ? this.getHighlightsForBook(bookId) : this.getAllHighlights();
    
    const byColor: Record<string, number> = {};
    let withNotes = 0;
    let totalCharacters = 0;
    
    for (const h of highlights) {
      byColor[h.color] = (byColor[h.color] || 0) + 1;
      if (h.note) withNotes++;
      totalCharacters += h.content.length;
    }
    
    return {
      total: highlights.length,
      byColor,
      withNotes,
      totalCharacters,
    };
  }
}

export const highlightsManager = HighlightsManager.getInstance();

export function useHighlights(bookId?: string): {
  highlights: Highlight[];
  loading: boolean;
  createHighlight: (data: Omit<Highlight, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Highlight>;
  updateHighlight: (id: string, updates: Partial<Highlight>) => Promise<Highlight | null>;
  deleteHighlight: (id: string) => Promise<boolean>;
  getColor: (id: string) => HighlightColor;
} {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const manager = HighlightsManager.getInstance();

  useEffect(() => {
    if (bookId) {
      setHighlights(manager.getHighlightsForBook(bookId));
      setLoading(false);
    } else {
      setHighlights(manager.getAllHighlights());
      setLoading(false);
    }
  }, [bookId]);

  const createHighlight = useCallback(async (data: Omit<Highlight, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const highlight = await manager.createHighlight(
      'current-user',
      data.bookId,
      data.bookTitle,
      data.bookAuthor,
      data.content,
      data.position,
      data.color,
      data.note
    );
    setHighlights(prev => [highlight, ...prev]);
    return highlight;
  }, []);

  const updateHighlight = useCallback(async (id: string, updates: Partial<Highlight>) => {
    const updated = await manager.updateHighlight(id, updates);
    if (updated) {
      setHighlights(prev => prev.map(h => h.id === id ? updated : h));
    }
    return updated;
  }, []);

  const deleteHighlight = useCallback(async (id: string) => {
    const success = await manager.deleteHighlight(id);
    if (success) {
      setHighlights(prev => prev.filter(h => h.id !== id));
    }
    return success;
  }, []);

  const getColor = useCallback((colorId: string) => {
    return HIGHLIGHT_COLORS.find(c => c.id === colorId) || HIGHLIGHT_COLORS[0];
  }, []);

  return { highlights, loading, createHighlight, updateHighlight, deleteHighlight, getColor };
}

import { useState } from 'react';