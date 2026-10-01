import React from 'react';
import { ScrollView, StyleProp, ViewStyle, RefreshControl, TextInput } from 'react-native';
import { Box, Text, Button, Input } from '@/components';
import { BookCard } from '@/components/Card';
import { useLibraryItems, useContinueReading, useDownloadedBooks, useWishlist } from '@/store/libraryStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { useSegmentedControl } from '@/hooks/useSegmentedControl';

const tabs = ['All', 'Reading', 'Downloaded', 'Wishlist', 'Finished'] as const;

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = React.useState(tabs[0]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const allItems = useLibraryItems();
  const continueReading = useContinueReading();
  const downloaded = useDownloadedBooks();
  const wishlist = useWishlist();

  const getFilteredItems = () => {
    let items: typeof allItems = [];
    
    switch (selectedTab) {
      case 'All':
        items = allItems;
        break;
      case 'Reading':
        items = allItems.filter(item => item.progress > 0 && item.progress < 1);
        break;
      case 'Downloaded':
        items = downloaded;
        break;
      case 'Wishlist':
        items = wishlist;
        break;
      case 'Finished':
        items = allItems.filter(item => item.progress >= 1);
        break;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.book.title.toLowerCase().includes(query) ||
        item.book.author.toLowerCase().includes(query)
      );
    }

    return items;
  };

  const items = getFilteredItems();

  if (allItems.length === 0) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" px={24} gap={16}>
        <Box p={4} bg="primary-100" borderRadius={9999}>
          <LucideIcon name="library" size={48} color="primary-600" />
        </Box>
        <Box alignItems="center" gap={8}>
          <Text variant="headingLG" style={{ fontWeight: '700', textAlign: 'center' }}>
            Your Library is Empty
          </Text>
          <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
            Start exploring and add books to your library
          </Text>
          <Button variant="primary" onPress={() => {}}>
            <LucideIcon name="search" size={18} />
            Browse Books
          </Button>
        </Box>
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
      <Box px={16} py={24} gap={16}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="headingXL" style={{ fontWeight: '800' }}>
            Library
          </Text>
          <Box flexDirection="row" gap={8}>
            <Button variant="ghost" size="sm">
              <LucideIcon name="filter" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <LucideIcon name="list" size={18} />
            </Button>
          </Box>
        </Box>

        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<LucideIcon name="search" size={20} color="gray" />}
        />

        <Box style={{ flexDirection: 'row', gap: 8 }} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={selectedTab === tab ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setSelectedTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </Box>
      </Box>

      {selectedTab === 'Reading' && continueReading.length > 0 && (
        <Box px={16} py={8} gap={12}>
          <Text variant="headingLG" style={{ fontWeight: '700' }}>
            Continue Reading
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
            {continueReading.slice(0, 5).map((item) => (
              <BookCard key={item.id} book={item.book} variant="vertical" />
            ))}
          </ScrollView>
        </Box>
      )}

      <Box px={16} gap={12}>
        {items.length === 0 ? (
          <Box py={48} alignItems="center" gap={8}>
            <LucideIcon name="search-x" size={48} color="gray" />
            <Text variant="bodyMD" color="gray">
              No books found
            </Text>
          </Box>
        ) : (
          <ScrollView
            horizontal={selectedTab === 'All'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 12,
              paddingHorizontal: 16,
              ...(selectedTab !== 'All' && { flexDirection: 'column' as const, paddingHorizontal: 0 }),
            }}
          >
            {items.map((item) => (
              <BookCard
                key={item.id}
                book={item.book}
                variant={selectedTab === 'All' ? 'vertical' : 'horizontal'}
                showActions={selectedTab !== 'All'}
              />
            ))}
          </ScrollView>
        )}
      </Box>
    </ScrollView>
  );
}