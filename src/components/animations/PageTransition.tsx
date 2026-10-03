import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from 'react-native-reanimated';

interface PageTransitionProps {
  children: React.ReactNode;
  entering?: boolean;
  exiting?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  style?: ViewStyle;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'flip';
}

const transitions = {
  fade: (opacity: any) => ({ opacity }),
  slide: (translateX: any) => ({ transform: [{ translateX }] }),
  scale: (scale: any) => ({ transform: [{ scale }] }),
  slideUp: (translateY: any) => ({ transform: [{ translateY }] }),
  slideDown: (translateY: any) => ({ transform: [{ translateY }] }),
  flip: (rotateY: any) => ({ transform: [{ perspective: 1000 }, { rotateY }] }),
};

export const PageTransition = React.memo<PageTransitionProps>({
  children,
  entering = true,
  exiting = false,
  duration = 300,
  easing = Easing.out(Easing.cubic),
  style,
  type = 'fade',
}) => {
  const opacity = useSharedValue(entering ? 0 : 1);
  const translateX = useSharedValue(entering ? 50 : 0);
  const translateY = useSharedValue(entering ? 50 : 0);
  const scale = useSharedValue(entering ? 0.9 : 1);
  const rotateY = useSharedValue(entering ? 90 : 0);

  React.useEffect(() => {
    if (entering) {
      opacity.value = withTiming(1, { duration, easing });
      translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
      scale.value = withSpring(1, { damping: 20, stiffness: 150 });
      rotateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    } else if (exiting) {
      opacity.value = withTiming(0, { duration: duration / 2, easing });
      translateX.value = withTiming(-50, { duration: duration / 2, easing });
      translateY.value = withTiming(50, { duration: duration / 2, easing });
      scale.value = withTiming(0.9, { duration: duration / 2, easing });
      rotateY.value = withTiming(-90, { duration: duration / 2, easing });
    }
  }, [entering, exiting]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'fade':
        return transitions.fade(opacity);
      case 'slide':
        return transitions.slide(translateX);
      case 'scale':
        return transitions.scale(scale);
      case 'slideUp':
        return transitions.slideUp(translateY);
      case 'slideDown':
        return transitions.slideDown(translateY);
      case 'flip':
        return transitions.flip(rotateY);
      default:
        return transitions.fade(opacity);
    }
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

PageTransition.displayName = 'PageTransition';

export const SlideTransition = React.memo<{
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
}>({
  children,
  direction = 'right',
  distance = 50,
  duration = 300,
}) => {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? -distance : direction === 'down' ? distance : 0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration });
    translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

SlideTransition.displayName = 'SlideTransition';

export const ModalTransition = React.memo<{
  children: React.ReactNode;
  visible: boolean;
  onExitComplete?: () => void;
  type?: 'slideUp' | 'fade' | 'scale';
}>({
  children,
  visible,
  onExitComplete,
  type = 'slideUp',
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(visible ? 0 : 100);
  const scale = useSharedValue(visible ? 1 : 0.9);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
      scale.value = withSpring(1, { damping: 20, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(100, { duration: 200 }, (finished) => {
        if (finished) runOnJS(onExitComplete)();
      });
      scale.value = withTiming(0.9, { duration: 150 });
    }
  }, [visible, onExitComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.modalContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

ModalTransition.displayName = 'ModalTransition';

export const TabTransition = React.memo<{
  children: React.ReactNode;
  active: boolean;
  style?: ViewStyle;
}>({
  children,
  active,
  style,
}) => {
  const scale = useSharedValue(active ? 1.1 : 1);
  const opacity = useSharedValue(active ? 1 : 0.6);

  React.useEffect(() => {
    scale.value = withSpring(active ? 1.1 : 1, { damping: 15, stiffness: 120 });
    opacity.value = withTiming(active ? 1 : 0.6, { duration: 200 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

TabTransition.displayName = 'TabTransition';

export const ListItemTransition = React.memo<{
  children: React.ReactNode;
  index: number;
  delay?: number;
  duration?: number;
}>({
  children,
  index,
  delay = 50,
  duration = 400,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  React.useEffect(() => {
    opacity.value = withDelay(index * delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(index * delay, withSpring(0, { damping: 20, stiffness: 150 }));
  }, [index, delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

ListItemTransition.displayName = 'ListItemTransition';

export const StaggeredContainer = React.memo<{
  children: React.ReactNode;
  baseDelay?: number;
  duration?: number;
  direction?: 'vertical' | 'horizontal';
}>({
  children,
  baseDelay = 50,
  duration = 400,
  direction = 'vertical',
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={styles.container}>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child as React.ReactElement<any>, {
          index,
          delay: baseDelay,
          duration,
        });
      })}
    </View>
  );
});

StaggeredContainer.displayName = 'StaggeredContainer';

export const AnimatePresence = React.memo<{
  children: React.ReactNode;
  custom?: any;
  initial?: boolean;
  exitBeforeEnter?: boolean;
}>({
  children,
  custom,
  initial = true,
  exitBeforeEnter = true,
}) => {
  return <>{children}</>;
};

AnimatePresence.displayName = 'AnimatePresence';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
});

import { ViewStyle, runOnJS } from 'react-native';
import { withDelay } from 'react-native-reanimated';