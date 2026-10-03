import { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import { useCallback, useRef } from 'react';

export const useFadeIn = (duration = 300, delay = 0) => {
  const opacity = useSharedValue(0);
  
  const start = useCallback(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
  }, [duration, delay]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  return { animatedStyle, start };
};

export const useFadeOut = (duration = 300) => {
  const opacity = useSharedValue(1);
  
  const start = useCallback(() => {
    opacity.value = withTiming(0, { duration, easing: Easing.in(Easing.cubic) });
  }, [duration]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  return { animatedStyle, start };
};

export const useSlideUp = (duration = 400, delay = 0, distance = 40) => {
  const translateY = useSharedValue(distance);
  const opacity = useSharedValue(0);
  
  const start = useCallback(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 150 }));
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [duration, delay]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  
  return { animatedStyle, start };
};

export const useSlideDown = (duration = 400, delay = 0, distance = 40) => {
  const translateY = useSharedValue(-distance);
  const opacity = useSharedValue(0);
  
  const start = useCallback(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 150 }));
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [duration, delay]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  
  return { animatedStyle, start };
};

export const useScaleIn = (duration = 300, delay = 0, fromScale = 0.9) => {
  const scale = useSharedValue(fromScale);
  const opacity = useSharedValue(0);
  
  const start = useCallback(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 20, stiffness: 150 }));
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [duration, delay]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  return { animatedStyle, start };
};

export const usePulse = (duration = 1000, minScale = 0.95, maxScale = 1.05) => {
  const scale = useSharedValue(1);
  
  const start = useCallback(() => {
    scale.value = withTiming(maxScale, { 
      duration: duration / 2, 
      easing: Easing.inOut(Easing.cubic) 
    }, () => {
      scale.value = withTiming(minScale, { 
        duration: duration / 2, 
        easing: Easing.inOut(Easing.cubic) 
      }, () => {
        runOnJS(start)();
      });
    });
  }, [duration, minScale, maxScale]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return { animatedStyle, start };
};

export const useShake = (duration = 500, distance = 10) => {
  const translateX = useSharedValue(0);
  const shakeCount = useRef(0);
  const maxShakes = 6;
  
  const start = useCallback(() => {
    shakeCount.current = 0;
    const shake = () => {
      if (shakeCount.current >= maxShakes) {
        translateX.value = withTiming(0, { duration: 100 });
        return;
      }
      
      const direction = shakeCount.current % 2 === 0 ? distance : -distance;
      translateX.value = withTiming(direction, { duration: duration / maxShakes }, () => {
        shakeCount.current++;
        runOnJS(shake)();
      });
    };
    shake();
  }, [duration, distance]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  return { animatedStyle, start };
};

export const useProgressRing = (progress: number, animated = true) => {
  const strokeDashoffset = useSharedValue(1);
  
  if (animated) {
    strokeDashoffset.value = withTiming(1 - progress, { duration: 500, easing: Easing.out(Easing.cubic) });
  } else {
    strokeDashoffset.value = 1 - progress;
  }
  
  return strokeDashoffset;
};

export const useCounter = (from: number, to: number, duration = 1000, delay = 0) => {
  const count = useSharedValue(from);
  
  const start = useCallback(() => {
    count.value = withDelay(delay, withTiming(to, { 
      duration, 
      easing: Easing.out(Easing.cubic) 
    }));
  }, [from, to, duration, delay]);
  
  return { count, start };
};

export const useParallax = (scrollY: any, speed = 0.5) => {
  const translateY = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    translateY.value = scrollY.value * speed;
    return { transform: [{ translateY: translateY.value }] };
  });
  
  return animatedStyle;
};

export const useTabTransition = (index: number, activeIndex: number) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = index === activeIndex;
    scale.value = isActive ? withSpring(1.1, { damping: 15, stiffness: 120 }) : withSpring(1, { damping: 15, stiffness: 120 });
    opacity.value = isActive ? 1 : 0.6;
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  return animatedStyle;
};

export const useListItemAnimation = (index: number, delay = 50) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  
  const start = useCallback(() => {
    opacity.value = withDelay(index * delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(index * delay, withSpring(0, { damping: 20, stiffness: 150 }));
  }, [index, delay]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  
  return { animatedStyle, start };
};

export const useSwipeToDismiss = (onDismiss: () => void, threshold = 100) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const onGestureEvent = useCallback((event: any) => {
    translateX.value = event.translationX;
    opacity.value = Math.max(0.3, 1 - Math.abs(event.translationX) / 300);
  }, []);
  
  const onHandlerStateChange = useCallback((event: any) => {
    if (event.state === 2) { // END
      if (Math.abs(event.translationX) > threshold) {
        translateX.value = withTiming(event.translationX > 0 ? 400 : -400, { duration: 200 }, () => {
          runOnJS(onDismiss)();
        });
        opacity.value = withTiming(0, { duration: 200 });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    }
  }, [threshold, onDismiss]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));
  
  return { animatedStyle, onGestureEvent, onHandlerStateChange };
};

export const usePullToRefresh = (onRefresh: () => Promise<void>, threshold = 80) => {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const progress = useSharedValue(0);
  
  const onGestureEvent = useCallback((event: any) => {
    if (isRefreshing.value) return;
    translateY.value = Math.max(0, event.translationY);
    progress.value = Math.min(1, translateY.value / threshold);
  }, [threshold]);
  
  const onHandlerStateChange = useCallback(async (event: any) => {
    if (isRefreshing.value) return;
    
    if (event.state === 2) { // END
      if (translateY.value > threshold) {
        isRefreshing.value = true;
        translateY.value = withTiming(threshold, { duration: 200 });
        progress.value = 1;
        
        try {
          await onRefresh();
        } finally {
          isRefreshing.value = false;
          translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
          progress.value = 0;
        }
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        progress.value = 0;
      }
    }
  }, [onRefresh, threshold]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  return { animatedStyle, progress, isRefreshing, onGestureEvent, onHandlerStateChange };
};

export const useModalAnimation = (isVisible: boolean) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(20);
  
  const animatedStyle = useAnimatedStyle(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 20, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
      translateY.value = withTiming(20, { duration: 150 });
    }
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });
  
  return animatedStyle;
};

export const useToastAnimation = (isVisible: boolean, position: 'top' | 'bottom' = 'bottom') => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(position === 'top' ? -100 : 100);
  const scale = useSharedValue(0.9);
  
  const animatedStyle = useAnimatedStyle(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
      scale.value = withSpring(1, { damping: 20, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(position === 'top' ? -100 : 100, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 150 });
    }
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });
  
  return animatedStyle;
};

export const useCarouselAnimation = (index: number, activeIndex: number, itemWidth: number) => {
  const translateX = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    translateX.value = (index - activeIndex) * itemWidth;
    return { transform: [{ translateX: translateX.value }] };
  });
  
  return animatedStyle;
};

export const useStaggeredAnimation = (items: number, baseDelay = 50, duration = 400) => {
  const animations = Array.from({ length: items }, (_, i) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    
    const start = useCallback(() => {
      opacity.value = withDelay(i * baseDelay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
      translateY.value = withDelay(i * baseDelay, withSpring(0, { damping: 20, stiffness: 150 }));
    }, [i, baseDelay, duration]);
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));
    
    return { animatedStyle, start };
  });
  
  return animations;
};