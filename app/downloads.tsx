import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDownloadStore } from '@/store/downloadStore';
import { useLibraryStore } from '@/store/libraryStore';
import { LucideIcon } from 'lucide-react-native';
import { formatFileSize, formatDuration } from '@/utils/formatters';

export default function DownloadsScreen() {
  const colorScheme = useColorScheme();
  const { queue, activeCount, maxConcurrent, wifiOnly, setWifiOnly, setMaxConcurrent, clearCompleted, clearFailed } = useDownloadStore();
  const { items: libraryItems } = useLibraryStore();

  const downloading = queue.filter(t => t.status === 'downloading');
  const pending = queue.filter(t => t.status === 'pending');
  const paused = queue.filter(t => t.status === 'paused');
  const completed = queue.filter(t => t.status === 'completed');
  const failed = queue.filter(t => t.status === 'failed');

  const downloadedBooks = libraryItems.filter(item => item.downloadedFormats.length > 0);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <Box px={16} py={24} gap={16}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="headingXL" style={{ fontWeight: '800' }}>
            Downloads
          </Text>
          <Box flexDirection="row" gap={8}>
            <Button variant="ghost" size="sm" onPress={clearCompleted} disabled={completed.length === 0}>
              <LucideIcon name="trash-2" size={18} />
              Clear Done
            </Button>
            <Button variant="ghost" size="sm" onPress={clearFailed} disabled={failed.length === 0}>
              <LucideIcon name="x-circle" size={18} />
              Clear Failed
            </Button>
          </Box>
        </Box>

        <Box px={16} py={12} gap={12} bg="primary-50" borderRadius={16} borderWidth={1} borderColor="primary-200">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box gap={4}>
              <Text variant="bodySM" color="gray">Active Downloads</Text>
              <Text variant="headingMD" style={{ fontWeight: '800', color: 'primary-600' }}>
                {activeCount} / {maxConcurrent}
              </Text>
            </Box>
            <Box flexDirection="row" gap={8} alignItems="center">
              <Text variant="caption" color="gray">WiFi Only</Text>
              <Switch value={wifiOnly} onValueChange={setWifiOnly} trackColor={{ false: '#e5e7eb', true: '#0ea5e9' }} />
            </Box>
          </Box>
          <Box flexDirection="row" alignItems="center" gap={8}>
            <Text variant="caption" color="gray">Max Concurrent</Text>
            <Button variant="ghost" size="sm" onPress={() => setMaxConcurrent(Math.max(1, maxConcurrent - 1))}>
              <LucideIcon name="minus" size={16} />
            </Button>
            <Text variant="headingSM" style={{ fontWeight: '700', minWidth: 30, textAlign: 'center' }}>
              {maxConcurrent}
            </Text>
            <Button variant="ghost" size="sm" onPress={() => setMaxConcurrent(Math.min(5, maxConcurrent + 1))}>
              <LucideIcon name="plus" size={16} />
            </Button>
          </Box>
        </Box>

        {downloading.length > 0 && (
          <Box gap={12}>
            <Text variant="headingLG" style={{ fontWeight: '700' }}>Downloading</Text>
            {downloading.map((task) => (
              <DownloadTaskCard key={task.id} task={task} />
            ))}
          </Box>
        )}

        {pending.length > 0 && (
          <Box gap={12}>
            <Text variant="headingLG" style={{ fontWeight: '700' }}>Queued</Text>
            {pending.map((task) => (
              <DownloadTaskCard key={task.id} task={task} />
            ))}
          </Box>
        )}

        {paused.length > 0 && (
          <Box gap={12}>
            <Text variant="headingLG" style={{ fontWeight: '700' }}>Paused</Text>
            {paused.map((task) => (
              <DownloadTaskCard key={task.id} task={task} />
            ))}
          </Box>
        )}

        {failed.length > 0 && (
          <Box gap={12}>
            <Text variant="headingLG" style={{ fontWeight: '700' }}>Failed</Text>
            {failed.map((task) => (
              <DownloadTaskCard key={task.id} task={task} />
            ))}
          </Box>
        )}

        {completed.length > 0 && (
          <Box gap={12}>
            <Text variant="headingLG" style={{ fontWeight: '700' }}>Completed</Text>
            {completed.map((task) => (
              <DownloadTaskCard key={task.id} task={task} />
            ))}
          </Box>
        )}

        {queue.length === 0 && downloadedBooks.length === 0 && (
          <Box py={64} alignItems="center" gap={16}>
            <LucideIcon name="download" size={64} color="gray" />
            <Box alignItems="center" gap={8}>
              <Text variant="headingLG" style={{ fontWeight: '700' }}>No Downloads</Text>
              <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
                Download books, audiobooks & summaries for offline access
              </Text>
              <Button variant="primary" onPress={() => {}}>
                <LucideIcon name="search" size={18} />
                Browse Library
              </Button>
            </Box>
          </Box>
        )}

        {downloadedBooks.length > 0 && (
          <Box gap={16}>
            <Text variant="headingLG" style={{ fontWeight: '700' }}>Downloaded Content</Text>
            <Box gap={8}>
              {downloadedBooks.map((item) => (
                <Box key={item.id} flexDirection="row" alignItems="center" gap={12} px={16} py={12} bg="gray-50" borderRadius={12}>
                  <Box w={50} h={75} borderRadius={8} overflow="hidden" bg="gray-200">
                    {item.book.coverUrl ? (
                      <Image source={{ uri: item.book.coverUrl }} style={{ width: 50, height: 75, resizeMode: 'cover' }} contentFit="cover" />
                    ) : (
                      <Box flex={1} alignItems="center" justifyContent="center"><LucideIcon name="book" size={20} color="gray" /></Box>
                    )}
                  </Box>
                  <Box flex={1} gap={4}>
                    <Text variant="bodySM" style={{ fontWeight: '600' }}>{item.book.title}</Text>
                    <Text variant="caption" color="gray">{item.book.author}</Text>
                    <Box flexDirection="row" gap={8} mt={4}>
                      {item.downloadedFormats.map((format) => (
                        <Box key={format.format} px={2} py={1} bg="primary-100" borderRadius={4}>
                          <Text variant="caption" color="primary-700" style={{ fontWeight: '600', textTransform: 'uppercase' }}>
                            {format.format.replace('-', ' ')}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Text variant="caption" color="gray">{formatFileSize(item.downloadedFormats.reduce((sum, f) => sum + f.fileSize, 0))}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </ScrollView>
  );
}

function DownloadTaskCard({ task }: { task: any }) {
  const colorScheme = useColorScheme();
  const { updateTask, pauseTask, resumeTask, cancelTask, retryTask } = useDownloadStore();

  const statusColors = {
    downloading: 'primary',
    pending: 'gray',
    paused: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'gray',
  };

  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'gray';

  return (
    <Box px={16} py={12} gap={8} bg="gray-50" borderRadius={12} borderWidth={1} borderColor="gray-200">
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box flexDirection="row" alignItems="center" gap={12} flex={1}>
          <Box p={1.5} bg={`${statusColor}-100`} borderRadius={8}>
            <LucideIcon name={
              task.status === 'downloading' ? 'loader' :
              task.status === 'completed' ? 'check-circle' :
              task.status === 'failed' ? 'alert-circle' :
              task.status === 'paused' ? 'pause' : 'clock'
            } size={20} color={`${statusColor}-600`} />
          </Box>
          <Box gap={2} flex={1} minWidth={0}>
            <Text variant="bodySM" style={{ fontWeight: '600', maxWidth: '100%' }}>
              {task.bookId}
            </Text>
            <Text variant="caption" color="gray">
              {task.format} • {formatFileSize(task.fileSize)}
            </Text>
          </Box>
        </Box>
        <Box flexDirection="row" gap={4}>
          {task.status === 'downloading' && (
            <Button variant="ghost" size="sm" onPress={() => pauseTask(task.id)}>
              <LucideIcon name="pause" size={16} />
            </Button>
          )}
          {task.status === 'paused' && (
            <Button variant="ghost" size="sm" onPress={() => resumeTask(task.id)}>
              <LucideIcon name="play" size={16} />
            </Button>
          )}
          {task.status === 'failed' && (
            <Button variant="ghost" size="sm" onPress={() => retryTask(task.id)}>
              <LucideIcon name="rotate-cw" size={16} />
            </Button>
          )}
          {(task.status === 'downloading' || task.status === 'pending' || task.status === 'paused') && (
            <Button variant="ghost" size="sm" onPress={() => cancelTask(task.id)}>
              <LucideIcon name="x" size={16} />
            </Button>
          )}
        </Box>
      </Box>

      {task.status === 'downloading' && (
        <Box gap={4}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${task.progress * 100}%` },
              ]}
            />
          </View>
          <Box flexDirection="row" justifyContent="space-between">
            <Text variant="caption" color="gray">
              {Math.round(task.progress * 100)}% • {formatFileSize(task.downloadedBytes)} / {formatFileSize(task.fileSize)}
            </Text>
            <Text variant="caption" color="gray">
              {task.downloadedBytes > 0 ? formatDuration(task.fileSize / task.downloadedBytes * (1 - task.progress)) : '--:--'}
            </Text>
          </Box>
        </Box>
      )}

      {task.status === 'failed' && task.error && (
        <Text variant="caption" color="red">{task.error}</Text>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
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

import { Image } from 'expo-image';
import { Switch } from 'react-native';
import { useDownloadStore } from '@/store/downloadStore';