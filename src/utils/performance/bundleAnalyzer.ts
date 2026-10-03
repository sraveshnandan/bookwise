import { Platform } from 'react-native';

export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  largestChunks: ChunkInfo[];
  duplicateModules: DuplicateModule[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: ModuleInfo[];
}

export interface ModuleInfo {
  name: string;
  size: number;
  chunks: string[];
}

export interface DuplicateModule {
  name: string;
  chunks: string[];
  totalSize: number;
}

export const BundleAnalyzer = {
  async analyzeBundle(): Promise<BundleMetrics> {
    if (Platform.OS === 'web') {
      return this.analyzeWebBundle();
    }
    
    return {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      largestChunks: [],
      duplicateModules: [],
    };
  },

  async analyzeWebBundle(): Promise<BundleMetrics> {
    try {
      const response = await fetch('/bundle-stats.json');
      if (!response.ok) throw new Error('Bundle stats not found');
      
      const stats = await response.json();
      return this.processWebpackStats(stats);
    } catch {
      return {
        totalSize: 0,
        gzippedSize: 0,
        chunks: [],
        largestChunks: [],
        duplicateModules: [],
      };
    }
  },

  processWebpackStats(stats: any): BundleMetrics {
    const chunks: ChunkInfo[] = [];
    const moduleMap = new Map<string, ModuleInfo>();

    if (stats.chunks) {
      for (const chunk of stats.chunks) {
        const modules = chunk.modules?.map((m: any) => ({
          name: m.name,
          size: m.size,
          chunks: m.chunks || [],
        })) || [];

        chunks.push({
          name: chunk.names?.[0] || chunk.id,
          size: chunk.size || 0,
          gzippedSize: Math.round((chunk.size || 0) * 0.3),
          modules,
        });

        for (const module of modules) {
          const existing = moduleMap.get(module.name);
          if (existing) {
            existing.chunks.push(...module.chunks);
          } else {
            moduleMap.set(module.name, module);
          }
        }
      }
    }

    const duplicateModules: DuplicateModule[] = [];
    for (const [name, info] of moduleMap) {
      const uniqueChunks = [...new Set(info.chunks)];
      if (uniqueChunks.length > 1) {
        duplicateModules.push({
          name,
          chunks: uniqueChunks,
          totalSize: info.size * uniqueChunks.length,
        });
      }
    }

    const sortedChunks = [...chunks].sort((a, b) => b.size - a.size);
    
    return {
      totalSize: chunks.reduce((sum, c) => sum + c.size, 0),
      gzippedSize: chunks.reduce((sum, c) => sum + c.gzippedSize, 0),
      chunks,
      largestChunks: sortedChunks.slice(0, 10),
      duplicateModules: duplicateModules.sort((a, b) => b.totalSize - a.totalSize).slice(0, 20),
    };
  },

  generateReport(metrics: BundleMetrics): string {
    const lines = [
      '# Bundle Analysis Report',
      '',
      `Total Size: ${this.formatBytes(metrics.totalSize)}`,
      `Gzipped Size: ${this.formatBytes(metrics.gzippedSize)}`,
      `Compression Ratio: ${((1 - metrics.gzippedSize / metrics.totalSize) * 100).toFixed(1)}%`,
      '',
      '## Largest Chunks',
      '',
    ];

    for (const chunk of metrics.largestChunks) {
      lines.push(`- **${chunk.name}**: ${this.formatBytes(chunk.size)} (gzipped: ${this.formatBytes(chunk.gzippedSize)})`);
    }

    if (metrics.duplicateModules.length > 0) {
      lines.push('', '## Duplicate Modules', '');
      for (const dup of metrics.duplicateModules) {
        lines.push(`- **${dup.name}**: in ${dup.chunks.length} chunks (${dup.chunks.join(', ')}), total wasted: ${this.formatBytes(dup.totalSize)}`);
      }
    }

    return lines.join('\n');
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  getOptimizationSuggestions(metrics: BundleMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.totalSize > 2 * 1024 * 1024) {
      suggestions.push('Total bundle exceeds 2MB - consider code splitting');
    }

    const largeChunks = metrics.chunks.filter(c => c.size > 500 * 1024);
    if (largeChunks.length > 0) {
      suggestions.push(`Found ${largeChunks.length} chunks > 500KB - consider lazy loading`);
    }

    if (metrics.duplicateModules.length > 0) {
      suggestions.push(`Found ${metrics.duplicateModules.length} duplicate modules - check for multiple versions or common chunks`);
    }

    const reactNativeSize = metrics.chunks.find(c => c.name.includes('react-native'));
    if (reactNativeSize && reactNativeSize.size > 1024 * 1024) {
      suggestions.push('React Native bundle is large - consider Hermes bytecode optimization');
    }

    return suggestions;
  },
};

export const PerformanceMonitor = {
  marks: new Map<string, number>(),
  measures: new Map<string, number[]>(),

  mark(name: string): void {
    this.marks.set(name, performance.now());
    if (typeof performance.mark === 'function') {
      performance.mark(name);
    }
  },

  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    
    if (startTime === undefined) return 0;
    
    const duration = endTime - startTime;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);
    
    if (typeof performance.measure === 'function') {
      try {
        performance.measure(name, startMark, endMark);
      } catch {}
    }
    
    return duration;
  },

  getMeasure(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.measures.get(name);
    if (!values || values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  },

  getAllMeasures(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};
    for (const [name] of this.measures) {
      result[name] = this.getMeasure(name);
    }
    return result;
  },

  clear(): void {
    this.marks.clear();
    this.measures.clear();
    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  },

  report(): string {
    const measures = this.getAllMeasures();
    const lines = ['# Performance Report', ''];
    
    for (const [name, stats] of Object.entries(measures)) {
      if (stats) {
        lines.push(`## ${name}`);
        lines.push(`- Average: ${stats.avg.toFixed(2)}ms`);
        lines.push(`- Min: ${stats.min.toFixed(2)}ms`);
        lines.push(`- Max: ${stats.max.toFixed(2)}ms`);
        lines.push(`- Count: ${stats.count}`);
        lines.push('');
      }
    }
    
    return lines.join('\n');
  },
};

export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  PerformanceMonitor.mark(`${name}-start`);
  try {
    const result = await fn();
    PerformanceMonitor.measure(name, `${name}-start`);
    return result;
  } catch (error) {
    PerformanceMonitor.measure(name, `${name}-start`);
    throw error;
  }
};

export const measureSync = <T>(
  name: string,
  fn: () => T
): T => {
  PerformanceMonitor.mark(`${name}-start`);
  try {
    const result = fn();
    PerformanceMonitor.measure(name, `${name}-start`);
    return result;
  } catch (error) {
    PerformanceMonitor.measure(name, `${name}-start`);
    throw error;
  }
};