import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleProp, ViewStyle, TextInput } from 'react-native';
import { Box, Text, Button, Input } from '@/components';
import { BookCard } from '@/components/Card';
import { useColorScheme } from '@/hooks/useColorScheme';
import { searchAllSources, SearchFilters } from '@/api';
import { useQuery, useDebouncedQuery } from '@tanstack/react-query';
import { LucideIcon } from 'lucide-react-native';

const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 
  'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
  'Science', 'Technology', 'Philosophy', 'Psychology', 'Health'
];

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const [query, setQuery] = React.useState('');
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = React.useState<'all' | 'book' | 'audiobook' | 'summary'>('all');
  const [showFilters, setShowFilters] = React.useState(false);

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', query, selectedGenres, selectedFormat],
    queryFn: () => searchAllSources({
      query,
      genres: selectedGenres,
      formats: selectedFormat === 'all' ? undefined : [selectedFormat],
      limit: 20,
    }),
    enabled: query.length >= 2 || selectedGenres.length > 0 || selectedFormat !== 'all',
    debounce: 300,
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedFormat('all');
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedFormat !== 'all';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <Box px={16} py={24} gap={16}>
          <Text variant="headingXL" style={{ fontWeight: '800' }}>
            Search
          </Text>

          <Box flexDirection="row" gap={8}>
            <Box flex={1}>
              <Input
                placeholder="Search books, authors, topics..."
                value={query}
                onChangeText={setQuery}
                leftIcon={<LucideIcon name="search" size={20} color="gray" />}
                rightIcon={query && (
                  <LucideIcon 
                    name="x" 
                    size={20} 
                    color="gray" 
                    onPress={() => setQuery('')}
                  />
                )}
                onSubmitEditing={() => {}}
              />
            </Box>
            <Button variant="outline" onPress={() => setShowFilters(!showFilters)}>
              <LucideIcon name={showFilters ? 'sliders-horizontal' : 'filter'} size={20} />
              {showFilters && hasActiveFilters && (
                <Box position="absolute" top={-4} right={-4} w={4} h={4} bg="red" borderRadius={9999} />
              )}
            </Button>
          </Box>

          {showFilters && (
            <Box gap={16} style={{ animation: 'slideDown 200ms ease-out' }}>
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text variant="headingSM" style={{ fontWeight: '600' }}>
                  Filters
                </Text>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onPress={clearFilters}>
                    Clear all
                  </Button>
                )}
              </Box>

              <Box gap={8}>
                <Text variant="bodySM" color="gray" style={{ fontWeight: '500' }}>
                  Format
                </Text>
                <Box flexDirection="row" gap={8} style={{ flexWrap: 'wrap' }}>
                  {(['all', 'book', 'audiobook', 'summary'] as const).map((format) => (
                    <Button
                      key={format}
                      variant={selectedFormat === format ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => setSelectedFormat(format)}
                    >
                      {format.charAt(0).toUpperCase() + format.slice(1)}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box gap={8}>
                <Text variant="bodySM" color="gray" style={{ fontWeight: '500' }}>
                  Genres
                </Text>
                <Box flexDirection="row" gap={8} style={{ flexWrap: 'wrap' }}>
                  {genres.map((genre) => (
                    <Button
                      key={genre}
                      variant={selectedGenres.includes(genre) ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {query.length < 2 && !hasActiveFilters && (
            <Box py={32} alignItems="center" gap={12}>
              <Box p={4} bg="primary-100" borderRadius={9999}>
                <LucideIcon name="search" size={48} color="primary-600" />
              </Box>
              <Box alignItems="center" gap={8} px={24}>
                <Text variant="headingLG" style={{ fontWeight: '700', textAlign: 'center' }}>
                  Discover Your Next Read
                </Text>
                <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
                  Search by title, author, or topic. Use filters to narrow down results.
                </Text>
              </Box>
              
              <Box gap={8} style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Bestsellers', 'New Releases', 'Free Books', 'Audiobooks'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onPress={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </Box>
          )}

          {isLoading && (
            <Box py={32} alignItems="center" gap={8}>
              <LucideIcon name="loader" size={24} color="primary-600" className="animate-spin" />
              <Text variant="bodyMD" color="gray">Searching...</Text>
            </Box>
          )}

          {isError && (
            <Box py={32} alignItems="center" gap={8}>
              <LucideIcon name="alert-circle" size={48} color="red" />
              <Text variant="headingSM" style={{ fontWeight: '600' }}>Something went wrong</Text>
              <Text variant="bodySM" color="gray">Please try again</Text>
              <Button variant="primary" size="sm" onPress={() => {}}>
                Retry
              </Button>
            </Box>
          )}

          {results && !isLoading && query.length >= 2 && (
            <Box gap={16}>
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text variant="headingLG" style={{ fontWeight: '700' }}>
                  Results ({results.total})
                </Text>
                <Button variant="ghost" size="sm">
                  <LucideIcon name="list" size={18} />
                  Sort
                </Button>
              </Box>

              {results.books.length === 0 ? (
                <Box py={32} alignItems="center" gap={8}>
                  <LucideIcon name="search-x" size={48} color="gray" />
                  <Text variant="headingSM" style={{ fontWeight: '600' }}>No results found</Text>
                  <Text variant="bodySM" color="gray">
                    Try adjusting your search or filters
                  </Text>
                </Box>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
                  {results.books.map((book) => (
                    <BookCard key={book.id} book={book} variant="vertical" />
                  ))}
                </ScrollView>
              )}
            </Box>
          )}
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}