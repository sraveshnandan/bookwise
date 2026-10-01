import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Box, Text, Button, Input } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful registration
    const mockUser = {
      id: 'user-1',
      email,
      name,
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
        genres: [],
      },
      subscription: {
        tier: 'free' as const,
        status: 'active' as const,
        cancelAtPeriodEnd: false,
        entitlements: [],
      },
      stats: {
        booksRead: 0,
        hoursListened: 0,
        pagesTurned: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalReadingTime: 0,
        genresExplored: [],
        authorsRead: [],
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
    router.replace('/(auth)/onboarding');
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
            Create Account
          </Text>
          <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
            Start your reading journey today
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
            label="Full Name"
            placeholder="John Reader"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            leftIcon={<LucideIcon name="user" size={20} color="gray" />}
          />
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
            autoComplete="new-password"
            leftIcon={<LucideIcon name="lock" size={20} color="gray" />}
            helperText="At least 8 characters"
          />
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
            leftIcon={<LucideIcon name="lock" size={20} color="gray" />}
          />
        </Box>

        <Box flexDirection="row" alignItems="flex-start" gap={8}>
          <LucideIcon name="check" size={18} color="primary-600" style={{ marginTop: 2 }} />
          <Text variant="bodySM" color="gray">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Box>

        <Button variant="primary" size="lg" loading={isLoading} onPress={handleRegister}>
          <LucideIcon name="user-plus" size={20} />
          Create Account
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
          <Text variant="bodyMD" color="gray">Already have an account?</Text>
          <Button variant="ghost" size="md" onPress={() => router.push('/(auth)/login')}>
            <Text variant="bodyMD" style={{ fontWeight: '600', color: 'primary-600' }}>
              Sign In
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