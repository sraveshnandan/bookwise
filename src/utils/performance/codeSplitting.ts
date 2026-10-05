import React, { lazy, Suspense, ComponentType, ReactNode, useState, useEffect } from 'react';
import { Box, SkeletonScreen } from '@/components';

export interface LazyLoadOptions {
  fallback?: ReactNode;
  preload?: boolean;
  retry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const {
    retry = true,
    retryDelay = 1000,
    maxRetries = 3,
  } = options;

  return lazy(async () => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries && retry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  });
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): {
  Component: React.LazyExoticComponent<T>;
  preload: () => Promise<void>;
} {
  let Component: React.LazyExoticComponent<T> | null = null;
  let preloadPromise: Promise<void> | null = null;

  const lazyComponent = lazyWithRetry(importFn, options);
  Component = lazyComponent;

  const preload = async () => {
    if (preloadPromise) return preloadPromise;
    
    preloadPromise = (async () => {
      try {
        await importFn();
      } catch (error) {
        console.warn('Preload failed:', error);
      }
    })();
    
    return preloadPromise;
  };

  return { Component: Component!, preload };
}

export interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  suspenseKey?: string;
}

export function LazyWrapper({ children, fallback, suspenseKey }: LazyWrapperProps) {
  return (
    <Suspense key={suspenseKey} fallback={fallback || <SkeletonScreen variant="home" />}>
      {children}
    </Suspense>
  );
}

export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): {
  Component: React.LazyExoticComponent<T> | null;
  loading: boolean;
  error: Error | null;
  preload: () => Promise<void>;
  retry: () => Promise<void>;
} {
  const [Component, setComponent] = useState<React.LazyExoticComponent<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    if (Component) return;
    setLoading(true);
    setError(null);
    
    try {
      const loaded = await importFn();
      const lazyComp = lazy(() => Promise.resolve(loaded));
      setComponent(lazyComp);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const preload = async () => {
    if (Component) return;
    try {
      await importFn();
    } catch (err) {
      console.warn('Preload failed:', err);
    }
  };

  const retry = async () => {
    setError(null);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { Component, loading, error, preload, retry };
}

export function createRouteComponents(): Record<string, React.LazyExoticComponent<any>> {
  return {
    Home: lazyWithRetry(() => import('@/app/(tabs)/index')),
    Library: lazyWithRetry(() => import('@/app/(tabs)/library')),
    Search: lazyWithRetry(() => import('@/app/(tabs)/search')),
    Profile: lazyWithRetry(() => import('@/app/(tabs)/profile')),
    BookDetail: lazyWithRetry(() => import('@/app/book/[id]')),
    Reader: lazyWithRetry(() => import('@/app/reader/[id]')),
    AudioPlayer: lazyWithRetry(() => import('@/app/audioPlayer/[id]')),
    Summary: lazyWithRetry(() => import('@/app/summary/[id]')),
    Settings: lazyWithRetry(() => import('@/app/settings')),
    Stats: lazyWithRetry(() => import('@/app/stats')),
    Downloads: lazyWithRetry(() => import('@/app/downloads')),
    Subscription: lazyWithRetry(() => import('@/app/subscription')),
    Login: lazyWithRetry(() => import('@/app/(auth)/login')),
    Register: lazyWithRetry(() => import('@/app/(auth)/register')),
    Onboarding: lazyWithRetry(() => import('@/app/(auth)/onboarding')),
  };
}

export const routeComponents = createRouteComponents();

export function getLazyRouteComponent(routeName: string): React.LazyExoticComponent<any> | null {
  return routeComponents[routeName] || null;
}

export function preloadRoute(routeName: string): Promise<void> {
  const component = routeComponents[routeName];
  if (!component) return Promise.resolve();
  
  return new Promise(resolve => {
    const preload = () => {
      const element = React.createElement(component);
      React.unstable_renderSubtreeIntoContainer?.(
        null,
        element,
        document.createElement('div'),
        () => resolve()
      );
    };
    
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 0);
    }
  });
}

export function preloadAllRoutes(): Promise<void> {
  return Promise.all(
    Object.values(routeComponents).map(comp => 
      new Promise(resolve => {
        const element = React.createElement(comp);
        React.unstable_renderSubtreeIntoContainer?.(
          null,
          element,
          document.createElement('div'),
          () => resolve()
        );
      })
    )
  ).then(() => {});
}

export interface CodeSplitConfig {
  chunks: string[];
  preload: string[];
  defer: string[];
}

export const codeSplitConfig: CodeSplitConfig = {
  chunks: [
    'reader',
    'audio-player',
    'subscription',
    'settings',
    'stats',
    'downloads',
  ],
  preload: [
    'home',
    'library',
    'search',
    'profile',
  ],
  defer: [
    'book-detail',
    'summary',
    'auth',
  ],
};

export function getChunkPriority(chunkName: string): 'high' | 'normal' | 'low' {
  if (codeSplitConfig.preload.includes(chunkName)) return 'high';
  if (codeSplitConfig.defer.includes(chunkName)) return 'low';
  return 'normal';
}

export async function loadChunkOnDemand(chunkName: string): Promise<any> {
  const component = routeComponents[chunkName];
  if (!component) {
    throw new Error(`Unknown chunk: ${chunkName}`);
  }
  
  return component;
}

export function useCodeSplit(
  chunkName: string
): {
  Component: React.LazyExoticComponent<any> | null;
  loading: boolean;
  error: Error | null;
} {
  const { Component, loading, error } = useLazyComponent(
    () => import(`@/app/${chunkName}`),
    { retry: true }
  );
  
  return { Component, loading, error };
}

export function withCodeSplitting<P extends object>(
  WrappedComponent: ComponentType<P>,
  chunkName: string
): ComponentType<P> {
  const LazyComponent = lazyWithRetry(
    () => import(`@/app/${chunkName}`),
    { retry: true }
  );

  const WithSplitting: React.FC<P> = (props) => (
    <Suspense fallback={<SkeletonScreen variant="home" />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WithSplitting.displayName = `withCodeSplitting(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithSplitting;
}