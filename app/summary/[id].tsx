import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { formatDuration, formatNumber } from '@/utils/formatters';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const mockSummary = {
  id: 'summary-1',
  bookId: 'book-1',
  bookTitle: 'Atomic Habits',
  bookAuthor: 'James Clear',
  bookCoverUrl: 'https://example.com/cover.jpg',
  type: 'text' as const,
  title: 'Atomic Habits - Key Insights',
  content: `
    # Atomic Habits: Key Insights

    ## The Power of Tiny Changes

    The central thesis of Atomic Habits is that small, incremental improvements compound over time to produce remarkable results. James Clear introduces the concept of "atomic habits" - tiny changes that are both easy to implement and powerful in their cumulative effect.

    ### 1% Better Every Day

    If you get 1% better each day for one year, you'll end up 37 times better by the time you're done. Conversely, if you get 1% worse each day, you'll decline nearly to zero. This mathematical reality underscores why small habits matter enormously.

    ## The Four Laws of Behavior Change

    Clear presents a framework for building good habits and breaking bad ones:

    ### 1. Make It Obvious (Cue)
    - **Implementation Intentions**: "I will [BEHAVIOR] at [TIME] in [LOCATION]"
    - **Habit Stacking**: "After [CURRENT HABIT], I will [NEW HABIT]"
    - **Environment Design**: Make cues for good habits visible and obvious

    ### 2. Make It Attractive (Craving)
    - **Temptation Bundling**: Pair an action you want to do with an action you need to do
    - **Culture**: Join a culture where your desired behavior is the normal behavior
    - **Motivation Ritual**: Do something you enjoy immediately before a difficult habit

    ### 3. Make It Easy (Response)
    - **Reduce Friction**: Decrease the number of steps between you and your good habits
    - **Prime the Environment**: Prepare your environment to make future actions easier
    - **Two-Minute Rule**: When starting a new habit, it should take less than two minutes to do

    ### 4. Make It Satisfying (Reward)
    - **Immediate Reinforcement**: Use immediate rewards to reinforce long-term habits
    - **Habit Tracking**: Visual proof of your progress
    - **Never Miss Twice**: When you forget a habit, get back on track immediately

    ## Advanced Tactics

    ### The Goldilocks Rule
    Humans experience peak motivation when working on tasks that are right on the edge of their current abilities. Not too hard, not too easy - just right.

    ### Identity-Based Habits
    True behavior change is identity change. Every action you take is a vote for the type of person you wish to become. Focus on who you want to become, not what you want to achieve.

    ## Key Takeaways

    1. **Habits are the compound interest of self-improvement**
    2. **Focus on systems, not goals** - Goals are about results; systems are about processes
    3. **Your outcomes are a lagging measure of your habits**
    4. **Small changes appear to make no difference until you cross a critical threshold**
    5. **The most effective way to change your habits is to focus on who you wish to become**
  `,
  audioUrl: 'https://example.com/summary-audio.mp3',
  pdfUrl: 'https://example.com/summary.pdf',
  duration: 720,
  wordCount: 2847,
  keyTakeaways: [
    'Small habits compound over time to create remarkable results',
    'Focus on identity-based habits rather than outcome-based goals',
    'Use the Four Laws of Behavior Change to build good habits',
    'Environment design is more powerful than willpower',
    'Track your habits to maintain accountability and motivation',
  ],
  chapters: [
    { id: '1', title: 'The Power of Tiny Changes', content: '...', order: 1 },
    { id: '2', title: 'How Habits Shape Your Identity', content: '...', order: 2 },
    { id: '3', title: 'The Four Laws of Behavior Change', content: '...', order: 3 },
    { id: '4', title: 'Making Good Habits Inevitable', content: '...', order: 4 },
    { id: '5', title: 'Advanced Tactics for Mastery', content: '...', order: 5 },
  ],
  isPremium: true,
};

