import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableOpacityProps, Text, TextStyle, Animated } from 'react-native';
import { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withTiming, withSpring, Easing, runOnJS } from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Box } from '../Box';

interface PressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scaleOnPress?: number;
  scaleOnHover?: number;
  duration?: number;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
}

export const Pressable = React.memo<PressableProps>({
  children,
  style,
  scaleOnPress = 0.96,
  scaleOnHover = 1.02,
  duration = 100,
  hapticFeedback = 'light',
  onPress,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback !== 'none') {
      const Haptics = require('expo-haptics').default;
      const impactMap = { light: 'impactLight', medium: 'impactMedium', heavy: 'impactHeavy' };
      Haptics[impactMap[hapticFeedback]]();
    }
  }, [hapticFeedback]);

  const handlePressIn = useCallback((event: any) => {
    scale.value = withTiming(scaleOnPress, { duration, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(0.8, { duration });
    triggerHaptic();
    onPressIn?.(event);
  }, [scaleOnPress, duration, triggerHaptic, onPressIn]);

  const handlePressOut = useCallback((event: any) => {
    scale.value = withSpring(1, { damping: 20, stiffness: 150 });
    opacity.value = withTiming(1, { duration });
    onPressOut?.(event);
  }, [onPressOut]);

  const handlePress = useCallback((event: any) => {
    onPress?.(event);
  }, [onPress]);

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle]}
      activeOpacity={1}
    >
      {children}
    </TouchableOpacity>
  );
};

Pressable.displayName = 'Pressable';

interface LongPressableProps extends PressableProps {
  onLongPress?: () => void;
  longPressDuration?: number;
  longPressScale?: number;
}

export const LongPressable = React.memo<LongPressableProps>({
  children,
  style,
  onLongPress,
  longPressDuration = 500,
  longPressScale = 0.92,
  scaleOnPress = 0.96,
  ...props
}) => {
  const scale = useSharedValue(1);
  const longPressTriggered = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    longPressTriggered.current = false;
    scale.value = withTiming(scaleOnPress, { duration: 100 });
    
    setTimeout(() => {
      if (!longPressTriggered.current) {
        longPressTriggered.current = true;
        scale.value = withSpring(longPressScale, { damping: 15, stiffness: 100 });
        runOnJS(onLongPress)();
      }
    }, longPressDuration);
  }, [scaleOnPress, longPressDuration, longPressScale, onLongPress]);

  const handlePressOut = useCallback(() => {
    if (!longPressTriggered.current) {
      scale.value = withSpring(1, { damping: 20, stiffness: 150 });
    } else {
      scale.value = withSpring(1, { damping: 20, stiffness: 150 });
    }
  }, []);

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
      activeOpacity={1}
    >
      {children}
    </TouchableOpacity>
  );
});

LongPressable.displayName = 'LongPressable';

interface SwipeableProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  friction?: number;
  style?: ViewStyle;
}

interface SwipeAction {
  label: string;
  icon?: React.ReactNode;
  backgroundColor: string;
  color?: string;
  onPress: () => void;
  width?: number;
}

