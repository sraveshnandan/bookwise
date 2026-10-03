import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Must use physical device for push notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    })).data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0ea5e9',
      });
      
      await Notifications.setNotificationChannelAsync('reading-reminder', {
        name: 'Reading Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0ea5e9',
        sound: 'default',
      });
      
      await Notifications.setNotificationChannelAsync('downloads', {
        name: 'Downloads',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0ea5e9',
      });
      
      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f97316',
        sound: 'default',
      });
    }

    return token;
  },

  async savePushToken(userId: string, token: string) {
    try {
      await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', userId);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  },

  async scheduleReadingReminder(userId: string, time: string, bookTitle?: string) {
    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Read! 📚',
        body: bookTitle ? `Continue reading "${bookTitle}"` : 'Your daily reading time is here',
        data: { type: 'reading_reminder', userId, bookTitle },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  },

  async cancelReadingReminder() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    channelId = 'default'
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null,
    });
  },

  async sendDownloadCompleteNotification(bookTitle: string, format: string) {
    await this.sendLocalNotification(
      'Download Complete ✓',
      `"${bookTitle}" (${format}) is ready for offline reading`,
      { type: 'download_complete', bookTitle, format },
      'downloads'
    );
  },

  async sendDownloadFailedNotification(bookTitle: string, error: string) {
    await this.sendLocalNotification(
      'Download Failed ✗',
      `Failed to download "${bookTitle}": ${error}`,
      { type: 'download_failed', bookTitle, error },
      'downloads'
    );
  },

  async sendAchievementNotification(achievementName: string, description: string) {
    await this.sendLocalNotification(
      'Achievement Unlocked! 🏆',
      `${achievementName}: ${description}`,
      { type: 'achievement', achievementName, description },
      'achievements'
    );
  },

  async sendNewReleaseNotification(bookTitle: string, author: string) {
    await this.sendLocalNotification(
      'New Release! 📖',
      `"${bookTitle}" by ${author} is now available`,
      { type: 'new_release', bookTitle, author },
      'default'
    );
  },

  async sendSubscriptionUpdateNotification(message: string) {
    await this.sendLocalNotification(
      'Subscription Update',
      message,
      { type: 'subscription_update' },
      'default'
    );
  },

  async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  },

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  },

  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  },

  async clearScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  },

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  },
};

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<Notifications.Notification | null>(null);

  React.useEffect(() => {
    registerForPushNotifications();
    
    const receivedListener = NotificationService.addNotificationReceivedListener(setNotification);
    const responseListener = NotificationService.addNotificationResponseReceivedListener(setNotification);
    
    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, []);

  const registerForPushNotifications = async () => {
    const token = await NotificationService.registerForPushNotifications();
    setExpoPushToken(token);
  };

  return { expoPushToken, notification };
};

import React from 'react';