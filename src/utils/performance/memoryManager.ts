import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface MemoryInfo {
  used: number;
  total: number;
  available: number;
  percentage: number;
  isLow: boolean;
}

export interface CacheConfig {
  maxSize: number;
  maxAge: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

export class MemoryManager {
  private static instance: MemoryManager;
  private memoryWarnings: number = 0;
  private lastCheck: number = 0;
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((info: MemoryInfo) => void)[] = [];
  private lowMemoryThreshold = 0.85;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      this.setupWebMemoryMonitoring();
    } else {
      this.setupNativeMemoryMonitoring();
    }
  }

  private setupWebMemoryMonitoring(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      this.checkInterval = setInterval(() => {
        this.checkMemory();
      }, 30000);
    }
  }

  private setupNativeMemoryMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.checkMemory();
    }, 30000);
  }

  async checkMemory(): Promise<MemoryInfo> {
    const info = await this.getMemoryInfo();
    this.lastCheck = Date.now();

    if (info.isLow) {
      this.memoryWarnings++;
      this.notifyListeners(info);
      this.handleLowMemory();
    }

    return info;
  }

  private async getMemoryInfo(): Promise<MemoryInfo> {
    if (Platform.OS === 'web') {
      return this.getWebMemoryInfo();
    }
    return this.getNativeMemoryInfo();
  }

  private getWebMemoryInfo(): MemoryInfo {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const mem = (performance as any).memory;
      const used = mem.usedJSHeapSize;
      const total = mem.totalJSHeapSize;
      const limit = mem.jsHeapSizeLimit;
      const percentage = used / limit;

      return {
        used,
        total: limit,
        available: limit - used,
        percentage,
        isLow: percentage > this.lowMemoryThreshold,
      };
    }

    return {
      used: 0,
      total: 0,
      available: 0,
      percentage: 0,
      isLow: false,
    };
  }

  private async getNativeMemoryInfo(): Promise<MemoryInfo> {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const totalSpace = 1024 * 1024 * 1024; // Estimate 1GB
      const used = totalSpace - freeSpace;
      const percentage = used / totalSpace;

      return {
        used,
        total: totalSpace,
        available: freeSpace,
        percentage,
        isLow: percentage > this.lowMemoryThreshold,
      };
    } catch {
      return {
        used: 0,
        total: 0,
        available: 0,
        percentage: 0,
        isLow: false,
      };
    }
  }

  private handleLowMemory(): void {
    console.warn(`[MemoryManager] Low memory detected (warning #${this.memoryWarnings})`);
    
    if (this.memoryWarnings > 3) {
      this.performAggressiveCleanup();
    }
  }

  private async performAggressiveCleanup(): Promise<void> {
    console.log('[MemoryManager] Performing aggressive cleanup...');
    
    if (typeof global.gc === 'function') {
      global.gc();
    }

    try {
      const cacheDir = `${FileSystem.cacheDirectory}`;
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      
      for (const file of files) {
        const filePath = `${cacheDir}${file}`;
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists && info.modificationTime && Date.now() - info.modificationTime * 1000 > 24 * 60 * 60 * 1000) {
          await FileSystem.deleteAsync(filePath, { idempotent: true });
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  addListener(listener: (info: MemoryInfo) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(info: MemoryInfo): void {
    this.listeners.forEach(listener => listener(info));
  }

  onLowMemory(callback: () => void): () => void {
    return this.addListener(info => {
      if (info.isLow) callback();
    });
  }

  getMemoryPressure(): 'normal' | 'moderate' | 'critical' {
    const info = this.getMemoryInfoSync();
    if (info.percentage > 0.95) return 'critical';
    if (info.percentage > 0.85) return 'moderate';
    return 'normal';
  }

  private getMemoryInfoSync(): MemoryInfo {
    return {
      used: 0,
      total: 0,
      available: 0,
      percentage: 0,
      isLow: false,
    };
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

export class LRUCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number; frequency: number }>();
  private maxSize: number;
  private maxAge: number;
  private evictionPolicy: 'lru' | 'lfu' | 'fifo';

  constructor(config: CacheConfig) {
    this.maxSize = config.maxSize;
    this.maxAge = config.maxAge;
    this.evictionPolicy = config.evictionPolicy;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    entry.timestamp = Date.now();
    entry.frequency++;
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      frequency: 1,
    });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  private evict(): void {
    let keyToEvict: any;

    switch (this.evictionPolicy) {
      case 'lru': {
        let oldest = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.timestamp < oldest) {
            oldest = entry.timestamp;
            keyToEvict = key;
          }
        }
        break;
      }
      case 'lfu': {
        let lowestFreq = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.frequency < lowestFreq) {
            lowestFreq = entry.frequency;
            keyToEvict = key;
          }
        }
        break;
      }
      case 'fifo': {
        keyToEvict = this.cache.keys().next().value;
        break;
      }
    }

    if (keyToEvict !== undefined) {
      this.cache.delete(keyToEvict);
    }
  }

  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  values(): V[] {
    return Array.from(this.cache.values()).map(e => e.value);
  }

  entries(): [K, V][] {
    return Array.from(this.cache.entries()).map(([k, v]) => [k, v.value]);
  }
}

export const memoryManager = MemoryManager.getInstance();

export const useMemoryPressure = (callback: (pressure: 'normal' | 'moderate' | 'critical') => void) => {
  React.useEffect(() => {
    const memoryManager = MemoryManager.getInstance();
    const cleanup = memoryManager.onLowMemory(() => {
      callback('critical');
    });
    
    const checkInterval = setInterval(() => {
      const pressure = MemoryManager.getInstance().getMemoryPressure();
      callback(pressure);
    }, 10000);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);
}

import React from 'react';