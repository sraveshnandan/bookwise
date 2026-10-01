import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const features = [
  { icon: 'book-open', title: 'Vast Library', description: 'Access millions of books, audiobooks & summaries' },
  { icon: 'headphones', title: 'Audio First', description: 'Listen to books with speed control & sleep timer' },
  { icon: 'file-text', title: 'Smart Summaries', description: 'Key insights in text, PDF & audio formats' },
  { icon: 'download', title: 'Offline Reading', description: 'Download books & read anywhere, no internet needed' },
  { icon: 'flame', title: 'Reading Streaks', description: 'Build habits with streaks, goals & achievements' },
  { icon: 'cloud', title: 'Cloud Sync', description: 'Progress synced across all your devices' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Box flex={1} justifyContent="center" px={24} gap={16}>
        <Box alignItems="center" gap={24}>
          <Box p={4} bg="primary-100" borderRadius={24}>
            <LucideIcon name="book-open" size={48} color="primary-600" />
          </Box>
          <Box alignItems="center" gap={8}>
            <Text variant="displaySM" style={{ fontWeight: '800', textAlign: 'center', lineHeight: 1.1 }}>
              BookWise
            </Text>
            <Text variant="bodyLG" color="gray" style={{ textAlign: 'center', maxWidth: 300 }}>
              Your personal micro-reading companion. Read more, learn faster, grow daily.
            </Text>
          </Box>
        </Box>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingHorizontal: 8 }}
        >
          {features.map((feature, index) => (
            <Box key={index} w={SCREEN_WIDTH - 64} gap={12} bg="gray-50" borderRadius={16} p={16}>
              <Box p={3} bg="primary-100" borderRadius={12}>
                <LucideIcon name={feature.icon} size={24} color="primary-600" />
              </Box>
              <Text variant="headingSM" style={{ fontWeight: '700' }}>
                {feature.title}
              </Text>
              <Text variant="bodySM" color="gray">
                {feature.description}
              </Text>
            </Box>
          ))}
        </ScrollView>

        <Box pt={16} gap={12} style={{ width: '100%' }}>
          <Button variant="primary" size="lg" onPress={() => router.push('/(auth)/login')}>
            <LucideIcon name="log-in" size={20} />
            Sign In
          </Button>
          <Button variant="outline" size="lg" onPress={() => router.push('/(auth)/register')}>
            <LucideIcon name="user-plus" size={20} />
            Create Free Account
          </Button>
          <Text variant="caption" color="gray" style={{ textAlign: 'center' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Box>
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});