import * as FileSystem from 'expo-file-system';
import { STORAGE_PATHS } from '@/utils/storage';

interface CachedImage {
  uri: string;
  localPath: string;
  width?: number;
  height?: number;
  timestamp: number;
  size: number;
}

interface CacheOptions {
  maxSize?: number;
  maxAge?: number;
  quality?: number;
}

class ImageCacheService {
  private static instance: ImageCacheService;
  private cache: Map<string, CachedImage> = new Map();
  private maxSize = 100 * 1024 * 1024;
  private maxAge = 30 * 24 * 60 * 60 * 1000;
  private initialized = false;

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  async initialize(options: CacheOptions = {}) {
    if (this.initialized) return;
    
    this.maxSize = options.maxSize || this.maxSize;
    this.maxAge = options.maxAge || this.maxAge;
    
    await this.ensureCacheDirectory();
    await this.loadCacheIndex();
    this.initialized = true;
  }

  private async ensureCacheDirectory() {
    await FileSystem.makeDirectoryAsync(STORAGE_PATHS.covers, { intermediates: true });
  }

  private async loadCacheIndex() {
    try {
      const indexPath = `${STORAGE_PATHS.covers}index.json`;
      const info = await FileSystem.getInfoAsync(indexPath);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(indexPath);
        const data = JSON.parse(content);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading cache index:', error);
    }
  }

  private async saveCacheIndex() {
    try {
      const indexPath = `${STORAGE_PATHS.covers}index.json`;
      const data = Object.fromEntries(this.cache);
      await FileSystem.writeAsStringAsync(indexPath, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cache index:', error);
    }
  }

  async get(uri: string): Promise<string | null> {
    const cached = this.cache.get(uri);
    if (!cached) return null;

    const fileInfo = await FileSystem.getInfoAsync(cached.localPath);
    if (!fileInfo.exists) {
      this.cache.delete(uri);
      await this.saveCacheIndex();
      return null;
    }

    if (Date.now() - cached.timestamp > this.maxAge) {
      await this.remove(uri);
      return null;
    }

    return cached.localPath;
  }

  async set(uri: string, localPath: string, metadata?: { width?: number; height?: number }): Promise<void> {
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (!fileInfo.exists) return;

    const cached: CachedImage = {
      uri,
      localPath,
      width: metadata?.width,
      height: metadata?.height,
      timestamp: Date.now(),
      size: fileInfo.size || 0,
    };

    this.cache.set(uri, cached);
    await this.saveCacheIndex();
    await this.enforceSizeLimit();
  }

  async downloadAndCache(uri: string, options?: { headers?: Record<string, string> }): Promise<string | null> {
    const cached = await this.get(uri);
    if (cached) return cached;

    try {
      const fileName = this.getFileNameFromUri(uri);
      const localPath = `${STORAGE_PATHS.covers}${fileName}`;
      
      const result = await FileSystem.downloadAsync(uri, localPath, {
        headers: options?.headers,
        md5: false,
        cache: false,
      });

      if (result.status === 200) {
        await this.set(uri, result.uri);
        return result.uri;
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }

    return null;
  }

  async preload(uris: string[]): Promise<void> {
    await Promise.all(uris.map(uri => this.downloadAndCache(uri)));
  }

  async remove(uri: string): Promise<void> {
    const cached = this.cache.get(uri);
    if (cached) {
      try {
        await FileSystem.deleteAsync(cached.localPath, { idempotent: true });
      } catch (error) {
        console.error('Error deleting cached file:', error);
      }
      this.cache.delete(uri);
      await this.saveCacheIndex();
    }
  }

  async clear(): Promise<void> {
    for (const [, cached] of this.cache) {
      try {
        await FileSystem.deleteAsync(cached.localPath, { idempotent: true });
      } catch (error) {
        console.error('Error deleting cached file:', error);
      }
    }
    this.cache.clear();
    await this.saveCacheIndex();
  }

  async getCacheSize(): Promise<number> {
    let totalSize = 0;
    for (const [, cached] of this.cache) {
      totalSize += cached.size;
    }
    return totalSize;
  }

  async getCacheInfo(): Promise<{ count: number; size: number; maxSize: number }> {
    const size = await this.getCacheSize();
    return {
      count: this.cache.size,
      size,
      maxSize: this.maxSize,
    };
  }

  private async enforceSizeLimit(): Promise<void> {
    const currentSize = await this.getCacheSize();
    if (currentSize <= this.maxSize) return;

    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    let removedSize = 0;
    for (const [uri, cached] of entries) {
      if (currentSize - removedSize <= this.maxSize * 0.8) break;
      
      try {
        await FileSystem.deleteAsync(cached.localPath, { idempotent: true });
        this.cache.delete(uri);
        removedSize += cached.size;
      } catch (error) {
        console.error('Error removing cached file:', error);
      }
    }

    await this.saveCacheIndex();
  }

  private getFileNameFromUri(uri: string): string {
    const hash = this.hashString(uri);
    const extension = this.getExtension(uri);
    return `${hash}.${extension}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private getExtension(uri: string): string {
    const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1] : 'jpg';
  }

  async cleanupOldEntries(maxAge?: number): Promise<number> {
    const ageLimit = maxAge || this.maxAge;
    let removedCount = 0;
    const now = Date.now();

    for (const [uri, cached] of this.cache.entries()) {
      if (now - cached.timestamp > ageLimit) {
        await this.remove(uri);
        removedCount++;
      }
    }

    return removedCount;
  }
}

export const imageCacheService = ImageCacheService.getInstance();
export default imageCacheService;