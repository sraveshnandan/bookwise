import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/utils/performance/**',
      ],
    },
    pool: 'threads',
    singleThread: true,
    isolate: false,
  },
  resolve: {
    alias: {
      '@': '/home/sarvesh/bookwise',
      '@/components': '/home/sarvesh/bookwise/src/components',
      '@/src': '/home/sarvesh/bookwise/src',
      '@/hooks': '/home/sarvesh/bookwise/src/hooks',
      '@/constants': '/home/sarvesh/bookwise/src/constants',
      '@/utils': '/home/sarvesh/bookwise/src/utils',
      '@/types': '/home/sarvesh/bookwise/src/types',
      '@/store': '/home/sarvesh/bookwise/src/store',
      '@/api': '/home/sarvesh/bookwise/src/api',
      '@/services': '/home/sarvesh/bookwise/src/services',
    },
  },
});