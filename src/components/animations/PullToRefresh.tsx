import React, { useCallback } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, Animated, Easing } from 'react-native';
import { Box } from '../Box';
import { LucideIcon } from 'lucide-react-native';
import { usePullToRefresh, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  refreshIndicator?: React.ReactNode;
  refreshing?: boolean;
  progressBackgroundColor?: string;
  progressColor?: string;
}

const DEFAULT_INDICATOR = (
  <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8}>
    <LucideIcon name="rotate-ccw" size={20} color="primary-600" className="animate-spin" />
    <Box>
      <Text variant="caption" color="gray">Pull to refresh</Text>
    </Box>
  </Box>
);

export const PullToRefresh = React.memo<PullToRefreshProps>({
  onRefresh,
  children,
  threshold = 80,
  refreshIndicator,
  refreshing: externalRefreshing,
  progressBackgroundColor = '#f3f4f6',
  progressColor = '#0ea5e9',
}) => {
  const progress = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const translateY = useSharedValue(0);
  const indicatorRotation = useSharedValue(0);

  const onGestureEvent = useCallback((event: any) => {
    if (isRefreshing.value) return;
    const pullDistance = Math.max(0, event.nativeEvent.translationY);
    translateY.value = pullDistance;
    progress.value = Math.min(1, pullDistance / threshold);
    indicatorRotation.value = pullDistance / 2;
  }, [threshold]);

  const onHandlerStateChange = useCallback(async (event: any) => {
    if (isRefreshing.value) return;

    if (event.nativeEvent.state === 2) { // END
      if (translateY.value > threshold) {
        isRefreshing.value = true;
        translateY.value = withTiming(threshold, { duration: 200 });
        progress.value = withTiming(1, { duration: 200 });

        try {
          await onRefresh();
        } finally {
          isRefreshing.value = false;
          translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
          progress.value = withTiming(0, { duration: 200 });
        }
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        progress.value = withTiming(0, { duration: 200 });
      }
    }
  }, [onRefresh, threshold]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${indicatorRotation.value}deg` }],
    opacity: progress.value,
  }));

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={externalRefreshing || isRefreshing.value}
          onRefresh={onRefresh}
          progressViewOffset={threshold}
          colors={['#0ea5e9']}
          progressBackgroundColor={progressBackgroundColor}
        />
      }
      onScroll={onGestureEvent}
      onMomentumScrollEnd={onHandlerStateChange}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Animated.View
        style={[
          styles.indicatorContainer,
          { transform: [{ translateY: translateY.value }] },
        ]}
      >
        <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8} p={12}>
          <Animated.View style={[{ transform: [{ rotate: `${indicatorRotation.value}deg` }] }, indicatorStyle]}>
            {refreshIndicator || DEFAULT_INDICATOR}
          </Animated.View>
          
          <Animated.View style={[
            styles.progressTrack,
            { backgroundColor: progressBackgroundColor },
          ]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: progressColor },
                progressBarStyle,
              ]}
            />
          </Animated.View>
        </Box>
      </Animated.View>
      
      {children}
    </ScrollView>
  );
});

PullToRefresh.displayName = 'PullToRefresh';

const styles = StyleSheet.create({
  indicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});