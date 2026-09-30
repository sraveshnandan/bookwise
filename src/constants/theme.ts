export const Colors = {
  // Primary - Blue
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  // Secondary - Purple
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
  // Accent - Orange
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  // Pure
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const LightTheme = {
  colors: {
    // Backgrounds
    background: Colors.gray[50],
    backgroundSecondary: Colors.white,
    backgroundTertiary: Colors.gray[100],
    surface: Colors.white,
    surfaceElevated: Colors.white,
    
    // Text
    textPrimary: Colors.gray[900],
    textSecondary: Colors.gray[600],
    textTertiary: Colors.gray[400],
    textInverse: Colors.white,
    textLink: Colors.primary[600],
    
    // Borders
    border: Colors.gray[200],
    borderStrong: Colors.gray[300],
    borderFocus: Colors.primary[500],
    
    // Brand
    primary: Colors.primary[600],
    primaryHover: Colors.primary[700],
    primaryLight: Colors.primary[100],
    secondary: Colors.secondary[600],
    secondaryHover: Colors.secondary[700],
    secondaryLight: Colors.secondary[100],
    accent: Colors.accent[500],
    accentHover: Colors.accent[600],
    accentLight: Colors.accent[100],
    
    // Status
    success: Colors.success[600],
    successLight: Colors.success[100],
    warning: Colors.warning[600],
    warningLight: Colors.warning[100],
    danger: Colors.danger[600],
    dangerLight: Colors.danger[100],
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    scrim: 'rgba(0, 0, 0, 0.3)',
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  typography: {
    fontFamilies: {
      sans: 'Inter',
      serif: 'Merriweather',
      mono: 'JetBrains Mono',
      display: 'Cal Sans',
    },
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    fontSizes: {
      displayXL: 72,
      displayLG: 60,
      displayMD: 48,
      displaySM: 36,
      headingXL: 30,
      headingLG: 24,
      headingMD: 20,
      headingSM: 18,
      bodyLG: 18,
      bodyMD: 16,
      bodySM: 14,
      caption: 12,
    },
    lineHeights: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.75,
    },
  },
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  animation: {
    durations: {
      fast: 150,
      normal: 200,
      slow: 300,
    },
    easings: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

export const DarkTheme = {
  colors: {
    // Backgrounds
    background: '#0f0f1a',
    backgroundSecondary: '#1a1a2e',
    backgroundTertiary: '#252542',
    surface: '#1a1a2e',
    surfaceElevated: '#252542',
    
    // Text
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',
    textInverse: '#0f0f1a',
    textLink: Colors.primary[400],
    
    // Borders
    border: '#3f3f46',
    borderStrong: '#52525b',
    borderFocus: Colors.primary[500],
    
    // Brand
    primary: Colors.primary[500],
    primaryHover: Colors.primary[400],
    primaryLight: Colors.primary[900],
    secondary: Colors.secondary[500],
    secondaryHover: Colors.secondary[400],
    secondaryLight: Colors.secondary[900],
    accent: Colors.accent[500],
    accentHover: Colors.accent[400],
    accentLight: Colors.accent[900],
    
    // Status
    success: Colors.success[500],
    successLight: Colors.success[900],
    warning: Colors.warning[500],
    warningLight: Colors.warning[900],
    danger: Colors.danger[500],
    dangerLight: Colors.danger[900],
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    scrim: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: LightTheme.spacing,
  borderRadius: LightTheme.borderRadius,
  typography: LightTheme.typography,
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
  },
  animation: LightTheme.animation,
  breakpoints: LightTheme.breakpoints,
} as const;

export type Theme = typeof LightTheme;
export type ColorScheme = 'light' | 'dark';