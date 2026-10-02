import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Box, Text, Button } from '../Box';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReaderStore } from '@/store/readerStore';
import { LucideIcon } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EpubReaderProps {
  bookId: string;
  bookPath: string;
  onProgressChange: (progress: number, chapterIndex: number, chapterProgress: number) => void;
  onChapterChange: (chapterIndex: number) => void;
}

export const EpubReader = React.memo<EpubReaderProps>(({ bookId, bookPath, onProgressChange, onChapterChange }) => {
  const colorScheme = useColorScheme();
  const { settings } = useReaderStore();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalChapters, setTotalChapters] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [theme, setTheme] = useState(settings.theme);
  const [margin, setMargin] = useState(settings.margin);
  const [lineHeight, setLineHeight] = useState(settings.lineHeight);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);

  const fontFamilies = {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "'Merriweather', Georgia, serif",
    mono: "'JetBrains Mono', monospace",
  };

  const getBackgroundColor = () => {
    switch (theme) {
      case 'dark': return '#0f0f1a';
      case 'sepia': return '#f4ecd8';
      case 'auto': return colorScheme === 'dark' ? '#0f0f1a' : '#ffffff';
      default: return '#ffffff';
    }
  };

  const getTextColor = () => {
    switch (theme) {
      case 'dark': return '#fafafa';
      case 'sepia': return '#433422';
      case 'auto': return colorScheme === 'dark' ? '#fafafa' : '#111827';
      default: return '#111827';
    }
  };

  const injectStyles = useCallback(() => {
    if (!webViewRef.current) return;

    const css = `
      body {
        font-family: ${fontFamilies[fontFamily]};
        font-size: ${fontSize}px;
        line-height: ${lineHeight};
        margin: ${margin}px;
        color: ${getTextColor()};
        background-color: ${getBackgroundColor()};
        transition: all 0.2s ease;
      }
      .epub-chapter {
        margin-bottom: ${margin * 2}px;
      }
      h1, h2, h3, h4, h5, h6 {
        color: ${getTextColor()};
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        line-height: 1.3;
      }
      p { margin: 0 0 1em; }
      a { color: #0ea5e9; text-decoration: none; }
      img { max-width: 100%; height: auto; }
      blockquote { border-left: 3px solid #0ea5e9; padding-left: 1em; color: ${getTextColor()}80; font-style: italic; }
      code { background: ${colorScheme === 'dark' ? '#252542' : '#f3f4f6'}; padding: 0.2em 0.4em; border-radius: 4px; font-family: ${fontFamilies.mono}; }
      pre { background: ${colorScheme === 'dark' ? '#1a1a2e' : '#f8f9fa'}; padding: 1em; border-radius: 8px; overflow-x: auto; }
    `;

    webViewRef.current.injectJavaScript(`
      (function() {
        var style = document.getElementById('epub-dynamic-styles');
        if (!style) {
          style = document.createElement('style');
          style.id = 'epub-dynamic-styles';
          document.head.appendChild(style);
        }
        style.textContent = ${JSON.stringify(css)};
      })();
    `);
  }, [fontSize, lineHeight, margin, fontFamily, theme, colorScheme]);

  useEffect(() => {
    injectStyles();
  }, [injectStyles]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'loaded':
          setTotalChapters(data.totalChapters || 0);
          setIsLoading(false);
          break;
        case 'progress':
          onProgressChange(data.progress, data.chapterIndex, data.chapterProgress);
          setCurrentChapter(data.chapterIndex);
          onChapterChange(data.chapterIndex);
          break;
        case 'chapterChange':
          setCurrentChapter(data.chapterIndex);
          onChapterChange(data.chapterIndex);
          break;
      }
    } catch (e) {
      console.warn('Failed to parse WebView message:', e);
    }
  }, [onProgressChange, onChapterChange]);

  const goToChapter = useCallback((chapterIndex: number) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'goToChapter', chapterIndex }));
  }, []);

  const goToPreviousChapter = useCallback(() => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'previousChapter' }));
  }, []);

  const goToNextChapter = useCallback(() => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'nextChapter' }));
  }, []);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LucideIcon name="book-open" size={48} color="primary-600" className="animate-spin" />
          <Text variant="bodyMD" color="gray" style={{ marginTop: 12 }}>Loading book...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: bookPath }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.bottomControls}>
        <Box px={16} py={12} gap={12}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <LucideIcon name="chevron-left" size={24} onPress={goToPreviousChapter} />
            <Box flex={1} alignItems="center" gap={4}>
              <Text variant="bodySM" style={{ fontWeight: '600' }}>
                Chapter {currentChapter + 1} of {totalChapters}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: totalChapters > 0 ? `${((currentChapter + 1) / totalChapters) * 100}%` : '0%' },
                  ]}
                />
              </View>
            </Box>
            <LucideIcon name="chevron-right" size={24} onPress={goToNextChapter} />
          </Box>
        </Box>
      </View>
    </View>
  );
});

EpubReader.displayName = 'EpubReader';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  progressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
});