export default function SummaryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'audio'>('text');
  const [fontSize, setFontSize] = useState(16);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const bookId = id as string;

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: mockSummary.audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setAudioDuration(status.durationMillis);
            setAudioPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
          }
        }
      );
      setSound(newSound);
    } catch (error) {
      Alert.alert('Error', 'Failed to load audio summary');
    }
  };

  const togglePlay = async () => {
    if (!sound) {
      await loadAudio();
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const seekAudio = (value: number) => {
    if (sound) {
      const newPosition = (value / 100) * audioDuration;
      sound.setPositionAsync(newPosition);
      setAudioPosition(newPosition);
    }
  };

  const skipAudio = (seconds: number) => {
    if (sound) {
      const newPosition = Math.max(0, Math.min(audioDuration, audioPosition + seconds * 1000));
      sound.setPositionAsync(newPosition);
      setAudioPosition(newPosition);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = audioDuration > 0 ? (audioPosition / audioDuration) * 100 : 0;

  const handleTabChange = (tab: 'text' | 'pdf' | 'audio') => {
    setActiveTab(tab);
    if (tab === 'audio' && !sound) {
      loadAudio();
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: showAudioPlayer ? 200 : 100 }}
    >
      <Box px={16} py={8} gap={8}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <LucideIcon name="chevron-left" size={24} onPress={() => router.back()} />
          <Box flexDirection="row" gap={8}>
            <Button variant="ghost" size="sm">
              <LucideIcon name="share-2" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <LucideIcon name="bookmark" size={18} />
            </Button>
          </Box>
        </Box>

        <Box flexDirection="row" gap={16} mt={8}>
          <Box
            w={100}
            h={150}
            borderRadius={12}
            overflow="hidden"
            bg="gray-100"
          >
            {mockSummary.bookCoverUrl ? (
              <Image
                source={{ uri: mockSummary.bookCoverUrl }}
                style={{ width: 100, height: 150, resizeMode: 'cover' }}
                contentFit="cover"
              />
            ) : (
              <Box flex={1} alignItems="center" justifyContent="center">
                <LucideIcon name="book" size={32} color="gray" />
              </Box>
            )}
          </Box>

          <Box flex={1} gap={8} justifyContent="center">
            <Box flexDirection="row" gap={6} flexWrap="wrap">
              <Box px={3} py={1} bg="amber-100" borderRadius={9999}>
                <Text variant="caption" color="amber-800" style={{ fontWeight: '600' }}>
                  Premium
                </Text>
              </Box>
              <Box px={3} py={1} bg="primary-100" borderRadius={9999}>
                <Text variant="caption" color="primary-800" style={{ fontWeight: '600' }}>
                  Summary
                </Text>
              </Box>
            </Box>
            <Text variant="headingLG" style={{ fontWeight: '800', lineHeight: 1.3 }}>
              {mockSummary.title}
            </Text>
            <Text variant="bodyMD" color="gray">by {mockSummary.bookAuthor}</Text>
            <Box flexDirection="row" alignItems="center" gap={12} mt={4}>
              <Box flexDirection="row" alignItems="center" gap={4}>
                <LucideIcon name="file-text" size={14} color="gray" />
                <Text variant="caption" color="gray">{formatNumber(mockSummary.wordCount)} words</Text>
              </Box>
              <Box flexDirection="row" alignItems="center" gap={4}>
                <LucideIcon name="clock" size={14} color="gray" />
                <Text variant="caption" color="gray">{formatDuration(mockSummary.duration)}</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box mt={16} gap={8}>
          <Box flexDirection="row" gap={4} style={{ flexWrap: 'wrap' }}>
            {(['text', 'pdf', 'audio'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => handleTabChange(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </Box>
        </Box>

        {activeTab === 'text' && (
          <Box px={16} mt={16} gap={16}>
            <Box gap={12}>
              <Text variant="headingSM" style={{ fontWeight: '700' }}>Key Takeaways</Text>
              {mockSummary.keyTakeaways.map((takeaway, index) => (
                <Box
                  key={index}
                  flexDirection="row"
                  gap={12}
                  px={16}
                  py={12}
                  bg="primary-50"
                  borderRadius={12}
                  borderLeftWidth={4}
                  borderLeftColor="primary-500"
                >
                  <Text variant="headingSM" color="primary-600" style={{ fontWeight: '700' }}>
                    {index + 1}
                  </Text>
                  <Text variant="bodyMD" style={{ flex: 1, color: 'primary-900' }}>
                    {takeaway}
                  </Text>
                </Box>
              ))}
            </Box>

            <Box pt={16} borderTopWidth={1} borderColor="gray-200" gap={12}>
              <Text variant="headingSM" style={{ fontWeight: '700' }}>Full Summary</Text>
              <Text
                variant="bodyMD"
                color="gray"
                style={{
                  lineHeight: 1.8,
                  fontSize,
                  fontFamily: 'Merriweather',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {mockSummary.content}
              </Text>
            </Box>

            <Box px={16} py={16} gap={12} bg="gray-50" borderRadius={16}>
              <Text variant="bodySM" color="gray" style={{ fontWeight: '600', textAlign: 'center' }}>
                Adjust reading settings
              </Text>
              <Box flexDirection="row" alignItems="center" justifyContent="center" gap={16}>
                <LucideIcon name="minus" size={24} onPress={() => setFontSize(Math.max(12, fontSize - 1))} />
                <Text variant="headingMD" style={{ fontWeight: '700', minWidth: 40, textAlign: 'center' }}>
                  {fontSize}
                </Text>
                <LucideIcon name="plus" size={24} onPress={() => setFontSize(Math.min(24, fontSize + 1))} />
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'pdf' && (
          <Box px={16} mt={16} gap={16} alignItems="center">
            <LucideIcon name="file-text" size={64} color="gray" />
            <Text variant="headingMD" color="gray">PDF Summary</Text>
            <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
              PDF rendering would be implemented here with react-native-pdf
            </Text>
            <Button variant="primary" mt={8} onPress={() => {}}>
              <LucideIcon name="download" size={18} />
              Download PDF
            </Button>
          </Box>
        )}

        {activeTab === 'audio' && (
          <Box px={16} mt={16} gap={16}>
            <Box px={16} py={16} gap={12} bg="primary-50" borderRadius={16}>
              <Box flexDirection="row" alignItems="center" gap={12}>
                <Box p={3} bg="primary-100" borderRadius={9999}>
                  <LucideIcon name="headphones" size={24} color="primary-600" />
                </Box>
                <Box flex={1} gap={2}>
                  <Text variant="bodyMD" style={{ fontWeight: '600' }}>Audio Summary</Text>
                  <Text variant="caption" color="gray">{formatDuration(mockSummary.duration)}</Text>
                </Box>
                <Button variant="primary" size="sm" onPress={togglePlay}>
                  <LucideIcon name={isPlaying ? 'pause' : 'play'} size={18} />
                </Button>
              </Box>

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
                  <Text variant="caption" color="gray">{formatTime(audioPosition)}</Text>
                  <Text variant="caption" color="gray">{formatTime(audioDuration - audioPosition)}</Text>
                </Box>
              </View>

              <Box flexDirection="row" alignItems="center" justifyContent="center" gap={16}>
                <LucideIcon name="rotate-ccw" size={24} color="gray" onPress={() => skipAudio(-15)} />
                <LucideIcon name="rotate-cw" size={24} color="gray" onPress={() => skipAudio(15)} />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    width: '100%',
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
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ translateX: -6 }],
  },
});