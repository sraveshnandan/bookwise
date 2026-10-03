import * as FileSystem from 'expo-file-system';
import { DownloadTask } from '@/types';
import { STORAGE_PATHS, getBookPath, getAudiobookPath, getSummaryPath, ensureDirectories } from '@/utils/storage';
import { DOWNLOAD_CONFIG } from '@/constants/app';

class DownloadService {
  private static instance: DownloadService;
  private activeDownloads: Map<string, FileSystem.DownloadResumable> = new Map();
  private progressCallbacks: Map<string, (progress: number, totalBytes: number, downloadedBytes: number) => void> = new Map();

  static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  async initialize() {
    await ensureDirectories();
  }

  async startDownload(
    task: DownloadTask,
    onProgress?: (progress: number, totalBytes: number, downloadedBytes: number) => void
  ): Promise<string> {
    if (this.activeDownloads.has(task.id)) {
      throw new Error('Download already in progress');
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      task.url,
      task.localPath,
      {
        headers: {
          'User-Agent': 'BookWise/1.0',
        },
        md5: false,
        cache: false,
      },
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesExpectedToWrite > 0
          ? downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
          : 0;
        const callback = this.progressCallbacks.get(task.id);
        if (callback) {
          callback(progress, downloadProgress.totalBytesExpectedToWrite, downloadProgress.totalBytesWritten);
        }
        if (onProgress) {
          onProgress(progress, downloadProgress.totalBytesExpectedToWrite, downloadProgress.totalBytesWritten);
        }
      }
    );

    this.activeDownloads.set(task.id, downloadResumable);
    
    try {
      const result = await downloadResumable.downloadAsync();
      this.activeDownloads.delete(task.id);
      this.progressCallbacks.delete(task.id);
      
      if (result) {
        return result.uri;
      }
      throw new Error('Download failed - no result');
    } catch (error) {
      this.activeDownloads.delete(task.id);
      this.progressCallbacks.delete(task.id);
      throw error;
    }
  }

  pauseDownload(taskId: string): void {
    const download = this.activeDownloads.get(taskId);
    if (download) {
      download.pauseAsync();
    }
  }

  async resumeDownload(taskId: string): Promise<string | null> {
    const download = this.activeDownloads.get(taskId);
    if (!download) return null;

    try {
      const result = await download.downloadAsync();
      this.activeDownloads.delete(taskId);
      this.progressCallbacks.delete(taskId);
      return result?.uri || null;
    } catch (error) {
      this.activeDownloads.delete(taskId);
      this.progressCallbacks.delete(taskId);
      throw error;
    }
  }

  cancelDownload(taskId: string): void {
    const download = this.activeDownloads.get(taskId);
    if (download) {
      // Note: expo-file-system doesn't have a cancel method for DownloadResumable
      // We just remove it from tracking
      this.activeDownloads.delete(taskId);
      this.progressCallbacks.delete(taskId);
    }
  }

  getResumeData(taskId: string): string | null {
    const download = this.activeDownloads.get(taskId);
    // Note: expo-file-system DownloadResumable doesn't expose resumeData directly
    return null;
  }

  setProgressCallback(taskId: string, callback: (progress: number, totalBytes: number, downloadedBytes: number) => void) {
    this.progressCallbacks.set(taskId, callback);
  }

  removeProgressCallback(taskId: string) {
    this.progressCallbacks.delete(taskId);
  }

  isDownloading(taskId: string): boolean {
    return this.activeDownloads.has(taskId);
  }

  async deleteFile(localPath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(localPath, { idempotent: true });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async fileExists(localPath: string): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(localPath);
    return info.exists ?? false;
  }

  async getFileSize(localPath: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(localPath);
    return info.size ?? 0;
  }

  getStoragePaths() {
    return STORAGE_PATHS;
  }

  getBookPath(bookId: string, format: 'epub' | 'pdf'): string {
    return getBookPath(bookId, format);
  }

  getAudiobookPath(bookId: string): string {
    return getAudiobookPath(bookId);
  }

  getSummaryPath(bookId: string, format: 'text' | 'pdf' | 'audio'): string {
    return getSummaryPath(bookId, format);
  }

  async ensureAudiobookDirectory(bookId: string): Promise<string> {
    const dir = getAudiobookPath(bookId);
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    return dir;
  }

  async getStorageUsage(): Promise<{ used: number; available: number; total: number }> {
    try {
      const available = await FileSystem.getFreeDiskStorageAsync();
      const total = 1024 * 1024 * 1024; // 1GB estimate
      const used = total - available;
      return { used, available, total };
    } catch {
      return { used: 0, available: 0, total: 0 };
    }
  }
}

export const downloadService = DownloadService.getInstance();
export default downloadService;