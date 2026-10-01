import React from 'react';
import { ScrollView, StyleProp, ViewStyle, Platform } from 'react-native';
import { Box, Text, Button, Input } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useReaderStore } from '@/store/readerStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { formatDuration, formatNumber } from '@/utils/formatters';
import Link from 'expo-router/Link';

const settingsSections = [
  {
    title: 'Reading',
    items: [
      { id: 'font', label: 'Font Family', value: 'Serif', icon: 'type' },
      { id: 'fontSize', label: 'Font Size', value: '16', icon: 'text' },
      { id: 'theme', label: 'Theme', value: 'System', icon: 'sun' },
      { id: 'scroll', label: 'Scroll Direction', value: 'Vertical', icon: 'move-vertical' },
    ],
  },
  {
    title: 'Audio',
    items: [
      { id: 'playbackRate', label: 'Playback Speed', value: '1.0x', icon: 'fast-forward' },
      { id: 'skipInterval', label: 'Skip Interval', value: '15s', icon: 'skip-forward' },
      { id: 'sleepTimer', label: 'Sleep Timer', value: 'Off', icon: 'moon' },
      { id: 'autoPlay', label: 'Auto-play Next', value: 'On', icon: 'play-circle' },
    ],
  },
  {
    title: 'Downloads',
    items: [
      { id: 'quality', label: 'Download Quality', value: 'Medium', icon: 'download' },
      { id: 'wifiOnly', label: 'WiFi Only', value: 'On', icon: 'wifi' },
      { id: 'autoDelete', label: 'Auto-delete Finished', value: 'Off', icon: 'trash-2' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { id: 'dailyReminder', label: 'Daily Reading Reminder', value: '8:00 PM', icon: 'bell' },
      { id: 'newReleases', label: 'New Releases', value: 'On', icon: 'book-plus' },
      { id: 'achievements', label: 'Achievements', value: 'On', icon: 'trophy' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'subscription', label: 'Subscription', value: 'Free', icon: 'crown', navigate: 'subscription' },
      { id: 'sync', label: 'Sync Data', value: 'Now', icon: 'refresh-cw', navigate: 'sync' },
      { id: 'export', label: 'Export Data', value: '', icon: 'download', navigate: 'export' },
      { id: 'delete', label: 'Delete Account', value: '', icon: 'trash-2', destructive: true, navigate: 'delete' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', label: 'Help Center', value: '', icon: 'help-circle', navigate: 'help' },
      { id: 'feedback', label: 'Send Feedback', value: '', icon: 'message-circle', navigate: 'feedback' },
      { id: 'privacy', label: 'Privacy Policy', value: '', icon: 'shield', navigate: 'privacy' },
      { id: 'terms', label: 'Terms of Service', value: '', icon: 'file-text', navigate: 'terms' },
    ],
  },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, isAuthenticated, isOnboardingComplete } = useAuthStore();
  const { items: libraryItems, highlights } = useLibraryStore();
  const { settings: readerSettings } = useReaderStore();

  const booksRead = libraryItems.filter(item => item.progress >= 1).length;
  const currentlyReading = libraryItems.filter(item => item.progress > 0 && item.progress < 1).length;
  const totalHighlights = highlights.length;

  if (!isAuthenticated) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" px={24} gap={16}>
        <Box p={4} bg="primary-100" borderRadius={9999}>
          <LucideIcon name="user" size={48} color="primary-600" />
        </Box>
        <Box alignItems="center" gap={8}>
          <Text variant="headingLG" style={{ fontWeight: '700', textAlign: 'center' }}>
            Sign in to BookWise
          </Text>
          <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
            Sync your library, highlights & progress across devices
          </Text>
          <Button variant="primary" onPress={() => {}}>
            <LucideIcon name="log-in" size={18} />
            Sign In
          </Button>
          <Button variant="outline" onPress={() => {}}>
            Create Account
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <Box px={16} py={24} gap={16}>
        <Box flexDirection="row" alignItems="center" gap={16}>
          <Box
            w={80}
            h={80}
            borderRadius={9999}
            bg="primary-100"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={{ width: 80, height: 80, borderRadius: 9999 }} />
            ) : (
              <Text variant="headingXL" color="primary-600" style={{ fontWeight: '700' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </Box>
          <Box flex={1} gap={4}>
            <Text variant="headingLG" style={{ fontWeight: '700' }}>
              {user?.name || 'User'}
            </Text>
            <Text variant="bodySM" color="gray">
              {user?.email}
            </Text>
            <Box flexDirection="row" gap={2} mt={2}>
              {user?.subscription?.tier === 'premium' && (
                <Box px={2} py={0.5} bg="amber-100" borderRadius={4}>
                  <Text variant="caption" color="amber-800" style={{ fontWeight: '600' }}>
                    Premium
                  </Text>
                </Box>
              )}
              {user?.subscription?.tier === 'lifetime' && (
                <Box px={2} py={0.5} bg="purple-100" borderRadius={4}>
                  <Text variant="caption" color="purple-800" style={{ fontWeight: '600' }}>
                    Lifetime
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
          <Button variant="ghost" size="sm" onPress={() => {}}>
            <LucideIcon name="edit-2" size={20} />
          </Button>
        </Box>

        <Box gap={4} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <StatItem label="Books Read" value={formatNumber(booksRead)} icon="book-open" />
          <StatItem label="Reading Now" value={currentlyReading} icon="book-heart" />
          <StatItem label="Highlights" value={formatNumber(totalHighlights)} icon="highlighter" />
          <StatItem label="Streak" value={`${user?.stats?.currentStreak || 0} days`} icon="flame" />
        </Box>
      </Box>

      <Box px={16} py={8} gap={4}>
        <Text variant="headingSM" style={{ fontWeight: '700', color: 'gray' }}>
          SETTINGS
        </Text>
      </Box>

      {settingsSections.map((section) => (
        <Box key={section.title} px={16} py={8} gap={2}>
          {section.items.map((item) => (
            <SettingsRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              value={item.value}
              destructive={item.destructive}
              onPress={() => item.navigate && console.log(item.navigate)}
            />
          ))}
        </Box>
      ))}

      <Box px={16} py={24} gap={12}>
        <Button variant="outline" onPress={() => {}}>
          <LucideIcon name="log-out" size={18} />
          Sign Out
        </Button>
        <Text variant="caption" color="gray" style={{ textAlign: 'center' }}>
          App version 1.0.0
        </Text>
      </Box>
    </ScrollView>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  const colorScheme = useColorScheme();
  return (
    <Box flex={1} alignItems="center" gap={4} py={8} px={4}>
      <Box p={2} bg={colorScheme === 'dark' ? '#252542' : '#fff'} borderWidth={1} borderColor={colorScheme === 'dark' ? '#3f3f46' : '#e5e7eb'} borderRadius={12}>
        <LucideIcon name={icon} size={20} color="primary-600" />
      </Box>
      <Text variant="headingSM" style={{ fontWeight: '700' }}>{value}</Text>
      <Text variant="caption" color="gray">{label}</Text>
    </Box>
  );
}

function SettingsRow({ icon, label, value, destructive, onPress }: { icon: string; label: string; value: string; destructive?: boolean; onPress?: () => void }) {
  const colorScheme = useColorScheme();
  const textColor = destructive ? '#ef4444' : colorScheme === 'dark' ? '#fafafa' : '#111827';
  const valueColor = colorScheme === 'dark' ? '#a1a1aa' : '#6b7280';

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      py={12}
      px={0}
      onPress={onPress}
    >
      <Box flexDirection="row" alignItems="center" gap={12}>
        <Box p={2} bg={colorScheme === 'dark' ? '#252542' : '#f3f4f6'} borderRadius={8}>
          <LucideIcon name={icon} size={20} color={destructive ? '#ef4444' : 'primary-600'} />
        </Box>
        <Text variant="bodyMD" color={textColor} style={{ fontWeight: '500' }}>
          {label}
        </Text>
      </Box>
      <Box flexDirection="row" alignItems="center" gap={8}>
        {value && <Text variant="bodySM" color={valueColor}>{value}</Text>}
        <LucideIcon name="chevron-right" size={18} color={colorScheme === 'dark' ? '#71717a' : '#9ca3af'} />
      </Box>
    </Box>
  );
}

import { Image } from 'expo-image';