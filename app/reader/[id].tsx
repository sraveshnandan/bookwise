import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { Box, Text, Button, Input } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReaderStore } from '@/store/readerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { formatDuration } from '@/utils/formatters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReaderScreen() {
  const router = useRouter();
  const { id, format } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { settings, updateReadingProgress, setCurrentBook, setReaderOpen } = useReaderStore();
  const { updateProgress } = useLibraryStore();

  const bookId = id as string;
  const bookFormat = (format as 'epub' | 'pdf') || 'epub';

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [theme, setTheme] = useState(settings.theme);
  const [margin, setMargin] = useState(settings.margin);
  const [lineHeight, setLineHeight] = useState(settings.lineHeight);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);

  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setCurrentBook(bookId, bookFormat);
    setReaderOpen(true);
    loadBook();
    return () => {
      setReaderOpen(false);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [bookId]);

  const loadBook = async () => {
    setTotalChapters(15);
    setCurrentChapter(0);
    setProgress(0);
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
    if (isControlsVisible && hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  };

  const handleTap = (locationX: number) => {
    const leftZone = SCREEN_WIDTH * 0.3;
    const rightZone = SCREEN_WIDTH * 0.7;

    if (locationX < leftZone) {
      goToPreviousChapter();
    } else if (locationX > rightZone) {
      goToNextChapter();
    } else {
      toggleControls();
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
      setProgress(prev => Math.max(0, prev - 100 / totalChapters));
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < totalChapters - 1) {
      setCurrentChapter(prev => prev + 1);
      setProgress(prev => Math.min(100, prev + 100 / totalChapters));
    }
  };

  const handleProgressChange = (value: number) => {
    const chapterIndex = Math.floor((value / 100) * totalChapters);
    setProgress(value);
    setCurrentChapter(Math.min(chapterIndex, totalChapters - 1));
  };

  const handleProgressComplete = (value: number) => {
    const chapterIndex = Math.floor((value / 100) * totalChapters);
    updateProgress(bookId, {
      chapterIndex,
      chapterProgress: (value / 100) * 100 - chapterIndex * (100 / totalChapters),
      timestamp: Date.now(),
    });
    updateReadingProgress(bookId, value);
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

  const fontFamilies = {
    sans: 'Inter',
    serif: 'Merriweather',
    mono: 'JetBrains Mono',
  };

  const chapterContent = `
    Chapter ${currentChapter + 1}

    ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20)}

    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

    ${'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. '.repeat(10)}

    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  `;

  return (
    <View style={styles.container} onTouchStart={({ locationX }) => handleTap(locationX)}>
      <View
        style={[
          styles.readerContainer,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        {bookFormat === 'epub' ? (
          <View style={[styles.epubContent, { paddingHorizontal: margin, paddingVertical: margin }]}>
            <Text
              style={[
                styles.epubText,
                {
                  fontSize,
                  lineHeight: fontSize * lineHeight,
                  fontFamily: fontFamilies[fontFamily],
                  color: getTextColor(),
                },
              ]}
            >
              {chapterContent}
            </Text>
          </View>
        ) : (
          <View style={styles.pdfPlaceholder}>
            <LucideIcon name="file-text" size={64} color="gray" />
            <Text variant="headingMD" color="gray" style={{ marginTop: 16 }}>
              PDF Reader
            </Text>
            <Text variant="bodyMD" color="gray" style={{ marginTop: 8, textAlign: 'center' }}>
              PDF rendering with react-native-pdf
            </Text>
          </View>
        )}

        {isControlsVisible && (
          <View style={styles.topBar}>
            <Box px={16} py={12} flexDirection="row" alignItems="center" justifyContent="space-between">
              <LucideIcon name="chevron-left" size={24} onPress={() => router.back()} />
              <Box flex={1} alignItems="center" gap={4}>
                <Text variant="bodySM" style={{ fontWeight: '600', color: getTextColor() }}>
                  {bookId}
                </Text>
                <Text variant="caption" color="gray">
                  Chapter {currentChapter + 1} of {totalChapters}
                </Text>
              </Box>
              <Box flexDirection="row" gap={8}>
                <LucideIcon name="list" size={24} color={getTextColor()} onPress={() => setShowTOC(true)} />
                <LucideIcon name="settings" size={24} color={getTextColor()} onPress={() => setShowSettings(true)} />
              </Box>
            </Box>
          </View>
        )}

        {isControlsVisible && (
          <View style={styles.bottomBar}>
            <Box px={16} py={12} gap={12}>
              <Box flexDirection="row" alignItems="center" gap={12}>
                <LucideIcon name="skip-back" size={24} color={getTextColor()} onPress={goToPreviousChapter} />
                <Box flex={1}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: 'primary-500' },
                      ]}
                    />
                    <View
                      style={[
                        styles.progressThumb,
                        { left: `${progress}%`, backgroundColor: getBackgroundColor() },
                      ]}
                    />
                  </View>
                </Box>
                <LucideIcon name="skip-forward" size={24} color={getTextColor()} onPress={goToNextChapter} />
              </Box>
              <Text variant="caption" color="gray" style={{ textAlign: 'center' }}>
                {Math.round(progress)}% • Ch. {currentChapter + 1}
              </Text>
            </Box>
          </View>
        )}
      </View>

      {showSettings && (
        <ReaderSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          theme={theme}
          onThemeChange={setTheme}
          margin={margin}
          onMarginChange={setMargin}
          lineHeight={lineHeight}
          onLineHeightChange={setLineHeight}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          colorScheme={colorScheme}
        />
      )}

      {showTOC && (
        <TOCModal
          visible={showTOC}
          onClose={() => setShowTOC(false)}
          currentChapter={currentChapter}
          totalChapters={totalChapters}
          onChapterSelect={setCurrentChapter}
          colorScheme={colorScheme}
        />
      )}
    </View>
  );
}

