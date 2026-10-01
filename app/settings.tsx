import React from 'react';
import { ScrollView, StyleProp, ViewStyle, Platform, Switch } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useReaderStore } from '@/store/readerStore';
import { useDownloadStore } from '@/store/downloadStore';
import { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const settingsSections = [
  {
    title: 'Reading Experience',
    items: [
      { id: 'fontFamily', label: 'Font Family', type: 'select', options: ['sans', 'serif', 'mono'] },
      { id: 'fontSize', label: 'Font Size', type: 'slider', min: 12, max: 24 },
      { id: 'lineHeight', label: 'Line Height', type: 'slider', min: 1.2, max: 2.0, step: 0.1 },
      { id: 'margin', label: 'Margins', type: 'slider', min: 10, max: 50, step: 4 },
      { id: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark', 'sepia', 'auto'] },
      { id: 'scrollDirection', label: 'Scroll Direction', type: 'select', options: ['vertical', 'horizontal'] },
      { id: 'justifyText', label: 'Justify Text', type: 'toggle' },
      { id: 'hyphenation', label: 'Hyphenation', type: 'toggle' },
    ],
  },
  {
    title: 'Audio Settings',
    items: [
      { id: 'playbackRate', label: 'Playback Speed', type: 'slider', min: 0.5, max: 3.0, step: 0.1 },
      { id: 'skipInterval', label: 'Skip Interval (seconds)', type: 'select', options: [10, 15, 30, 60] },
      { id: 'autoPlayNext', label: 'Auto-play Next Chapter', type: 'toggle' },
      { id: 'normalizeAudio', label: 'Normalize Audio Volume', type: 'toggle' },
    ],
  },
  {
    title: 'Downloads & Storage',
    items: [
      { id: 'downloadQuality', label: 'Download Quality', type: 'select', options: ['low', 'medium', 'high'] },
      { id: 'wifiOnlyDownloads', label: 'WiFi Only Downloads', type: 'toggle' },
      { id: 'maxConcurrentDownloads', label: 'Max Concurrent Downloads', type: 'slider', min: 1, max: 5 },
      { id: 'autoDeleteFinished', label: 'Auto-delete Finished Books', type: 'toggle' },
      { id: 'storageLimit', label: 'Storage Limit', type: 'select', options: ['1GB', '2GB', '5GB', '10GB', 'Unlimited'] },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { id: 'dailyReminder', label: 'Daily Reading Reminder', type: 'toggle' },
      { id: 'reminderTime', label: 'Reminder Time', type: 'time' },
      { id: 'newReleases', label: 'New Release Notifications', type: 'toggle' },
      { id: 'achievementNotifications', label: 'Achievement Notifications', type: 'toggle' },
      { id: 'downloadComplete', label: 'Download Complete Notifications', type: 'toggle' },
    ],
  },
  {
    title: 'Account & Privacy',
    items: [
      { id: 'subscription', label: 'Manage Subscription', type: 'navigate', navigate: 'subscription' },
      { id: 'syncData', label: 'Sync Data Now', type: 'action', action: 'sync' },
      { id: 'exportData', label: 'Export My Data', type: 'action', action: 'export' },
      { id: 'deleteAccount', label: 'Delete Account', type: 'navigate', navigate: 'delete-account', destructive: true },
      { id: 'privacyPolicy', label: 'Privacy Policy', type: 'navigate', navigate: 'privacy' },
      { id: 'termsOfService', label: 'Terms of Service', type: 'navigate', navigate: 'terms' },
    ],
  },
  {
    title: 'About',
    items: [
      { id: 'version', label: 'App Version', type: 'info', value: '1.0.0' },
      { id: 'openSource', label: 'Open Source Licenses', type: 'navigate', navigate: 'licenses' },
      { id: 'feedback', label: 'Send Feedback', type: 'navigate', navigate: 'feedback' },
      { id: 'rateApp', label: 'Rate BookWise', type: 'action', action: 'rate' },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, updatePreferences } = useAuthStore();
  const { settings: readerSettings } = useReaderStore();
  const { wifiOnly, setWifiOnly, maxConcurrent, setMaxConcurrent } = useDownloadStore();
  const prefs = user?.preferences;

  const getValue = (id: string) => {
    if (prefs && id in prefs) return (prefs as any)[id];
    if (readerSettings && id in readerSettings) return (readerSettings as any)[id];
    return null;
  };

  const handleChange = (id: string, value: any) => {
    if (prefs && id in prefs) {
      updatePreferences({ [id]: value });
    }
    if (readerSettings && id in readerSettings) {
      // Reader store updates handled separately
    }
    if (id === 'wifiOnlyDownloads') setWifiOnly(value);
    if (id === 'maxConcurrentDownloads') setMaxConcurrent(value);
  };

  const renderItem = (item: any) => {
    const value = getValue(item.id);
    const isDestructive = item.destructive;

    switch (item.type) {
      case 'toggle':
        return (
          <Box key={item.id} flexDirection="row" justifyContent="space-between" alignItems="center" py={12}>
            <Text variant="bodyMD" color={isDestructive ? 'red' : undefined} style={{ fontWeight: '500' }}>
              {item.label}
            </Text>
            <Switch
              value={value || false}
              onValueChange={(v) => handleChange(item.id, v)}
              trackColor={{ false: '#e5e7eb', true: '#0ea5e9' }}
              thumbColor={isDestructive ? '#ef4444' : '#fff'}
            />
          </Box>
        );

      case 'select':
        return (
          <Box key={item.id} py={12} gap={8}>
            <Text variant="bodyMD" color={isDestructive ? 'red' : undefined} style={{ fontWeight: '500' }}>
              {item.label}
            </Text>
            <Box flexDirection="row" gap={8} style={{ flexWrap: 'wrap' }}>
              {item.options.map((opt: any) => (
                <Button
                  key={opt}
                  variant={value === opt ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => handleChange(item.id, opt)}
                >
                  {typeof opt === 'string' ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}
                </Button>
              ))}
            </Box>
          </Box>
        );

      case 'slider':
        return (
          <Box key={item.id} py={12} gap={8}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="bodyMD" color={isDestructive ? 'red' : undefined} style={{ fontWeight: '500' }}>
                {item.label}
              </Text>
              <Text variant="bodySM" color="gray">{value}</Text>
            </Box>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${((value - (item.min || 0)) / ((item.max || 100) - (item.min || 0))) * 100}%` },
                ]}
              />
            </View>
          </Box>
        );

      case 'time':
        return (
          <Box key={item.id} py={12} gap={8}>
            <Text variant="bodyMD" color={isDestructive ? 'red' : undefined} style={{ fontWeight: '500' }}>
              {item.label}
            </Text>
            <Button variant="outline" size="sm" onPress={() => {}}>
              {value || 'Set time'}
            </Button>
          </Box>
        );

      case 'navigate':
        return (
          <Box
            key={item.id}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            py={12}
            onPress={() => item.navigate && router.push(`/${item.navigate}`)}
          >
            <Text variant="bodyMD" color={isDestructive ? 'red' : undefined} style={{ fontWeight: '500' }}>
              {item.label}
            </Text>
            <LucideIcon name="chevron-right" size={18} color="gray" />
          </Box>
        );

      case 'action':
        return (
          <Box
            key={item.id}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            py={12}
            onPress={() => console.log(item.action)}
          >
            <Text variant="bodyMD" color={isDestructive ? 'red' : undefined} style={{ fontWeight: '500' }}>
              {item.label}
            </Text>
            <LucideIcon name="chevron-right" size={18} color="gray" />
          </Box>
        );

      case 'info':
        return (
          <Box key={item.id} flexDirection="row" justifyContent="space-between" alignItems="center" py={12}>
            <Text variant="bodyMD" color={isDestructive ? 'red' : undefined} style={{ fontWeight: '500' }}>
              {item.label}
            </Text>
            <Text variant="bodyMD" color="gray">{item.value}</Text>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <Box px={16} py={24} gap={8}>
        <Text variant="headingXL" style={{ fontWeight: '800' }}>
          Settings
        </Text>
        <Text variant="bodyMD" color="gray">
          Customize your reading experience
        </Text>
      </Box>

      {settingsSections.map((section) => (
        <Box key={section.title} px={16} py={8} gap={4}>
          <Text variant="bodySM" color="gray" style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {section.title}
          </Text>
          {section.items.map(renderItem)}
        </Box>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sliderTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
});