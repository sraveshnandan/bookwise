import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Box } from '../Box';
import { useShimmer } from '@/hooks/animations/useAnimations';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'book' | 'list-item';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

const variants = {
  text: { height: 16, borderRadius: 4 },
  circular: { aspectRatio: 1, borderRadius: 9999 },
  rectangular: { height: 120, borderRadius: 12 },
  card: { height: 200, borderRadius: 16 },
  book: { width: 100, height: 150, borderRadius: 12 },
  'list-item': { height: 80, borderRadius: 12 },
};

export const Skeleton = React.memo<React.PropsWithChildren<SkeletonProps>>(
  ({ width = '100%', height, borderRadius = 8, variant, animation = 'pulse', className, ...props }) => {
    const variantStyles = variant ? variants[variant] : {};
    const shimmer = useShimmer({ duration: 1500 });

    const containerStyle = {
      width,
      height: height || variantStyles.height,
      borderRadius: borderRadius || variantStyles.borderRadius,
      aspectRatio: variantStyles.aspectRatio,
      overflow: 'hidden',
      backgroundColor: '#e5e7eb',
      ...shimmer.animatedStyle,
    };

    return (
      <Animated.View style={[styles.container, containerStyle, shimmer.start && { opacity: 1 }]}>
        {animation === 'wave' && (
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ translateX: shimmer.animatedStyle.transform?.[0]?.translateX || 0 }],
              },
            ]}
          />
        )}
      </Animated.View>
    );
  }
);

Skeleton.displayName = 'Skeleton';

export const SkeletonText = React.memo<{ lines?: number; lineHeight?: number; width?: string | number }>(
  ({ lines = 3, lineHeight = 20, width = '100%' }) => {
    const shimmer = useShimmer({ duration: 1500 });

    return (
      <Box gap={8} style={{ width, opacity: shimmer.start ? 1 : 0 }}>
        {Array.from({ length: lines }, (_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.line,
              { width: i === lines - 1 ? '70%' : '100%', height: lineHeight },
              shimmer.animatedStyle,
            ]}
          />
        ))}
      </Box>
    );
  }
);

SkeletonText.displayName = 'SkeletonText';

export const SkeletonCard = React.memo<{ variant?: 'book' | 'summary' | 'default' }>(
  ({ variant = 'default' }) => {
    if (variant === 'book') {
      return (
        <Box w={120} gap={12}>
          <Skeleton variant="book" animation="wave" />
          <SkeletonText lines={2} width="100%" />
          <SkeletonText lines={1} width="60%" />
        </Box>
      );
    }

    if (variant === 'summary') {
      return (
        <Box flexDirection="row" gap={12} w="100%">
          <Skeleton variant="rectangular" w={100} h={150} />
          <Box flex={1} gap={8}>
            <SkeletonText lines={1} width="80%" />
            <SkeletonText lines={1} width="60%" />
            <SkeletonText lines={2} width="100%" />
            <Box flexDirection="row" gap={8}>
              <Skeleton variant="text" w={60} />
              <Skeleton variant="text" w={60} />
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box p={16} gap={12} bg="white" borderRadius={16} borderWidth={1} borderColor="#e5e7eb">
        <SkeletonText lines={1} width="60%" />
        <SkeletonText lines={3} width="100%" />
        <Box flexDirection="row" gap={8}>
          <Skeleton variant="text" w={80} />
          <Skeleton variant="text" w={80} />
        </Box>
      </Box>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonList = React.memo<{ count?: number; variant?: 'book' | 'summary' | 'default' }>(
  ({ count = 5, variant = 'default' }) => {
    const shimmer = useShimmer({ duration: 1500 });

    return (
      <Box gap={16} style={{ opacity: shimmer.start ? 1 : 0 }}>
        {Array.from({ length: count }, (_, i) => (
          <Animated.View key={i} style={shimmer.animatedStyle}>
            <SkeletonCard variant={variant} />
          </Animated.View>
        ))}
      </Box>
    );
  }
);

SkeletonList.displayName = 'SkeletonList';

export const SkeletonGrid = React.memo<{ columns?: number; rows?: number; variant?: 'book' | 'summary' }>(
  ({ columns = 2, rows = 3, variant = 'book' }) => {
    const shimmer = useShimmer({ duration: 1500 });

    return (
      <Box gap={16} style={{ flexDirection: 'row', flexWrap: 'wrap', opacity: shimmer.start ? 1 : 0 }}>
        {Array.from({ length: columns * rows }, (_, i) => (
          <Animated.View key={i} style={{ width: '48%', ...shimmer.animatedStyle }}>
            <SkeletonCard variant={variant} />
          </Animated.View>
        ))}
      </Box>
    );
  }
);

SkeletonGrid.displayName = 'SkeletonGrid';

export const SkeletonScreen = React.memo<{ variant: 'home' | 'library' | 'search' | 'profile' }>(
  ({ variant }) => {
    const shimmer = useShimmer({ duration: 1500 });

    if (variant === 'home') {
      return (
        <Box flex={1} px={16} py={24} gap={24} style={{ opacity: shimmer.start ? 1 : 0 }}>
          <Box flexDirection="row" justifyContent="space-between" gap={12}>
            <SkeletonText lines={1} width="60%" />
            <Skeleton variant="circular" w={44} h={44} />
          </Box>
          <SkeletonCard variant="book" />
          <SkeletonList count={3} variant="book" />
          <SkeletonCard variant="book" />
          <SkeletonList count={2} variant="book" />
        </Box>
      );
    }

    if (variant === 'library') {
      return (
        <Box flex={1} px={16} py={24} gap={24} style={{ opacity: shimmer.start ? 1 : 0 }}>
          <Box flexDirection="row" justifyContent="space-between" gap={12}>
            <SkeletonText lines={1} width="40%" />
            <Box flexDirection="row" gap={8}>
              <Skeleton variant="circular" w={44} h={44} />
              <Skeleton variant="circular" w={44} h={44} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" h={52} w="100%" />
          <Box flexDirection="row" gap={8}>
            <Skeleton variant="text" w={80} />
            <Skeleton variant="text" w={80} />
            <Skeleton variant="text" w={80} />
            <Skeleton variant="text" w={80} />
            <Skeleton variant="text" w={80} />
          </Box>
          <SkeletonList count={5} variant="book" />
        </Box>
      );
    }

    if (variant === 'search') {
      return (
        <Box flex={1} px={16} py={24} gap={24} style={{ opacity: shimmer.start ? 1 : 0 }}>
          <SkeletonText lines={1} width="30%" />
          <Box flexDirection="row" gap={8}>
            <Skeleton variant="rectangular" h={52} flex={1} />
            <Skeleton variant="circular" w={52} h={52} />
          </Box>
          <Skeleton variant="rectangular" h={52} w="100%" />
          <SkeletonList count={4} variant="book" />
        </Box>
      );
    }

    return (
      <Box flex={1} px={16} py={24} gap={24} style={{ opacity: shimmer.start ? 1 : 0 }}>
        <Box flexDirection="row" gap={16}>
          <Skeleton variant="circular" w={80} h={80} />
          <Box flex={1} gap={8}>
            <SkeletonText lines={1} width="50%" />
            <SkeletonText lines={1} width="70%" />
            <Skeleton variant="circular" w={44} h={44} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" h={52} w="100%" />
        <SkeletonList count={6} variant="default" />
      </Box>
    );
  }
);

SkeletonScreen.displayName = 'SkeletonScreen';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e7eb',
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  line: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});

import { Animated } from 'react-native';