function ReaderSettingsModal({
  visible,
  onClose,
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
  margin,
  onMarginChange,
  lineHeight,
  onLineHeightChange,
  fontFamily,
  onFontFamilyChange,
  colorScheme,
}: any) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay} onTouchStart={onClose}>
      <View style={styles.modalContent}>
        <Box px={20} py={16} flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="gray-200">
          <Text variant="headingMD" style={{ fontWeight: '700' }}>Reading Settings</Text>
          <LucideIcon name="x" size={24} onPress={onClose} />
        </Box>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
          <Box gap={12}>
            <Text variant="headingSM" style={{ fontWeight: '600' }}>Font Size</Text>
            <Box flexDirection="row" alignItems="center" gap={16}>
              <LucideIcon name="minus" size={24} onPress={() => onFontSizeChange(Math.max(10, fontSize - 1))} />
              <Text variant="headingLG" style={{ fontWeight: '700', minWidth: 50, textAlign: 'center' }}>
                {fontSize}
              </Text>
              <LucideIcon name="plus" size={24} onPress={() => onFontSizeChange(Math.min(30, fontSize + 1))} />
            </Box>
          </Box>

          <Box gap={12}>
            <Text variant="headingSM" style={{ fontWeight: '600' }}>Theme</Text>
            <Box flexDirection="row" gap={8}>
              {(['light', 'dark', 'sepia', 'auto'] as const).map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => onThemeChange(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </Box>
          </Box>

          <Box gap={12}>
            <Text variant="headingSM" style={{ fontWeight: '600' }}>Font Family</Text>
            <Box flexDirection="row" gap={8} style={{ flexWrap: 'wrap' }}>
              {(['sans', 'serif', 'mono'] as const).map((f) => (
                <Button
                  key={f}
                  variant={fontFamily === f ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => onFontFamilyChange(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </Box>
          </Box>

          <Box gap={12}>
            <Text variant="headingSM" style={{ fontWeight: '600' }}>Margins</Text>
            <Box flexDirection="row" alignItems="center" gap={16}>
              <LucideIcon name="minus" size={24} onPress={() => onMarginChange(Math.max(10, margin - 4))} />
              <Text variant="headingLG" style={{ fontWeight: '700', minWidth: 50, textAlign: 'center' }}>
                {margin}
              </Text>
              <LucideIcon name="plus" size={24} onPress={() => onMarginChange(Math.min(50, margin + 4))} />
            </Box>
          </Box>

          <Box gap={12}>
            <Text variant="headingSM" style={{ fontWeight: '600' }}>Line Height</Text>
            <Box flexDirection="row" alignItems="center" gap={16}>
              <LucideIcon name="minus" size={24} onPress={() => onLineHeightChange(Math.max(1.2, lineHeight - 0.1))} />
              <Text variant="headingLG" style={{ fontWeight: '700', minWidth: 50, textAlign: 'center' }}>
                {lineHeight.toFixed(1)}
              </Text>
              <LucideIcon name="plus" size={24} onPress={() => onLineHeightChange(Math.min(2.0, lineHeight + 0.1))} />
            </Box>
          </Box>
        </ScrollView>
      </View>
    </View>
  );
}

function TOCModal({
  visible,
  onClose,
  currentChapter,
  totalChapters,
  onChapterSelect,
  colorScheme,
}: any) {
  if (!visible) return null;

  const chapters = Array.from({ length: totalChapters }, (_, i) => ({
    index: i,
    title: `Chapter ${i + 1}`,
  }));

  return (
    <View style={styles.modalOverlay} onTouchStart={onClose}>
      <View style={styles.modalContent}>
        <Box px={20} py={16} flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="gray-200">
          <Text variant="headingMD" style={{ fontWeight: '700' }}>Table of Contents</Text>
          <LucideIcon name="x" size={24} onPress={onClose} />
        </Box>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
          {chapters.map((chapter) => (
            <Box
              key={chapter.index}
              px={16}
              py={12}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              bg={chapter.index === currentChapter ? 'primary-100' : 'transparent'}
              borderRadius={8}
              onPress={() => {
                onChapterSelect(chapter.index);
                onClose();
              }}
            >
              <Text
                variant="bodyMD"
                style={{
                  fontWeight: chapter.index === currentChapter ? '600' : '400',
                  color: chapter.index === currentChapter ? 'primary-700' : undefined,
                }}
              >
                {chapter.title}
              </Text>
              {chapter.index === currentChapter && (
                <LucideIcon name="bookmark" size={20} color="primary-600" fill="currentColor" />
              )}
            </Box>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  readerContainer: {
    flex: 1,
  },
  epubContent: {
    flex: 1,
  },
  epubText: {
    textAlign: 'justify',
  },
  pdfPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'primary-500',
    transform: [{ translateX: -8 }],
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    width: '100%',
  },
});