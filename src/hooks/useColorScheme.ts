import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export function useColorScheme(): ColorSchemeName {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const themePreference = useAuthStore((state) => state.user?.preferences.theme ?? 'system');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      setColorScheme(newColorScheme);
    });

    return () => subscription.remove();
  }, []);

  if (themePreference === 'light') return 'light';
  if (themePreference === 'dark') return 'dark';
  return colorScheme;
}

export function useThemeColor(
  lightColor: string,
  darkColor: string
): string {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColor : lightColor;
}

export function useThemeColors<T extends Record<string, string>>(
  lightColors: T,
  darkColors: T
): T {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}