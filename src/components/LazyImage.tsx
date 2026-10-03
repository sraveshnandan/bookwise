import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, ImageStyle, ActivityIndicator, Platform, Animated } from 'react-native';
import { Box, Text } from '../Box';
import { imageCacheService } from '@/services/imageCacheService';

interface LazyImageProps {
  source: string | { uri: string };
  style?: ImageStyle;
  placeholder?: React.ReactNode;
  fadeDuration?: number;
  onLoad?: () => void;
  onError?: () => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  blurRadius?: number;
  accessibilityLabel?: string;
}

export const LazyImage = React.memo<LazyImageProps>({
  source,
  style,
  placeholder,
  fadeDuration = 300,
  onLoad,
  onError,
  resizeMode = 'cover',
  blurRadius = 0,
  accessibilityLabel,
}) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [opacity, setOpacity] = useState(0);

  const uri = typeof source === 'string' ? source : source.uri;

  const loadImage = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      
      const cachedPath = await imageCacheService.get(uri);
      if (cachedPath) {
        setImageSource(cachedPath);
      } else {
        const downloadedPath = await imageCacheService.downloadAndCache(uri);
        if (downloadedPath) {
          setImageSource(downloadedPath);
        } else {
          setImageSource(uri);
        }
      }
      
      setOpacity(1);
      setLoading(false);
      onLoad?.();
    } catch (err) {
      console.error('Error loading image:', err);
      setError(true);
      setLoading(false);
      onError?.();
    }
  }, [uri, onLoad, onError]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  if (error) {
    return (
      <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel}>
        {placeholder || (
          <Box 
            style={styles.placeholder} 
            alignItems="center" 
            justifyContent="center"
            bg="gray-100"
          >
            <Text variant="bodySM" color="gray">Failed to load</Text>
          </Box>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel}>
      {placeholder && loading && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {placeholder}
        </View>
      )}
      
      <Animated.Image
        source={imageSource ? { uri: Platform.OS === 'ios' ? `file://${imageSource}` : imageSource } : { uri }}
        style={[
          styles.image,
          { opacity },
          style,
        ]}
        resizeMode={resizeMode}
        blurRadius={blurRadius}
        onLoadEnd={() => {
          setOpacity(1);
          setLoading(false);
        }}
        onError={onError}
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
      />
      
      {loading && blurRadius > 0 && (
        <View style={StyleSheet.absoluteFill}>
          <ActivityIndicator size="small" color="gray" />
        </View>
      )}
    </View>
  );
});

LazyImage.displayName = 'LazyImage';

export const ImageGallery = React.memo<{
  images: string[];
  style?: ViewStyle;
  onPress?: (index: number) => void;
  showIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}>({
  images,
  style,
  onPress,
  showIndicators = true,
  autoPlay = false,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const fadeDuration = 300;

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setOpacity(1);
      }, fadeDuration / 2);
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [images, autoPlay, autoPlayInterval]);

  return (
    <View style={[styles.gallery, style]}>
      <Animated.View
        style={[
          styles.galleryImage,
          { opacity },
        ]}
      >
        {images.map((uri, index) => (
          <LazyImage
            key={index}
            source={uri}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            opacity={index === currentIndex ? opacity : 0}
          />
        ))}
      </Animated.View>
      
      {showIndicators && images.length > 1 && (
        <View style={styles.indicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex ? styles.indicatorActive : {},
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

ImageGallery.displayName = 'ImageGallery';

import { Animated } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gallery: {
    position: 'relative',
    overflow: 'hidden',
  },
  galleryImage: {
    ...StyleSheet.absoluteFillObject,
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
});