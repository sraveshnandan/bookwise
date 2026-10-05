module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['@testing-library/jest-native/extend-expect', '<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/utils/(.*)$': '/home/sarvesh/bookwise/utils/$1',
    '^@/components/(.*)$': '/home/sarvesh/bookwise/src/components/$1',
    '^@/src/(.*)$': '/home/sarvesh/bookwise/src/$1',
    '^@/hooks/(.*)$': '/home/sarvesh/bookwise/hooks/$1',
    '^@/constants/(.*)$': '/home/sarvesh/bookwise/constants/$1',
    '^@/types/(.*)$': '/home/sarvesh/bookwise/src/types/$1',
    '^@/store/(.*)$': '/home/sarvesh/bookwise/src/store/$1',
    '^@/api/(.*)$': '/home/sarvesh/bookwise/src/api/$1',
    '^@/services/(.*)$': '/home/sarvesh/bookwise/src/services/$1',
    '\\.(png|jpg|jpeg|gif|webp|svg|ttf|woff|woff2)$': '/home/sarvesh/bookwise/__mocks__/fileMock.js',
    '^@/(.*)$': '/home/sarvesh/bookwise/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@shopify|@react-navigation|@tanstack|zustand|lucide-react-native|nativewind|@supabase|react-native-purchases|react-native-pdf|react-native-track-player|axios|@react-native-community)/)',
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  verbose: true,
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
};