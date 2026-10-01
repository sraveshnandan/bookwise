import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Box, Text, Button, Input } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setSuccess(true);
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
            <LucideIcon name="lock" size={32} color="primary-600" />
          </Box>
          {success ? (
            <>
              <Text variant="displaySM" style={{ fontWeight: '800', textAlign: 'center' }}>
                Check Your Email
              </Text>
              <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
                We've sent a password reset link to {email}
              </Text>
            </>
          ) : (
            <>
              <Text variant="displaySM" style={{ fontWeight: '800', textAlign: 'center' }}>
                Reset Password
              </Text>
              <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
                Enter your email and we'll send you a link to reset your password
              </Text>
            </>
          )}
        </Box>

        {!success && (
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
          </Box>
        )}

        {!success ? (
          <Button variant="primary" size="lg" loading={isLoading} onPress={handleSubmit}>
            <LucideIcon name="send" size={20} />
            Send Reset Link
          </Button>
        ) : (
          <Box gap={12}>
            <Button variant="primary" size="lg" onPress={() => router.push('/(auth)/login')}>
              <LucideIcon name="log-in" size={20} />
              Back to Sign In
            </Button>
            <Button variant="ghost" size="md" onPress={() => { setSuccess(false); setEmail(''); }}>
              Resend Email
            </Button>
          </Box>
        )}

        <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8}>
          <Text variant="bodyMD" color="gray">Remember your password?</Text>
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

import { Alert } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});