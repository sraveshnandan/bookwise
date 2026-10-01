import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Box, Text, Button, Input } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful login
    const mockUser = {
      id: 'user-1',
      email,
      name: 'John Reader',
      avatarUrl: undefined,
      preferences: {
        theme: 'system' as const,
        fontSize: 16,
        fontFamily: 'serif' as const,
        lineHeight: 1.6,
        margin: 24,
        scrollDirection: 'vertical' as const,
        playbackRate: 1.0,
        volume: 1.0,
        skipInterval: 15,
        downloadQuality: 'medium' as const,
        wifiOnlyDownloads: true,
        autoPlayAudio: false,
        dailyReminder: true,
        reminderTime: '20:00',
        language: 'en',
        genres: ['Fiction', 'Business', 'Self-Help'],
      },
      subscription: {
        tier: 'free' as const,
        status: 'active' as const,
        cancelAtPeriodEnd: false,
        entitlements: [],
      },
      stats: {
        booksRead: 12,
        hoursListened: 45,
        pagesTurned: 3420,
        currentStreak: 7,
        longestStreak: 14,
        totalReadingTime: 2700,
        genresExplored: ['Fiction', 'Business', 'Self-Help', 'History'],
        authorsRead: ['James Clear', 'Atomic Habits', 'Morgan Housel'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    };

    setAuth(mockUser, mockTokens);
    router.replace('/(tabs)');
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <Box flex={1} justifyContent="center" px={24} gap={24}>
        <Box alignItems="center" gap={8}>
          <Box p={3} bg="primary-100" borderRadius={20}>
            <LucideIcon name="book-open" size={32} color="primary-600" />
          </Box>
          <Text variant="displaySM" style={{ fontWeight: '800', textAlign: 'center' }}>
            Welcome Back
          </Text>
          <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
            Sign in to continue your reading journey
          </Text>
        </Box>

        {error && (
          <Box px={16} py={12} bg="red-50" borderRadius={12} borderWidth={1} borderColor="red-200" gap={8}>
            <Box flexDirection="row" alignItems="center" gap={8}>
              <LucideIcon name="alert-circle" size={18} color="red-600" />
              <Text variant="bodySM" color="red-700">{error}</Text>
            </Box>
          </Box>
        )}

        <Box gap={16}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<LucideIcon name="mail" size={20} color="gray" />}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            leftIcon={<LucideIcon name="lock" size={20} color="gray" />}
          />
        </Box>

        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flexDirection="row" alignItems="center" gap={8}>
            <LucideIcon name="check" size={18} color="primary-600" />
            <Text variant="bodySM" color="gray">Remember me</Text>
          </Box>
          <Button variant="ghost" size="sm" onPress={() => router.push('/(auth)/forgot-password')}>
            Forgot password?
          </Button>
        </Box>

        <Button variant="primary" size="lg" loading={isLoading} onPress={handleLogin}>
          <LucideIcon name="log-in" size={20} />
          Sign In
        </Button>

        <Box flexDirection="row" alignItems="center" gap={12}>
          <View style={styles.divider} />
          <Text variant="caption" color="gray">Or continue with</Text>
          <View style={styles.divider} />
        </Box>

        <Box gap={12}>
          <Button variant="outline" size="lg" onPress={() => {}}>
            <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8}>
              <LucideIcon name="chrome" size={20} />
              <Text>Google</Text>
            </Box>
          </Button>
          <Button variant="outline" size="lg" onPress={() => {}}>
            <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8}>
              <LucideIcon name="apple" size={20} />
              <Text>Apple</Text>
            </Box>
          </Button>
        </Box>

        <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8}>
          <Text variant="bodyMD" color="gray">Don't have an account?</Text>
          <Button variant="ghost" size="md" onPress={() => router.push('/(auth)/register')}>
            <Text variant="bodyMD" style={{ fontWeight: '600', color: 'primary-600' }}>
              Sign Up
            </Text>
          </Button>
        </Box>
      </Box>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});