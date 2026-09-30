import React from 'react';
import { ScrollView, StyleProp, ViewStyle, RefreshControl } from 'react-native';
import { Box, Text, Button } from '@/components';
import { BookCard } from '@/components/Card';
import { searchAllSources, SearchFilters } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  
  const { data: featuredBooks, isLoading } = useQuery({
    queryKey: ['featured-books'],
    queryFn: () => searchAllSources({ limit: 10, sortBy: 'popular' }),
  });

  const { data: continueReading } = useQuery({
    queryKey: ['continue-reading'],
    queryFn: () => searchAllSources({ limit: 5 }),
  });

  const genres = ['Fiction', 'Business', 'Self-Help', 'Science', 'History', 'Biography'];

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text variant="bodyLG" color="gray">Loading...</Text>
      </Box>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => {}} />
      }
    >
      <Box px={16} py={24} gap={8}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Text variant="headingXL" style={{ fontWeight: '800' }}>
              Good morning
            </Text>
            <Text variant="bodyMD" color="gray">
              What are you reading today?
            </Text>
          </Box>
          <Box p={2} bg="primary-100" borderRadius={12}>
            <LucideIcon name="bell" size={24} color="primary-600" />
          </Box>
        </Box>
      </Box>

      {continueReading?.books.length && (
        <Box px={16} py={8} gap={12}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="headingLG" style={{ fontWeight: '700' }}>
              Continue Reading
            </Text>
            <Text variant="bodySM" color="primary-600" style={{ fontWeight: '600' }}>
              See all
            </Text>
          </Box>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
            {continueReading.books.slice(0, 5).map((book) => (
              <BookCard key={book.id} book={book} variant="vertical" />
            ))}
          </ScrollView>
        </Box>
      )}

      <Box px={16} py={8} gap={12}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="headingLG" style={{ fontWeight: '700' }}>
            Explore Genres
          </Text>
          <Text variant="bodySM" color="primary-600" style={{ fontWeight: '600' }}>
            View all
          </Text>
        </Box>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {genres.map((genre) => (
            <Box
              key={genre}
              onPress={() => {}}
              bg={colorScheme === 'dark' ? '#252542' : '#fff'}
              borderWidth={1}
              borderColor={colorScheme === 'dark' ? '#3f3f46' : '#e5e7eb'}
              borderRadius={16}
              px={20}
              py={16}
              gap={8}
              minWidth={140}
              alignItems="center"
            >
              <Box p={3} bg="primary-100" borderRadius={12}>
                <LucideIcon name="book-open" size={24} color="primary-600" />
              </Box>
              <Text variant="bodySM" style={{ fontWeight: '600', textAlign: 'center' }}>
                {genre}
              </Text>
            </Box>
          ))}
        </ScrollView>
      </Box>

      <Box px={16} py={8} gap={12}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="headingLG" style={{ fontWeight: '700' }}>
            Trending Now
          </Text>
          <Text variant="bodySM" color="primary-600" style={{ fontWeight: '600' }}>
            See all
          </Text>
        </Box>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {featuredBooks?.books.slice(0, 8).map((book) => (
            <BookCard key={book.id} book={book} variant="vertical" />
          ))}
        </ScrollView>
      </Box>

      <Box px={16} py={8} gap={12}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="headingLG" style={{ fontWeight: '700' }}>
            Free Summaries
          </Text>
          <Text variant="bodySM" color="primary-600" style={{ fontWeight: '600' }}>
            See all
          </Text>
        </Box>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {featuredBooks?.books.filter(b => b.isFree).slice(0, 5).map((book) => (
            <BookCard key={book.id} book={book} variant="vertical" />
          ))}
        </ScrollView>
      </Box>

      <Box px={16} py={24} gap={16} bg="primary-50" borderRadius={16} mx={16} style={{ border: '1px solid', borderColor: 'primary-200' }}>
        <Box flexDirection="row" alignItems="center" gap={12}>
          <Box p={3} bg="primary-100" borderRadius={12}>
            <LucideIcon name="star" size={28} color="primary-600" />
          </Box>
          <Box flex={1}>
            <Text variant="headingMD" style={{ fontWeight: '700' }}>
              Unlock Unlimited Reading
            </Text>
            <Text variant="bodySM" color="gray">
              Get unlimited summaries, offline access, audio summaries & more
            </Text>
          </Box>
          <Button variant="primary" size="sm">
            Go Premium
          </Button>
        </Box>
      </Box>
    </ScrollView>
  );
}