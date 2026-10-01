import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { GENRES } from '@/constants/app';

const onboardingSteps = [
  {
    id: 'genres',
    title: 'What do you like to read?',
    subtitle: 'Select your favorite genres to get personalized recommendations',
    icon: 'book-open',
  },
  {
    id: 'goal',
    title: 'Set a reading goal',
    subtitle: 'How much time do you want to spend reading each day?',
    icon: 'target',
  },
  {
    id: 'notifications',
    title: 'Enable reminders',
    subtitle: 'Get gentle nudges to keep your reading streak alive',
    icon: 'bell',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, updatePreferences, setOnboardingComplete } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');

  const handleNext = () => {
    if (currentStep === 0) {
      updatePreferences({ genres: selectedGenres });
    } else if (currentStep === 1) {
      updatePreferences({ readingGoal: { type: 'daily', target: dailyGoal, unit: 'minutes', current: 0, periodStart: new Date().toISOString(), periodEnd: new Date().toISOString() } });
    } else if (currentStep === 2) {
      updatePreferences({ dailyReminder: notificationsEnabled, reminderTime });
      setOnboardingComplete(true);
      router.replace('/(tabs)');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const step = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      <Box px={24} py={16} flexDirection="row" justifyContent="space-between" alignItems="center">
        {currentStep > 0 && (
          <Button variant="ghost" size="sm" onPress={handleBack}>
            <LucideIcon name="chevron-left" size={20} />
          </Button>
        )}
        <Box flexDirection="row" gap={8}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                { backgroundColor: index <= currentStep ? '#0ea5e9' : '#e5e7eb' },
              ]}
            />
          ))}
        </Box>
        {currentStep === onboardingSteps.length - 1 && (
          <Button variant="ghost" size="sm" onPress={() => {
            updatePreferences({ dailyReminder: notificationsEnabled, reminderTime });
            setOnboardingComplete(true);
            router.replace('/(tabs)');
          }}>
            <Text variant="bodySM" style={{ fontWeight: '600', color: 'primary-600' }}>Skip</Text>
          </Button>
        )}
      </Box>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}>
        <Box alignItems="center" gap={16} py={32}>
          <Box p={4} bg="primary-100" borderRadius={24}>
            <LucideIcon name={step.icon} size={48} color="primary-600" />
          </Box>
          <Box alignItems="center" gap={8}>
            <Text variant="displaySM" style={{ fontWeight: '800', textAlign: 'center' }}>
              {step.title}
            </Text>
            <Text variant="bodyMD" color="gray" style={{ textAlign: 'center' }}>
              {step.subtitle}
            </Text>
          </Box>
        </Box>

        {currentStep === 0 && (
          <Box gap={12}>
            <Text variant="bodySM" color="gray" style={{ fontWeight: '600' }}>Select at least 3 genres</Text>
            <Box flexDirection="row" flexWrap="wrap" gap={8}>
              {GENRES.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenres.includes(genre) ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setSelectedGenres(prev =>
                    prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
                  )}
                >
                  {genre}
                </Button>
              ))}
            </Box>
            {selectedGenres.length > 0 && (
              <Text variant="caption" color="primary-600" style={{ fontWeight: '600' }}>
                {selectedGenres.length} selected
              </Text>
            )}
          </Box>
        )}

        {currentStep === 1 && (
          <Box gap={24} alignItems="center">
            <Box gap={16} alignItems="center">
              <Text variant="displayMD" style={{ fontWeight: '800', color: 'primary-600' }}>
                {dailyGoal}
              </Text>
              <Text variant="bodyLG" color="gray">minutes per day</Text>
            </Box>
            <Box w="100%" gap={12}>
              <Box flexDirection="row" justifyContent="space-between">
                <Text variant="bodySM" color="gray">5 min</Text>
                <Text variant="bodySM" color="gray">60 min</Text>
              </Box>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${((dailyGoal - 5) / 55) * 100}%` },
                  ]}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    { left: `${((dailyGoal - 5) / 55) * 100}%` },
                  ]}
                />
              </View>
            </Box>
            <Box flexDirection="row" gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              {[10, 15, 20, 30, 45, 60].map((min) => (
                <Button
                  key={min}
                  variant={dailyGoal === min ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setDailyGoal(min)}
                >
                  {min} min
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {currentStep === 2 && (
          <Box gap={16}>
            <Box px={16} py={16} bg="primary-50" borderRadius={16} gap={12}>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Box gap={4}>
                  <Text variant="bodyMD" style={{ fontWeight: '600' }}>Daily Reading Reminder</Text>
                  <Text variant="bodySM" color="gray">Get notified to read at your chosen time</Text>
                </Box>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#e5e7eb', true: '#0ea5e9' }}
                />
              </Box>
              {notificationsEnabled && (
                <Box pt={8} flexDirection="row" alignItems="center" justifyContent="space-between">
                  <Text variant="bodyMD" style={{ fontWeight: '500' }}>Reminder Time</Text>
                  <Button variant="outline" size="sm" onPress={() => {}}>
                    {reminderTime}
                  </Button>
                </Box>
              )}
            </Box>

            <Box px={16} py={16} bg="green-50" borderRadius={16} gap={8}>
              <Box flexDirection="row" alignItems="center" gap={8}>
                <LucideIcon name="shield" size={20} color="green-600" />
                <Text variant="bodyMD" style={{ fontWeight: '600', color: 'green-700' }}>We respect your privacy</Text>
              </Box>
              <Text variant="bodySM" color="green-700">
                Notification permissions can be changed anytime in Settings. We never share your data.
              </Text>
            </Box>
          </Box>
        )}
      </ScrollView>

      <Box px={24} pb={24} gap={12} style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        <Button variant="primary" size="lg" onPress={handleNext} disabled={currentStep === 0 && selectedGenres.length < 3}>
          {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue'}
          <LucideIcon name={currentStep === onboardingSteps.length - 1 ? 'check' : 'chevron-right'} size={20} />
        </Button>
        {currentStep > 0 && (
          <Button variant="ghost" size="md" onPress={handleBack}>
            Back
          </Button>
        )}
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ translateX: -9 }],
  },
});