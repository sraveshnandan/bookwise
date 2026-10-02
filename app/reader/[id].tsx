import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReaderStore } from '@/store/readerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { formatDuration } from '@/utils/formatters';
import { EpubReader, PdfReader } from '@/components/reader';
import * as FileSystem from 'expo-file-system';
import { STORAGE_PATHS, getBookPath } from '@/utils/storage';

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
  const [localProgress, setLocalProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [bookPath, setBookPath] = useState<string | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const hideControlsTimeout = React.useRef<NodeJS.Timeout>();

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
    setIsLoadingBook(true);
    try {
      const localPath = getBookPath(bookId, bookFormat);
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      
      if (fileInfo.exists) {
        setBookPath(`file://${localPath}`);
        setIsLoadingBook(false);
      } else {
        // Download the book
        await downloadBook(bookId, bookFormat);
      }
    } catch (error) {
      console.error('Error loading book:', error);
      Alert.alert('Error', 'Failed to load book');
      setIsLoadingBook(false);
    }
  };

  const downloadBook = async (bookId: string, format: 'epub' | 'pdf') => {
    // In a real app, this would fetch from your backend
    // For now, we'll use a placeholder
    const downloadUrl = `https://example.com/books/${bookId}.${format}`;
    const localPath = getBookPath(bookId, format);
    
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );
      
      const result = await downloadResumable.downloadAsync();
      if (result) {
        setBookPath(`file://${result.uri}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', 'Could not download the book for offline reading');
    } finally {
      setIsLoadingBook(false);
    }
  };

  const handleProgressChange = useCallback((progress: number, chapterIndex: number, chapterProgress: number) => {
    setLocalProgress(progress);
    setCurrentChapter(chapterIndex);
    updateProgress(bookId, {
      chapterIndex,
      chapterProgress,
      timestamp: Date.now(),
    });
    updateReadingProgress(bookId, progress);
  }, [bookId, updateProgress, updateReadingProgress]);

  const handleChapterChange = useCallback((chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
  }, []);

  const handlePageChange = useCallback((pageNumber: number) => {
    // For PDF, progress is page-based
    if (totalChapters > 0) {
      const progress = pageNumber / totalChapters;
      setLocalProgress(progress);
      updateProgress(bookId, {
        chapterIndex: pageNumber - 1,
        chapterProgress: 0,
        pageNumber,
        timestamp: Date.now(),
      });
      updateReadingProgress(bookId, progress);
    }
  }, [bookId, totalChapters, updateProgress, updateReadingProgress]);

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
    if (isControlsVisible && hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  };

  const goToPreviousChapter = () => {
    // Handled by the reader components
  };

  const goToNextChapter = () => {
    // Handled by the reader components
  };

  const getBackgroundColor = () => {
    switch (settings.theme) {
      case 'dark': return '#0f0f1a';
      case 'sepia': return '#f4ecd8';
      case 'auto': return colorScheme === 'dark' ? '#0f0f1a' : '#ffffff';
      default: return '#ffffff';
    }
  };

  const getTextColor = () => {
    switch (settings.theme) {
      case 'dark': return '#fafafa';
      case 'sepia': return '#433422';
      case 'auto': return colorScheme === 'dark' ? '#fafafa' : '#111827';
      default: return '#111827';
    }
  };

  if (isLoadingBook) {
    return (
      <View style={styles.loadingContainer}>
        <LucideIcon name="loader" size={48} color="primary-600" className="animate-spin" />
        <Text variant="bodyMD" color="gray" style={{ marginTop: 12 }}>
          {downloadProgress > 0 ? `Downloading... ${Math.round(downloadProgress * 100)}%` : 'Loading book...'}
        </Text>
      </View>
    );
  }

  if (!bookPath) {
    return (
      <View style={styles.errorContainer}>
        <LucideIcon name="alert-triangle" size={48} color="red" />
        <Text variant="headingMD" color="red" style={{ marginTop: 16 }}>Unable to Load Book</Text>
        <Text variant="bodyMD" color="gray" style={{ marginTop: 8, textAlign: 'center' }}>
          The book file could not be found or downloaded.
        </Text>
        <Button variant="primary" onPress={() => router.back()} style={{ marginTop: 24 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]} onTouchStart={toggleControls}>
      {bookFormat === 'epub' ? (
        <EpubReader
          bookId={bookId}
          bookPath={bookPath}
          onProgressChange={handleProgressChange}
          onChapterChange={handleChapterChange}
        />
      ) : (
        <PdfReader
          bookId={bookId}
          bookPath={bookPath}
          onProgressChange={handlePageChange}
          onPageChange={handlePageChange}
        />
      )}

      {isControlsVisible && (
        <View style={styles.topBar}>
          <Box px={16} py={12} flexDirection="row" alignItems="center" justifyContent="space-between">
            <LucideIcon name="chevron-left" size={24} onPress={() => router.back()} color={getTextColor()} />
            <Box flex={1} alignItems="center" gap={4}>
              <Text variant="bodySM" style={{ fontWeight: '600', color: getTextColor() }}>
                {bookId}
              </Text>
              <Text variant="caption" color="gray">
                {bookFormat === 'epub' 
                  ? `Chapter ${currentChapter + 1} of ${totalChapters}`
                  : `Page ${Math.round(localProgress * totalChapters) || 1} of ${totalChapters}`}
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
                      { width: `${localProgress * 100}%`, backgroundColor: 'primary-500' },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressThumb,
                      { left: `${localProgress * 100}%`, backgroundColor: getBackgroundColor() },
                    ]}
                  />
                </View>
              </Box>
              <LucideIcon name="skip-forward" size={24} color={getTextColor()} onPress={goToNextChapter} />
            </Box>
            <Text variant="caption" color="gray" style={{ textAlign: 'center' }}>
              {Math.round(localProgress * 100)}% 
              {bookFormat === 'epub' ? `• Ch. ${currentChapter + 1}` : `• Pg ${Math.round(localProgress * totalChapters) || 1}`}
            </Text>
          </Box>
        </View>
      )}

      {showSettings && (
        <ReaderSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          fontSize={settings.fontSize}
          onFontSizeChange={(v) => updateReadingProgress(bookId, 0)} // placeholder
          theme={settings.theme}
          onThemeChange={(v) => {}}
          margin={settings.margin}
          onMarginChange={(v) => {}}
          lineHeight={settings.lineHeight}
          onLineHeightChange={(v) => {}}
          fontFamily={settings.fontFamily}
          onFontFamilyChange={(v) => {}}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
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
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0ea5e9',
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