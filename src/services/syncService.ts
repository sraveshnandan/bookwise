import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { NetworkService } from './networkService';
import { DownloadTask } from '@/types';
import { STORAGE_KEYS } from '@/constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DownloadService } from './downloadService';

interface SyncOperation {
  id: string;
  type: 'reading_progress' | 'highlight' | 'bookmark' | 'library' | 'stats' | 'download';
  payload: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
}

interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  resolvedData?: any;
}

class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  private networkListener: any = null;
  private backgroundSyncInterval: any = null;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30000;
  private readonly QUEUE_STORAGE_KEY = 'sync_queue';

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async initialize() {
    await this.loadQueue();
    this.setupNetworkListener();
    this.startBackgroundSync();
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(this.QUEUE_STORAGE_KEY);
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  private setupNetworkListener() {
    this.networkListener = NetworkService.addListener((isOnline) => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }

  private startBackgroundSync() {
    this.backgroundSyncInterval = setInterval(() => {
      if (NetworkService.isOnline()) {
        this.processQueue();
      }
    }, this.SYNC_INTERVAL);
  }

  stopBackgroundSync() {
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
      this.backgroundSyncInterval = null;
    }
  }

  async addToQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries' | 'status'>) {
    const newOperation: SyncOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    this.syncQueue.push(newOperation);
    await this.saveQueue();
    
    if (NetworkService.isOnline()) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isSyncing || !NetworkService.isOnline()) return;
    
    const pendingOperations = this.syncQueue.filter(op => op.status === 'pending' || op.status === 'failed');
    if (pendingOperations.length === 0) return;

    this.isSyncing = true;

    for (const operation of pendingOperations) {
      if (!NetworkService.isOnline()) break;
      
      operation.status = 'syncing';
      await this.saveQueue();

      try {
        await this.executeOperation(operation);
        operation.status = 'completed';
        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
      } catch (error: any) {
        operation.retries++;
        operation.error = error.message;
        
        if (operation.retries >= this.MAX_RETRIES) {
          operation.status = 'failed';
        } else {
          operation.status = 'pending';
        }
      }
      
      await this.saveQueue();
    }

    this.isSyncing = false;
  }

  private async executeOperation(operation: SyncOperation) {
    switch (operation.type) {
      case 'reading_progress':
        await this.syncReadingProgress(operation.payload);
        break;
      case 'highlight':
        await this.syncHighlight(operation.payload);
        break;
      case 'bookmark':
        await this.syncBookmark(operation.payload);
        break;
      case 'library':
        await this.syncLibraryItem(operation.payload);
        break;
      case 'stats':
        await this.syncStats(operation.payload);
        break;
      case 'download':
        await this.syncDownload(operation.payload);
        break;
      default:
        throw new Error(`Unknown sync operation type: ${operation.type}`);
    }
  }

  private async syncReadingProgress(data: any) {
    const { error } = await supabase
      .from('reading_progress')
      .upsert({
        user_id: data.userId,
        book_id: data.bookId,
        chapter_index: data.chapterIndex,
        chapter_progress: data.chapterProgress,
        page_number: data.pageNumber,
        audio_position: data.audioPosition,
        cfi: data.cfi,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,book_id',
      });
    
    if (error) throw error;
  }

  private async syncHighlight(data: any) {
    const { error } = await supabase
      .from('highlights')
      .upsert({
        user_id: data.userId,
        book_id: data.bookId,
        book_title: data.bookTitle,
        book_author: data.bookAuthor,
        content: data.content,
        note: data.note,
        color: data.color,
        position: data.position,
        created_at: data.createdAt,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });
    
    if (error) throw error;
  }

  private async syncBookmark(data: any) {
    const { error } = await supabase
      .from('bookmarks')
      .upsert({
        user_id: data.userId,
        book_id: data.bookId,
        position: data.position,
        title: data.title,
        note: data.note,
        created_at: data.createdAt,
      }, {
        onConflict: 'id',
      });
    
    if (error) throw error;
  }

  private async syncLibraryItem(data: any) {
    const { error } = await supabase
      .from('user_library')
      .upsert({
        user_id: data.userId,
        book_id: data.bookId,
        progress: data.progress,
        current_position: data.currentPosition,
        last_read_at: data.lastReadAt,
        downloaded_formats: data.downloadedFormats,
        is_purchased: data.isPurchased,
        is_favorite: data.isFavorite,
        rating: data.rating,
        review: data.review,
        tags: data.tags,
        reading_goal: data.readingGoal,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,book_id',
      });
    
    if (error) throw error;
  }

  private async syncStats(data: any) {
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: data.userId,
        books_read: data.booksRead,
        hours_listened: data.hoursListened,
        pages_turned: data.pagesTurned,
        current_streak: data.currentStreak,
        longest_streak: data.longestStreak,
        total_reading_time: data.totalReadingTime,
        genres_explored: data.genresExplored,
        authors_read: data.authorsRead,
        last_read_date: data.lastReadDate,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    
    if (error) throw error;
  }

  private async syncDownload(data: any) {
    const { error } = await supabase
      .from('downloads')
      .upsert({
        user_id: data.userId,
        book_id: data.bookId,
        format: data.format,
        url: data.url,
        local_path: data.localPath,
        progress: data.progress,
        status: data.status,
        file_size: data.fileSize,
        downloaded_bytes: data.downloadedBytes,
        resume_data: data.resumeData,
        error: data.error,
        priority: data.priority,
        created_at: data.createdAt,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });
    
    if (error) throw error;
  }

  async resolveConflict(operationId: string, resolution: ConflictResolution) {
    const operation = this.syncQueue.find(op => op.id === operationId);
    if (!operation) return;

    if (resolution.strategy === 'server_wins') {
      operation.status = 'completed';
      this.syncQueue = this.syncQueue.filter(op => op.id !== operationId);
    } else if (resolution.strategy === 'client_wins') {
      await this.executeOperation(operation);
      operation.status = 'completed';
      this.syncQueue = this.syncQueue.filter(op => op.id !== operationId);
    } else if (resolution.strategy === 'merge' && resolution.resolvedData) {
      operation.payload = { ...operation.payload, ...resolution.resolvedData };
      await this.executeOperation(operation);
      operation.status = 'completed';
      this.syncQueue = this.syncQueue.filter(op => op.id !== operationId);
    }

    await this.saveQueue();
  }

  getQueue() {
    return [...this.syncQueue];
  }

  getPendingCount() {
    return this.syncQueue.filter(op => op.status === 'pending' || op.status === 'syncing').length;
  }

  getFailedCount() {
    return this.syncQueue.filter(op => op.status === 'failed').length;
  }

  async retryFailed() {
    this.syncQueue = this.syncQueue.map(op => 
      op.status === 'failed' ? { ...op, status: 'pending', retries: 0, error: undefined } : op
    );
    await this.saveQueue();
    this.processQueue();
  }

  async clearCompleted() {
    this.syncQueue = this.syncQueue.filter(op => op.status !== 'completed');
    await this.saveQueue();
  }

  async clearAll() {
    this.syncQueue = [];
    await this.saveQueue();
  }

  destroy() {
    this.stopBackgroundSync();
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}

export const syncService = SyncService.getInstance();
export default syncService;