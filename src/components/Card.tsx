import React from 'react';
import { ViewStyle, StyleProp, PressableProps, ImageStyle } from 'react-native';
import { Box, Text, Button } from './Box';
import { Image } from 'expo-image';

export interface CardProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
  onPress?: () => void;
}

const variantStyles: Record<CardProps['variant'], ViewStyle> = {
  default: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  elevated: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  outlined: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
};

export const Card = React.forwardRef<
  React.ComponentPropsWithoutRef<typeof Box>,
  CardProps
>(
  ({ children, style, variant = 'default', padding = 16, onPress, ...props }, ref) => {
    const Component = onPress ? 'Pressable' : Box;
    
    return (
      <Component
        ref={ref as any}
        style={[
          { borderRadius: 16, padding, overflow: 'hidden' },
          variantStyles[variant],
          style,
        ]}
        onPress={onPress}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    averageRating?: number;
    ratingsCount?: number;
    pageCount?: number;
    hasAudiobook?: boolean;
    hasSummary?: boolean;
    isFree?: boolean;
    price?: number;
  };
  onPress?: () => void;
  onLongPress?: () => void;
  showActions?: boolean;
  variant?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

export const BookCard = ({
  book,
  onPress,
  onLongPress,
  showActions = false,
  variant = 'vertical',
  style,
}: BookCardProps) => {
  const isHorizontal = variant === 'horizontal';
  const imageSize = isHorizontal ? 80 : 140;
  const imageAspectRatio = 1.5;

  return (
    <Card
      variant="default"
      padding={0}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ width: isHorizontal ? '100%' : imageSize, ...style }}
    >
      <Box
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: isHorizontal ? 3.5 : 1 / imageAspectRatio,
          overflow: 'hidden',
        }}
      >
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Box
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="headingLG" color="#9ca3af">📖</Text>
          </Box>
        )}
        
        {!book.isFree && book.price && (
          <Box
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#000',
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text variant="caption" color="#fff" style={{ fontWeight: '600' }}>
              ${book.price.toFixed(2)}
            </Text>
          </Box>
        )}
        
        {(book.hasAudiobook || book.hasSummary) && (
          <Box
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              flexDirection: 'row',
              gap: 4,
              paddingHorizontal: 4,
            }}
          >
            {book.hasAudiobook && (
              <Box
                style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text variant="caption" color="#fff">🎧</Text>
              </Box>
            )}
            {book.hasSummary && (
              <Box
                style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text variant="caption" color="#fff">📝</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      <Box style={{ padding: 12, gap: 6 }}>
        <Text variant="bodySM" style={{ fontWeight: '600', lineHeight: 1.4 }} numberOfLines={2}>
          {book.title}
        </Text>
        <Text variant="caption" color="#6b7280" numberOfLines={1}>
          {book.author}
        </Text>
        
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {book.averageRating && (
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text variant="caption" color="#f59e0b">★</Text>
              <Text variant="caption" color="#374151">{book.averageRating.toFixed(1)}</Text>
              {book.ratingsCount && (
                <Text variant="caption" color="#9ca3af">({formatNumber(book.ratingsCount)})</Text>
              )}
            </Box>
          )}
          
          {book.pageCount && (
            <Text variant="caption" color="#9ca3af">{book.pageCount} pages</Text>
          )}
        </Box>
        
        {showActions && (
          <Box style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button variant="primary" size="sm" fullWidth>
              Read
            </Button>
            {book.hasAudiobook && (
              <Button variant="outline" size="sm">
                Listen
              </Button>
            )}
            {book.hasSummary && (
              <Button variant="ghost" size="sm">
                Summary
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export interface SummaryCardProps {
  summary: {
    id: string;
    bookId: string;
    title: string;
    bookTitle: string;
    bookAuthor: string;
    bookCoverUrl?: string;
    type: 'text' | 'pdf' | 'audio';
    duration?: number;
    wordCount: number;
    keyTakeaways: string[];
    isPremium: boolean;
  };
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SummaryCard = ({ summary, onPress, style }: SummaryCardProps) => {
  const typeIcons = { text: '📝', pdf: '📄', audio: '🎧' };
  const typeLabels = { text: 'Text', pdf: 'PDF', audio: 'Audio' };

  return (
    <Card
      variant="default"
      padding={0}
      onPress={onPress}
      style={{ width: '100%', ...style }}
    >
      <Box style={{ flexDirection: 'row', overflow: 'hidden' }}>
        {summary.bookCoverUrl ? (
          <Image
            source={{ uri: summary.bookCoverUrl }}
            style={{ width: 100, height: '100%', resizeMode: 'cover' }}
            contentFit="cover"
          />
        ) : (
          <Box style={{ width: 100, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="headingLG">📖</Text>
          </Box>
        )}
        
        <Box style={{ flex: 1, padding: 12, gap: 6, justifyContent: 'center' }}>
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Box
              style={{
                backgroundColor: summary.isPremium ? '#fef3c7' : '#dcfce7',
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text variant="caption" color={summary.isPremium ? '#b45309' : '#166534'} style={{ fontWeight: '600' }}>
                {summary.isPremium ? 'Premium' : 'Free'}
              </Text>
            </Box>
            <Box
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text variant="caption" color="#374151">
                {typeIcons[summary.type]} {typeLabels[summary.type]}
              </Text>
            </Box>
          </Box>
          
          <Text variant="bodySM" style={{ fontWeight: '600', lineHeight: 1.4 }} numberOfLines={2}>
            {summary.title || summary.bookTitle}
          </Text>
          <Text variant="caption" color="#6b7280" numberOfLines={1}>
            by {summary.bookAuthor}
          </Text>
          
          <Box style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            {summary.duration && (
              <Text variant="caption" color="#9ca3af">🎧 {formatDuration(summary.duration)}</Text>
            )}
            {summary.wordCount && (
              <Text variant="caption" color="#9ca3af">📝 {formatNumber(summary.wordCount)} words</Text>
            )}
          </Box>
          
          {summary.keyTakeaways.length > 0 && (
            <Box style={{ marginTop: 4 }}>
              <Text variant="caption" color="#6b7280" numberOfLines={2}>
                {summary.keyTakeaways[0]}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
};