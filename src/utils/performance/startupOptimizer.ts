import { AppRegistry } from 'react-native';
import { measureAsync, measureSync, PerformanceMonitor } from './bundleAnalyzer';

export interface StartupMetrics {
  totalTime: number;
  phases: StartupPhase[];
  ttfb: number;
  fcp: number;
  tti: number;
}

export interface StartupPhase {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  dependencies: string[];
}

export class StartupOptimizer {
  private static phases: StartupPhase[] = [];
  private static phaseStartTimes = new Map<string, number>();
  private static completedPhases = new Set<string>();
  private static phaseDependencies = new Map<string, string[]>();
  private static isInitialized = false;

  static initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    this.markPhase('app-start');
    this.registerCorePhases();
  }

  private static registerCorePhases(): void {
    this.phaseDependencies.set('splash-screen', []);
    this.phaseDependencies.set('native-modules', ['splash-screen']);
    this.phaseDependencies.set('javascript-bundle', ['native-modules']);
    this.phaseDependencies.set('react-init', ['javascript-bundle']);
    this.phaseDependencies.set('navigation-setup', ['react-init']);
    this.phaseDependencies.set('providers', ['navigation-setup']);
    this.phaseDependencies.set('auth-check', ['providers']);
    this.phaseDependencies.set('data-hydration', ['auth-check']);
    this.phaseDependencies.set('first-render', ['data-hydration']);
    this.phaseDependencies.set('interactive', ['first-render']);
  }

  static markPhase(name: string): void {
    const startTime = performance.now();
    this.phaseStartTimes.set(name, startTime);
    
    if (typeof performance.mark === 'function') {
      performance.mark(`${name}-start`);
    }
  }

  static completePhase(name: string, dependencies: string[] = []): void {
    const startTime = this.phaseStartTimes.get(name);
    if (!startTime) return;

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.phases.push({
      name,
      startTime,
      endTime,
      duration,
      dependencies,
    });

    this.completedPhases.add(name);
    this.phaseDependencies.set(name, dependencies);

    if (typeof performance.mark === 'function') {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
      } catch {}
    }

    PerformanceMonitor.mark(`${name}-start`);
    PerformanceMonitor.measure(name, `${name}-start`);
  }

  static async runPhase<T>(
    name: string,
    fn: () => Promise<any>,
    dependencies: string[] = []
  ): Promise<any> {
    await this.waitForDependencies(dependencies);
    
    this.markPhase(name);
    try {
      const result = await fn();
      this.completePhase(name, dependencies);
      return result;
    } catch (error) {
      this.completePhase(name, dependencies);
      throw error;
    }
  }

  private static async waitForDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      while (!this.completedPhases.has(dep)) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  static getMetrics(): StartupMetrics {
    const totalTime = this.phases.reduce((sum, p) => sum + p.duration, 0);
    
    const firstRender = this.phases.find(p => p.name === 'first-render');
    const interactive = this.phases.find(p => p.name === 'interactive');
    const firstPaint = this.phases.find(p => p.name === 'splash-screen');

    return {
      totalTime,
      phases: this.phases,
      ttfb: 0,
      fcp: firstPaint ? firstPaint.endTime - firstPaint.startTime : 0,
      tti: interactive ? interactive.endTime - interactive.startTime : 0,
    };
  }

  static getCriticalPath(): StartupPhase[] {
    return this.phases
      .filter(p => p.dependencies.length > 0)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  }

  static generateReport(): string {
    const metrics = this.getMetrics();
    const lines = [
      '# Startup Performance Report',
      '',
      `Total Startup Time: ${metrics.totalTime.toFixed(2)}ms`,
      `Time to First Contentful Paint (FCP): ${metrics.fcp.toFixed(2)}ms`,
      `Time to Interactive (TTI): ${metrics.tti.toFixed(2)}ms`,
      '',
      '## Phase Breakdown',
      '',
    ];

    for (const phase of this.phases) {
      const percentage = ((phase.duration / metrics.totalTime) * 100).toFixed(1);
      const deps = phase.dependencies.length > 0 ? ` (depends on: ${phase.dependencies.join(', ')})` : '';
      lines.push(`- **${phase.name}**: ${phase.duration.toFixed(2)}ms (${percentage}%)${deps}`);
    }

    lines.push('', '## Critical Path (Longest Phases)', '');
    for (const phase of this.getCriticalPath()) {
      lines.push(`- **${phase.name}**: ${phase.duration.toFixed(2)}ms`);
    }

    return lines.join('\n');
  }

  static reset(): void {
    this.phases = [];
    this.phaseStartTimes.clear();
    this.completedPhases.clear();
    this.isInitialized = false;
  }
}

export class DeferredInitializer {
  private static tasks: Array<{
    name: string;
    fn: () => Promise<void>;
    priority: 'high' | 'normal' | 'low';
    condition?: () => boolean;
  }> = [];

  static register(
    name: string,
    fn: () => Promise<void>,
    priority: 'high' | 'normal' | 'low' = 'normal',
    condition?: () => boolean
  ): void {
    this.tasks.push({ name, fn, priority, condition });
  }

  static async runAll(): Promise<void> {
    const sorted = [...this.tasks].sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (const task of sorted) {
      if (task.condition && !task.condition()) continue;
      
      const startTime = performance.now();
      try {
        await task.fn();
        console.log(`[DeferredInitializer] ${task.name} completed in ${(performance.now() - startTime).toFixed(2)}ms`);
      } catch (error) {
        console.error(`[DeferredInitializer] ${task.name} failed:`, error);
      }
    }
  }

  static clear(): void {
    this.tasks = [];
  }
}

export const useDeferredEffect = (
  effect: () => Promise<(() => void) | void>,
  deps: React.DependencyList
): void => {
  React.useEffect(() => {
    let cancelled = false;
    
    const runEffect = async () => {
      if (cancelled) return;
      const cleanup = await effect();
      if (!cancelled && cleanup) {
        return cleanup;
      }
    };

    runEffect();

    return () => {
      cancelled = true;
    };
  }, deps);
}

export const lazyRequire = <T,>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<React.ComponentType<any>> => {
  return React.lazy(importFn);
}

export const preloadComponent = <T,>(
  importFn: () => Promise<{ default: T }>
): Promise<void> => {
  return importFn().then(() => {});
};

export const useIdleCallback = (
  callback: () => void,
  options: { timeout?: number } = {}
): void => {
  React.useEffect(() => {
    let idleCallbackId: number;
    
    const runCallback = (deadline: IdleDeadline) => {
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        callback();
      } else {
        idleCallbackId = requestIdleCallback(runCallback, options);
      }
    };

    idleCallbackId = requestIdleCallback(runCallback, options);
    
    return () => cancelIdleCallback(idleCallbackId);
  }, [callback]);
};

export const requestIdleCallback = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    } as IdleDeadline);
  }, 1);
};

export const cancelIdleCallback = (id: number): void => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

export const usePerformanceMark = (name: string): void => {
  React.useEffect(() => {
    PerformanceMonitor.mark(`${name}-mount`);
    
    return () => {
      PerformanceMonitor.measure(`${name}-lifecycle`, `${name}-mount`);
    };
  }, [name]);
};

export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<P> => {
  const WithTracking: React.FC<P> = (props) => {
    usePerformanceMark(componentName);
    
    return <WrappedComponent {...props} />;
  };
  
  WithTracking.displayName = `withPerformanceTracking(${componentName})`;
  return WithTracking;
};

import React, { useEffect } from 'react';