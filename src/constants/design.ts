import { Colors } from './theme';

export const Fonts = {
  sans: 'Inter',
  serif: 'Merriweather',
  mono: 'JetBrains Mono',
  display: 'Cal Sans',
} as const;

export const FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const Typography = {
  displayXL: {
    fontFamily: Fonts.display,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -1.5,
    fontWeight: FontWeights.extrabold,
  },
  displayLG: {
    fontFamily: Fonts.display,
    fontSize: 60,
    lineHeight: 66,
    letterSpacing: -1,
    fontWeight: FontWeights.extrabold,
  },
  displayMD: {
    fontFamily: Fonts.display,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.5,
    fontWeight: FontWeights.bold,
  },
  displaySM: {
    fontFamily: Fonts.display,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.25,
    fontWeight: FontWeights.bold,
  },
  headingXL: {
    fontFamily: Fonts.sans,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.5,
    fontWeight: FontWeights.bold,
  },
  headingLG: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.25,
    fontWeight: FontWeights.semibold,
  },
  headingMD: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
  },
  headingSM: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: FontWeights.semibold,
  },
  bodyLG: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: FontWeights.regular,
  },
  bodyMD: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
  },
  bodySM: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: FontWeights.regular,
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
  },
  button: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeights.semibold,
  },
  overline: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeights.medium,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Spacing = {
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
  20: 80,
  24: 96,
} as const;

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  inner: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: -1,
  },
} as const;

export const Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ZIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

export const Transitions = {
  fast: '150ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
} as const;

export const Animations = {
  fadeIn: {
    duration: 200,
    easing: 'ease-out',
  },
  fadeOut: {
    duration: 200,
    easing: 'ease-in',
  },
  slideUp: {
    duration: 300,
    easing: 'ease-out',
  },
  slideDown: {
    duration: 300,
    easing: 'ease-out',
  },
  scaleIn: {
    duration: 200,
    easing: 'ease-out',
  },
} as const;