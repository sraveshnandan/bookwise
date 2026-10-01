import React from 'react';
import { ScrollView, StyleProp, ViewStyle, Platform, ImageStyle } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getGoogleBookById, searchOpenLibrary, searchGutenberg, searchLibrivox } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { LucideIcon } from 'lucide-react-native';
import { Image } from 'expo-image';
import { formatDuration, formatNumber, formatDate } from '@/utils/formatters';
import { useLibraryStore } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function BookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const { addItem, updateProgress } = useLibraryStore();

  const bookId = id as string;

  const { data: googleBook, isLoading: loadingGoogle } = useQuery({
    queryKey: ['google-book', bookId],
    queryFn: () => getGoogleBookById(bookId),
    enabled: bookId.startsWith('gbooks-') || !bookId.startsWith('ol-'),
  });

  const { data: olBook, isLoading: loadingOL } = useQuery({
    queryKey: ['ol-book', bookId],
    queryFn: () => searchOpenLibrary({ query: bookId.replace('ol-', ''), limit: 1 }),
    enabled: bookId.startsWith('ol-'),
  });

  const book = googleBook || olBook?.books?.[0];
  const isLoading = loadingGoogle || loadingOL;

  const handleRead = () => {
    if (!book) return;
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    router.push(`/reader/${book.id}?format=epub`);
  };

  const handleListen = () => {
    if (!book) return;
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    router.push(`/audioPlayer/${book.id}`);
  };

  const handleSummary = () => {
    if (!book) return;
    router.push(`/summary/${book.id}`);
  };

  const handleAddToLibrary = () => {
    if (!book || !isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    addItem({
      id: `lib-${book.id}`,
      userId: 'current-user',
      bookId: book.id,
      book,
      progress: 0,
      currentPosition: { chapterIndex: 0, chapterProgress: 0, timestamp: Date.now() },
      lastReadAt: new Date().toISOString(),
      addedAt: new Date().toISOString(),
      downloadedFormats: [],
      isPurchased: book.isFree,
      isFavorite: false,
      tags: [],
    });
  };

  if (isLoading || !book) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <LucideIcon name="loader" size={32} color="primary-600" className="animate-spin" />
      </Box>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Box px={16} py={8} gap={8}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
          <LucideIcon name="chevron-left" size={24} onPress={() => router.back()} />
          <Box flexDirection="row" gap={8}>
            <Button variant="ghost" size="sm">
              <LucideIcon name="share-2" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <LucideIcon name="bookmark" size={18} />
            </Button>
          </Box>
        </Box>

        <Box flexDirection="row" gap={16} mt={8}>
          <Box
            w={140}
            h={210}
            borderRadius={12}
            overflow="hidden"
            bg="gray-100"
          >
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                style={{ width: 140, height: 210, resizeMode: 'cover' }}
                contentFit="cover"
              />
            ) : (
              <Box flex={1} alignItems="center" justifyContent="center">
                <LucideIcon name="book" size={48} color="gray" />
              </Box>
            )}
            {!book.isFree && book.price && (
              <Box position="absolute" top={12} right={12} bg="black" borderRadius={4} px={2} py={1}>
                <Text variant="caption" color="white" style={{ fontWeight: '600' }}>
                  ${book.price.toFixed(2)}
                </Text>
              </Box>
            )}
          </Box>

          <Box flex={1} gap={8} justifyContent="flex-start">
            <Text variant="headingLG" style={{ fontWeight: '800', lineHeight: 1.3 }}>
              {book.title}
            </Text>
            {book.subtitle && (
              <Text variant="bodyMD" color="gray">{book.subtitle}</Text>
            )}
            <Text variant="bodyMD" color="gray">by {book.author}</Text>

            <Box flexDirection="row" alignItems="center" gap={12} mt={4}>
              {book.averageRating && (
                <Box flexDirection="row" alignItems="center" gap={4}>
                  <LucideIcon name="star" size={16} color="amber-500" fill="currentColor" />
                  <Text variant="bodyMD" style={{ fontWeight: '600' }}>{book.averageRating.toFixed(1)}</Text>
                  {book.ratingsCount && (
                    <Text variant="caption" color="gray">({formatNumber(book.ratingsCount)})</Text>
                  )}
                </Box>
              )}
              {book.pageCount && (
                <Box flexDirection="row" alignItems="center" gap={4}>
                  <LucideIcon name="file-text" size={16} color="gray" />
                  <Text variant="caption" color="gray">{book.pageCount} pages</Text>
                </Box>
              )}
            </Box>

            <Box flexDirection="row" gap={8} flexWrap="wrap">
              {book.hasEpub && (
                <Box px={3} py={1} bg="green-100" borderRadius={9999}>
                  <Text variant="caption" color="green-800" style={{ fontWeight: '600' }}>EPUB</Text>
                </Box>
              )}
              {book.hasPdf && (
                <Box px={3} py={1} bg="red-100" borderRadius={9999}>
                  <Text variant="caption" color="red-800" style={{ fontWeight: '600' }}>PDF</Text>
                </Box>
              )}
              {book.hasAudiobook && (
                <Box px={3} py={1} bg="purple-100" borderRadius={9999}>
                  <LucideIcon name="headphones" size={10} color="purple-800" />
                </Box>
              )}
              {book.hasSummary && (
                <Box px={3} py={1} bg="blue-100" borderRadius={9999}>
                  <Text variant="caption" color="blue-800" style={{ fontWeight: '600' }}>Summary</Text>
                </Box>
              )}
              {book.isFree && (
                <Box px={3} py={1} bg="gray-100" borderRadius={9999}>
                  <Text variant="caption" color="gray-800" style={{ fontWeight: '600' }}>Free</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box mt={16} gap={8} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onPress={handleRead} flex={1}>
            <LucideIcon name="book-open" size={20} />
            Read
          </Button>
          {book.hasAudiobook && (
            <Button variant="secondary" size="lg" onPress={handleListen} flex={1}>
              <LucideIcon name="headphones" size={20} />
              Listen
            </Button>
          )}
          {book.hasSummary && (
            <Button variant="outline" size="lg" onPress={handleSummary} flex={1}>
              <LucideIcon name="file-text" size={20} />
              Summary
            </Button>
          )}
          {!isAuthenticated && (
            <Button variant="outline" size="lg" onPress={() => router.push('/(auth)/login')} flex={1}>
              <LucideIcon name="plus" size={20} />
              Save
            </Button>
          )}
        </Box>

        <Box mt={24} pt={16} borderTopWidth={1} borderColor={colorScheme === 'dark' ? '#3f3f46' : '#e5e7eb'} gap={16}>
          <Text variant="headingLG" style={{ fontWeight: '700' }}>About this book</Text>
          {book.description && (
            <Text variant="bodyMD" color="gray" style={{ lineHeight: 1.7 }}>
              {book.description.length > 500 ? book.description.slice(0, 500) + '...' : book.description}
            </Text>
          )}

          <Box gap={12} mt={8}>
            <InfoRow label="Author" value={book.author} />
            {book.publisher && <InfoRow label="Publisher" value={book.publisher} />}
            {book.publishedDate && <InfoRow label="Published" value={formatDate(book.publishedDate)} />}
            {book.pageCount && <InfoRow label="Pages" value={book.pageCount.toString()} />}
            {book.language && <InfoRow label="Language" value={book.language.toUpperCase()} />}
            {book.isbn13 && <InfoRow label="ISBN-13" value={book.isbn13} />}
            {book.genres.length > 0 && (
              <Box gap={8}>
                <Text variant="bodySM" color="gray" style={{ fontWeight: '600' }}>Genres</Text>
                <Box flexDirection="row" flexWrap="wrap" gap={6}>
                  {book.genres.slice(0, 8).map((genre) => (
                    <Box key={genre} px={3} py={1} bg="primary-50" borderRadius={9999}>
                      <Text variant="caption" color="primary-700">{genre}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colorScheme = useColorScheme();
  return (
    <Box flexDirection="row" justifyContent="space-between" py={4}>
      <Text variant="bodySM" color="gray">{label}</Text>
      <Text variant="bodySM" style={{ fontWeight: '500', color: colorScheme === 'dark' ? '#fafafa' : '#111827' }}>
        {value}
      </Text>
    </Box>
  );
}