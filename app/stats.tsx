import React from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Box, Text } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { LucideIcon } from 'lucide-react-native';
import { formatDuration, formatNumber, formatRelativeTime } from '@/utils/formatters';
import { ACHIEVEMENTS } from '@/constants/app';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();
  const { items: libraryItems, highlights } = useLibraryStore();

  const stats = user?.stats || {
    booksRead: 0,
    hoursListened: 0,
    pagesTurned: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalReadingTime: 0,
    genresExplored: [],
    authorsRead: [],
  };

  const booksFinished = libraryItems.filter(item => item.progress >= 1).length;
  const currentlyReading = libraryItems.filter(item => item.progress > 0 && item.progress < 1).length;
  const totalHighlights = highlights.length;
  const totalAuthors = new Set(libraryItems.map(item => item.book.author)).size;

  const genreCounts = libraryItems.reduce((acc, item) => {
    item.book.genres.forEach(genre => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const recentBooks = libraryItems
    .filter(item => item.lastReadAt)
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    .slice(0, 5);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <Box px={16} py={24} gap={24}>
        <Text variant="headingXL" style={{ fontWeight: '800' }}>
          Reading Stats
        </Text>

        <Box gap={16} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <StatCard
            title="Books Finished"
            value={booksFinished}
            icon="book-open"
            color="primary"
            subtitle="+{stats.booksRead} lifetime"
          />
          <StatCard
            title="Hours Listened"
            value={formatDuration(stats.hoursListened * 3600)}
            icon="headphones"
            color="secondary"
            subtitle="+{formatDuration(stats.totalReadingTime * 60)} total"
          />
          <StatCard
            title="Pages Turned"
            value={formatNumber(stats.pagesTurned)}
            icon="file-text"
            color="accent"
            subtitle="+{formatNumber(stats.pagesTurned)} lifetime"
          />
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon="flame"
            color="warning"
            subtitle="Best: {stats.longestStreak} days"
          />
        </Box>

        <Box px={16} py={20} gap={16} bg="primary-50" borderRadius={16} borderWidth={1} borderColor="primary-200">
          <Text variant="headingSM" style={{ fontWeight: '700', color: 'primary-800' }}>
            This Month
          </Text>
          <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <MiniStat label="Books" value={booksFinished} />
            <MiniStat label="Hours" value={Math.round(stats.hoursListened / 12)} />
            <MiniStat label="Highlights" value={totalHighlights} />
            <MiniStat label="Authors" value={totalAuthors} />
          </Box>
        </Box>

        <Box gap={16}>
          <Text variant="headingLG" style={{ fontWeight: '700' }}>Top Genres</Text>
          {topGenres.length > 0 ? (
            <Box gap={8}>
              {topGenres.map(([genre, count]) => (
                <Box key={genre} flexDirection="row" alignItems="center" gap={12} px={16} py={12} bg="gray-50" borderRadius={12}>
                  <Box w={8} h={8} borderRadius={4} bg="primary-500" />
                  <Text variant="bodyMD" style={{ fontWeight: '500', flex: 1 }}>{genre}</Text>
                  <Text variant="bodyMD" color="gray">{count} books</Text>
                  <View style={[
                    styles.genreBar,
                    { width: `${(count / (topGenres[0][1] || 1)) * 100}%` },
                  ]} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box py={32} alignItems="center" gap={8}>
              <LucideIcon name="bar-chart-2" size={48} color="gray" />
              <Text variant="bodyMD" color="gray">Read more books to see your top genres</Text>
            </Box>
          )}
        </Box>

        <Box gap={16}>
          <Text variant="headingLG" style={{ fontWeight: '700' }}>Recent Activity</Text>
          {recentBooks.length > 0 ? (
            <Box gap={8}>
              {recentBooks.map((item) => (
                <Box key={item.id} flexDirection="row" alignItems="center" gap={12} px={16} py={12} bg="gray-50" borderRadius={12}>
                  <Box w={50} h={75} borderRadius={8} overflow="hidden" bg="gray-200">
                    {item.book.coverUrl ? (
                      <Image source={{ uri: item.book.coverUrl }} style={{ width: 50, height: 75, resizeMode: 'cover' }} contentFit="cover" />
                    ) : (
                      <Box flex={1} alignItems="center" justifyContent="center"><LucideIcon name="book" size={20} color="gray" /></Box>
                    )}
                  </Box>
                  <Box flex={1} gap={2}>
                    <Text variant="bodySM" style={{ fontWeight: '600' }}>{item.book.title}</Text>
                    <Text variant="caption" color="gray">{item.book.author}</Text>
                    <Text variant="caption" color="primary-600">
                      {Math.round(item.progress * 100)}% • {formatRelativeTime(item.lastReadAt)}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box py={32} alignItems="center" gap={8}>
              <LucideIcon name="clock" size={48} color="gray" />
              <Text variant="bodyMD" color="gray">No recent activity</Text>
            </Box>
          )}
        </Box>

        <Box gap={16}>
          <Text variant="headingLG" style={{ fontWeight: '700' }}>Achievements</Text>
          <Box gap={8}>
            {ACHIEVEMENTS.slice(0, 6).map((achievement) => (
              <Box key={achievement.id} flexDirection="row" alignItems="center" gap={12} px={16} py={12} bg="gray-50" borderRadius={12}>
                <Box p={2} bg="primary-100" borderRadius={12}>
                  <LucideIcon name={achievement.icon} size={24} color="primary-600" />
                </Box>
                <Box flex={1} gap={2}>
                  <Text variant="bodySM" style={{ fontWeight: '600' }}>{achievement.name}</Text>
                  <Text variant="caption" color="gray">{achievement.description}</Text>
                </Box>
                <Box p={1.5} bg="primary-100" borderRadius={9999}>
                  <LucideIcon name="lock" size={14} color="primary-600" />
                </Box>
              </Box>
            ))}
          </Box>
          <Button variant="outline" size="sm" onPress={() => {}}>
            <LucideIcon name="trophy" size={18} />
            View All Achievements
          </Button>
        </Box>
      </Box>
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color, subtitle }: { title: string; value: string | number; icon: string; color: 'primary' | 'secondary' | 'accent' | 'warning'; subtitle?: string }) {
  const colors = {
    primary: { bg: 'primary-100', text: 'primary-600', iconBg: 'primary-100' },
    secondary: { bg: 'secondary-100', text: 'secondary-600', iconBg: 'secondary-100' },
    accent: { bg: 'accent-100', text: 'accent-600', iconBg: 'accent-100' },
    warning: { bg: 'warning-100', text: 'warning-600', iconBg: 'warning-100' },
  };
  const c = colors[color];

  return (
    <Box flex={1} minWidth={140} px={16} py={20} gap={8} bg={c.bg} borderRadius={16} borderWidth={1} borderColor={`${color}-200`}>
      <Box p={2} bg={c.iconBg} borderRadius={12}>
        <LucideIcon name={icon} size={24} color={c.text} />
      </Box>
      <Text variant="displaySM" style={{ fontWeight: '800', color: c.text }}>
        {value}
      </Text>
      <Text variant="caption" color="gray">{title}</Text>
      {subtitle && <Text variant="caption" color="gray">{subtitle}</Text>}
    </Box>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Box flex={1} minWidth={70} alignItems="center" gap={4}>
      <Text variant="headingLG" style={{ fontWeight: '800', color: 'primary-600' }}>{value}</Text>
      <Text variant="caption" color="gray">{label}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  genreBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    minWidth: 40,
  },
});

import { Image } from 'expo-image';