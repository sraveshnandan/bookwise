import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import Pdf from 'react-native-pdf';
import { Box, Text, Button } from '../Box';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PdfReaderProps {
  bookId: string;
  bookPath: string;
  onProgressChange: (progress: number, pageNumber: number) => void;
  onPageChange: (pageNumber: number) => void;
}

export const PdfReader = React.memo<PdfReaderProps>(({ bookId, bookPath, onProgressChange, onPageChange }) => {
  const colorScheme = useColorScheme();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const pdfRef = useRef<Pdf>(null);

  const handleLoadComplete = useCallback((pageCount: number) => {
    setTotalPages(pageCount);
    setIsLoading(false);
    onPageChange(1);
  }, [onPageChange]);

  const handlePageChanged = useCallback((pageNumber: number) => {
    setPage(pageNumber);
    onProgressChange(pageNumber / totalPages, pageNumber);
    onPageChange(pageNumber);
  }, [totalPages, onProgressChange, onPageChange]);

  const handleLoadError = useCallback((error: any) => {
    console.error('PDF Load Error:', error);
    Alert.alert('Error', 'Failed to load PDF');
    setIsLoading(false);
  }, []);

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      pdfRef.current?.setPage(pageNumber);
    }
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  const goToNextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, totalPages, goToPage]);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LucideIcon name="file-text" size={48} color="primary-600" className="animate-spin" />
        <Text variant="bodyMD" color="gray" style={{ marginTop: 12 }}>Loading PDF...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pdfContainer}>
        <Pdf
          ref={pdfRef}
          source={{ uri: bookPath }}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
          onError={handleLoadError}
          style={styles.pdf}
          scale={scale}
          enableAntialiasing={true}
          enablePaging={true}
          horizontal={false}
        />
      </View>

      <View style={styles.bottomControls}>
        <Box px={16} py={12} gap={12}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" gap={8}>
              <LucideIcon name="minus" size={24} onPress={goToPreviousPage} />
              <Text variant="bodySM" style={{ fontWeight: '600', minWidth: 60, textAlign: 'center' }}>
                {page} / {totalPages}
              </Text>
              <LucideIcon name="plus" size={24} onPress={goToNextPage} />
            </Box>

            <Box flexDirection="row" alignItems="center" gap={8}>
              <LucideIcon name="minus" size={20} onPress={zoomOut} />
              <Text variant="caption" style={{ fontWeight: '600', minWidth: 40, textAlign: 'center' }}>
                {Math.round(scale * 100)}%
              </Text>
              <LucideIcon name="plus" size={20} onPress={zoomIn} />
              <LucideIcon name="rotate-ccw" size={20} onPress={resetZoom} />
            </Box>
          </Box>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: totalPages > 0 ? `${(page / totalPages) * 100}%` : '0%' },
              ]}
            />
          </View>
        </Box>
      </View>
    </View>
  );
});

PdfReader.displayName = 'PdfReader';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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