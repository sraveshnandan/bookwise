import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReaderStore } from '@/store/readerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { formatDuration } from '@/utils/formatters';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const mockChapters = Array.from({ length: 12 }, (_, i) => ({
  id: `ch-${i}`,
  title: `Chapter ${i + 1}`,
  duration: 1800 + i * 120,
  url: `https://example.com/audio/chapter-${i + 1}.mp3`,
}));

export default function AudioPlayerScreen() {
  const router = useRouter();
  const { id, chapterId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { audioSettings, setAudioSettings, setCurrentBook } = useReaderStore();
  const { updateProgress } = useLibraryStore();

  const bookId = id as string;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(audioSettings.sleepTimer);
  const [playbackRate, setPlaybackRate] = useState(audioSettings.playbackRate);
  const [volume, setVolume] = useState(audioSettings.volume);
  const [showRateOptions, setShowRateOptions] = useState(false);

  const positionInterval = useRef<NodeJS.Timeout>();
  const sleepTimerTimeout = useRef<NodeJS.Timeout>();

  const currentChapter = mockChapters[currentChapterIndex];

  useEffect(() => {
    setCurrentBook(bookId, 'audiobook');
    loadChapter(currentChapterIndex);
    return () => {
      cleanup();
    };
  }, [bookId]);

  useEffect(() => {
    if (sleepTimer) {
      if (sleepTimerTimeout.current) clearTimeout(sleepTimerTimeout.current);
      sleepTimerTimeout.current = setTimeout(() => {
        pause();
        setSleepTimer(null);
        setAudioSettings({ sleepTimer: null });
      }, sleepTimer * 60 * 1000);
    }
    return () => {
      if (sleepTimerTimeout.current) clearTimeout(sleepTimerTimeout.current);
    };
  }, [sleepTimer]);

  const loadChapter = async (index: number) => {
    if (index < 0 || index >= mockChapters.length) return;
    
    setIsBuffering(true);
    cleanup();

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: mockChapters[index].url },
        { shouldPlay: true, rate: playbackRate, volume },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setCurrentChapterIndex(index);
      setDuration(newSound.getStatus().durationMillis || 0);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading chapter:', error);
      Alert.alert('Error', 'Failed to load audio chapter');
    } finally {
      setIsBuffering(false);
    }
  };

  const onPlaybackStatusUpdate = useCallback((status: Audio.AudioStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish && !status.isLooping) {
        goToNextChapter();
      }
    }
  }, []);

  const cleanup = async () => {
    if (positionInterval.current) clearInterval(positionInterval.current);
    if (sleepTimerTimeout.current) clearTimeout(sleepTimerTimeout.current);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const play = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const skip = async (seconds: number) => {
    if (sound) {
      const newPosition = Math.max(0, Math.min(duration, position + seconds * 1000));
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < mockChapters.length - 1) {
      loadChapter(currentChapterIndex + 1);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      loadChapter(currentChapterIndex - 1);
    }
  };

  const seekTo = async (value: number) => {
    if (sound) {
      const newPosition = (value / 100) * duration;
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setAudioSettings({ playbackRate: rate });
    if (sound) {
      sound.setRateAsync(rate, false);
    }
    setShowRateOptions(false);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    setAudioSettings({ volume: value });
    if (sound) {
      sound.setVolumeAsync(value);
    }
  };

  const handleSleepTimerSelect = (minutes: number | null) => {
    setSleepTimer(minutes);
    setAudioSettings({ sleepTimer: minutes });
    setShowSleepTimer(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <LucideIcon name="music" size={120} color="primary-200" />
      </View>

      <View style={styles.content}>
        <Box px={24} py={8} gap={4} alignItems="center">
          <Text variant="caption" color="gray" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Now Playing
          </Text>
          <Text variant="headingLG" style={{ fontWeight: '700', textAlign: 'center' }}>
            {bookId}
          </Text>
          <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
            {currentChapter.title}
          </Text>
        </Box>

        <Box px={24} py={16} gap={8} alignItems="center">
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
              <View
                style={[
                  styles.progressThumb,
                  { left: `${progressPercent}%` },
                ]}
              />
            </View>
            <Box flexDirection="row" justifyContent="space-between" w="100%" mt={4}>
              <Text variant="caption" color="gray">{formatTime(position)}</Text>
              <Text variant="caption" color="gray">- {formatTime(duration - position)}</Text>
            </Box>
          </View>
        </Box>

        <Box px={24} py={16} gap={24}>
          <Box flexDirection="row" alignItems="center" justifyContent="center" gap={16}>
            <Box p={2} bg="primary-100" borderRadius={9999}>
              <LucideIcon
                name="skip-back"
                size={28}
                color="primary-600"
                onPress={goToPreviousChapter}
              />
            </Box>
            <Box p={2} bg="primary-100" borderRadius={9999}>
              <LucideIcon
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color="primary-600"
                onPress={isPlaying ? pause : play}
              />
            </Box>
            <Box p={2} bg="primary-100" borderRadius={9999}>
              <LucideIcon
                name="skip-forward"
                size={28}
                color="primary-600"
                onPress={goToNextChapter}
              />
            </Box>
          </Box>

          <Box flexDirection="row" alignItems="center" justifyContent="center" gap={16}>
            <Box p={2} bg="gray-100" borderRadius={9999}>
              <LucideIcon
                name="rotate-ccw"
                size={24}
                color="gray"
                onPress={() => skip(-15)}
              />
            </Box>
            <Box p={2} bg="gray-100" borderRadius={9999}>
              <LucideIcon
                name="rotate-cw"
                size={24}
                color="gray"
                onPress={() => skip(15)}
              />
            </Box>
          </Box>
        </Box>

        <Box px={24} py={16} gap={12} flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row" gap={8}>
            <Button variant="ghost" size="sm" onPress={() => setShowRateOptions(true)}>
              <LucideIcon name="fast-forward" size={18} />
              {playbackRate}x
            </Button>
            <Button variant="ghost" size="sm" onPress={() => setShowSleepTimer(true)}>
              <LucideIcon name={sleepTimer ? 'moon' : 'clock'} size={18} />
              {sleepTimer ? `${sleepTimer}m` : 'Sleep'}
            </Button>
          </Box>
          <Box flexDirection="row" gap={8}>
            <Button variant="ghost" size="sm" onPress={() => setShowChapters(true)}>
              <LucideIcon name="list" size={18} />
              Chapters
            </Button>
            <Button variant="ghost" size="sm">
              <LucideIcon name="share-2" size={18} />
            </Button>
          </Box>
        </Box>

        <Box px={24} pb={24} gap={12}>
          <Box flexDirection="row" alignItems="center" gap={16}>
            <LucideIcon name="volume-2" size={24} color="gray" />
            <View style={styles.volumeSlider}>
              <View style={[styles.progressTrack, { height: 4 }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${volume * 100}%`, height: 4 },
                  ]}
                />
                <View
                  style={[
                    styles.progressThumb,
                    { left: `${volume * 100}%`, top: -6, width: 16, height: 16 },
                  ]}
                />
              </View>
            </View>
          </Box>
        </Box>
      </View>

      {showRateOptions && (
        <RateOptionsModal
          visible={showRateOptions}
          onClose={() => setShowRateOptions(false)}
          currentRate={playbackRate}
          onSelect={handleRateChange}
        />
      )}

      {showSleepTimer && (
        <SleepTimerModal
          visible={showSleepTimer}
          onClose={() => setShowSleepTimer(false)}
          currentTimer={sleepTimer}
          onSelect={handleSleepTimerSelect}
        />
      )}

      {showChapters && (
        <ChaptersModal
          visible={showChapters}
          onClose={() => setShowChapters(false)}
          chapters={mockChapters}
          currentIndex={currentChapterIndex}
          onSelect={(index) => loadChapter(index)}
        />
      )}
    </View>
  );
}

function RateOptionsModal({
  visible,
  onClose,
  currentRate,
  onSelect,
}: any) {
  if (!visible) return null;

  const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

  return (
    <View style={styles.modalOverlay} onTouchStart={onClose}>
      <View style={styles.modalContent}>
        <Box px={20} py={16} flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="gray-200">
          <Text variant="headingMD" style={{ fontWeight: '700' }}>Playback Speed</Text>
          <LucideIcon name="x" size={24} onPress={onClose} />
        </Box>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
          {rates.map((rate) => (
            <Button
              key={rate}
              variant={currentRate === rate ? 'primary' : 'outline'}
              fullWidth
              onPress={() => onSelect(rate)}
            >
              {rate}x
            </Button>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function SleepTimerModal({
  visible,
  onClose,
  currentTimer,
  onSelect,
}: any) {
  if (!visible) return null;

  const options = [null, 15, 30, 45, 60, 90, 120];

  return (
    <View style={styles.modalOverlay} onTouchStart={onClose}>
      <View style={styles.modalContent}>
        <Box px={20} py={16} flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="gray-200">
          <Text variant="headingMD" style={{ fontWeight: '700' }}>Sleep Timer</Text>
          <LucideIcon name="x" size={24} onPress={onClose} />
        </Box>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
          {options.map((minutes) => (
            <Button
              key={minutes || 'off'}
              variant={currentTimer === minutes ? 'primary' : 'outline'}
              fullWidth
              onPress={() => onSelect(minutes)}
            >
              {minutes ? `${minutes} minutes` : 'Off'}
            </Button>
          ))}
          <Box pt={8}>
            <Text variant="bodySM" color="gray" style={{ textAlign: 'center' }}>
              Or end of current chapter
            </Text>
          </Box>
        </ScrollView>
      </View>
    </View>
  );
}

function ChaptersModal({
  visible,
  onClose,
  chapters,
  currentIndex,
  onSelect,
}: any) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay} onTouchStart={onClose}>
      <View style={styles.modalContent}>
        <Box px={20} py={16} flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="gray-200">
          <Text variant="headingMD" style={{ fontWeight: '700' }}>Chapters</Text>
          <LucideIcon name="x" size={24} onPress={onClose} />
        </Box>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
          {chapters.map((chapter, index) => (
            <Box
              key={chapter.id}
              px={16}
              py={12}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              bg={index === currentIndex ? 'primary-100' : 'transparent'}
              borderRadius={8}
              onPress={() => {
                onSelect(index);
                onClose();
              }}
            >
              <Box gap={4}>
                <Text
                  variant="bodyMD"
                  style={{
                    fontWeight: index === currentIndex ? '600' : '400',
                    color: index === currentIndex ? 'primary-700' : undefined,
                  }}
                >
                  {chapter.title}
                </Text>
                <Text variant="caption" color="gray">
                  {formatDuration(chapter.duration)}
                </Text>
              </Box>
              {index === currentIndex && (
                <LucideIcon name="play-circle" size={24} color="primary-600" fill="currentColor" />
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
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ translateX: -8 }],
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
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
    maxHeight: SCREEN_HEIGHT * 0.7,
    width: '100%',
  },
});