export const Swipeable = React.memo<SwipeableProps>({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  friction = 3,
  style,
}) => {
  const translateX = useSharedValue(0);
  const actionWidth = useSharedValue(0);

  const leftWidth = leftActions.reduce((sum, a) => sum + (a.width || 80), 0);
  const rightWidth = rightActions.reduce((sum, a) => sum + (a.width || 80), 0);
  const maxWidth = Math.max(leftWidth, rightWidth);

  const panGesture = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event) => {
      const velocity = event.velocityX;
      const shouldOpen = Math.abs(translateX.value) > threshold || Math.abs(velocity) > 500;
      
      if (shouldOpen) {
        if (translateX.value > 0 && leftActions.length > 0) {
          translateX.value = withSpring(leftWidth, { damping: 20, stiffness: 150 });
          actionWidth.value = leftWidth;
        } else if (translateX.value < 0 && rightActions.length > 0) {
          translateX.value = withSpring(-rightWidth, { damping: 20, stiffness: 150 });
          actionWidth.value = rightWidth;
        }
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
        actionWidth.value = 0;
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderActions = (actions: SwipeAction[], isLeft: boolean) => (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent={isLeft ? 'flex-start' : 'flex-end'}
      style={{ position: 'absolute', top: 0, bottom: 0, [isLeft ? 'left' : 'right']: 0, width: actionWidth }}
    >
      {actions.map((action, i) => (
        <TouchableOpacity
          key={i}
          onPress={action.onPress}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: action.backgroundColor,
            minWidth: action.width || 80,
          }}
        >
          {action.icon}
          <Text variant="caption" color={action.color || '#fff'} style={{ fontWeight: '600', marginTop: 4 }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Box>
  );

  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View style={[style, animatedStyle]}>
          {translateX.value > 0 && leftActions.length > 0 && (
            renderActions(leftActions, true)
          )}
          {translateX.value < 0 && rightActions.length > 0 && (
            renderActions(rightActions, false)
          )}
          {children}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
});

Swipeable.displayName = 'Swipeable';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  label?: string;
  expanded?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  style?: ViewStyle;
}

export const FloatingActionButton = React.memo<FloatingActionButtonProps>({
  onPress,
  icon,
  label,
  expanded = false,
  position = 'bottom-right',
  style,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const labelOpacity = useSharedValue(0);
  const labelTranslateX = useSharedValue(expanded ? 0 : 20);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateX: labelTranslateX.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.9, { duration: 100 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 150 });
  }, []);

  const handlePress = useCallback(() => {
    onPress();
    rotation.value = withTiming(rotation.value + 90, { duration: 200 });
  }, [onPress]);

  const positionStyles = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 },
  };

  return (
    <View style={[styles.fabContainer, positionStyles[position], style]}>
      {label && (
        <Animated.View style={[styles.fabLabel, labelStyle]}>
          <Box bg="white" borderRadius={8} px={12} py={6} shadow="md">
            <Text variant="bodySM" style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>
              {label}
            </Text>
          </Box>
        </Animated.View>
      )}
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.fab, animatedStyle]}
        activeOpacity={1}
      >
        {icon}
      </TouchableOpacity>
    </View>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

interface ProgressButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  progress?: number;
  loading?: boolean;
  style?: ViewStyle;
  showProgressRing?: boolean;
}

export const ProgressButton = React.memo<ProgressButtonProps>({
  children,
  progress = 0,
  loading = false,
  style,
  showProgressRing = true,
  disabled,
  ...props
}) => {
  const ringProgress = useSharedValue(progress);
  const isLoading = useSharedValue(loading);

  React.useEffect(() => {
    ringProgress.value = withTiming(progress, { duration: 500, easing: Easing.out(Easing.cubic) });
    isLoading.value = loading;
  }, [progress, loading]);

  const ringStyle = useAnimatedStyle(() => ({
    strokeDashoffset: 1 - ringProgress.value,
  }));

  const spinnerRotation = useSharedValue(0);
  React.useEffect(() => {
    if (loading) {
      spinnerRotation.value = withTiming(360, { duration: 1000, easing: Easing.linear }, () => {
        spinnerRotation.value = 0;
        runOnJS(() => { if (loading) spinnerRotation.value = withTiming(360, { duration: 1000, easing: Easing.linear }); })();
      });
    }
  }, [loading]);

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      style={[style, { opacity: loading ? 0.7 : 1 }]}
      activeOpacity={0.85}
    >
      {showProgressRing && (
        <Animated.View style={styles.progressRingContainer}>
          <Animated.View
            style={[
              styles.progressRing,
              { transform: [{ rotate: `${-90}deg` }] },
            ]}
          >
            <Animated.View
              style={[
                styles.progressRingTrack,
                { strokeDashoffset: 1 - ringProgress.value },
              ]}
            />
          </Animated.View>
          {loading && (
            <Animated.View
              style={[
                styles.progressRingSpinner,
                { transform: [{ rotate: `${spinnerRotation.value}deg` }] },
              ]}
            />
          )}
        </Animated.View>
      )}
      <Box flexDirection="row" alignItems="center" justifyContent="center" style={{ marginLeft: showProgressRing ? -44 : 0 }}>
        {children}
      </Box>
    </TouchableOpacity>
  );
});

ProgressButton.displayName = 'ProgressButton';

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabLabel: {
    position: 'absolute',
    right: 72,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressRingContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  progressRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#e5e7eb',
    position: 'absolute',
  },
  progressRingTrack: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#0ea5e9',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
  },
  progressRingSpinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#0ea5e9',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    animation: 'spin 1s linear infinite',
  },
});

import { ViewStyle, runOnJS } from 'react-native';