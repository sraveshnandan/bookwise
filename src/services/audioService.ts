import TrackPlayer, {
  Event,
  State,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import { AudioChapter } from '@/types';

const setupPlayer = async () => {
  await TrackPlayer.setupPlayer({
    appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
  });

  await TrackPlayer.updateOptions({
    stopWithApp: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SeekTo,
      Capability.Skip,
      Capability.SkipNext,
      Capability.SkipPrevious,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipNext,
      Capability.SkipPrevious,
    ],
    progressUpdateEventInterval: 1,
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipNext,
      Capability.SkipPrevious,
      Capability.SeekTo,
    ],
    android: {
      notificationColor: '#0ea5e9',
      notificationIcon: 'ic_notification',
    },
  });
};

export const AudioService = {
  async initialize() {
    await setupPlayer();
    await this.setupEventListeners();
  },

  async setupEventListeners() {
    TrackPlayer.addEventListener(Event.PlaybackState, this.handlePlaybackState);
    TrackPlayer.addEventListener(Event.PlaybackError, this.handlePlaybackError);
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, this.handleQueueEnded);
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, this.handleActiveTrackChanged);
    TrackPlayer.addEventListener(Event.RemotePause, this.handleRemotePause);
    TrackPlayer.addEventListener(Event.RemotePlay, this.handleRemotePlay);
    TrackPlayer.addEventListener(Event.RemoteNext, this.handleRemoteNext);
    TrackPlayer.addEventListener(Event.RemotePrevious, this.handleRemotePrevious);
    TrackPlayer.addEventListener(Event.RemoteSeek, this.handleRemoteSeek);
  },

  handlePlaybackState: (state: State) => {
    console.log('Playback state:', state);
  },

  handlePlaybackError: (error: any) => {
    console.error('Playback error:', error);
  },

  handleQueueEnded: () => {
    console.log('Queue ended');
  },

  handleActiveTrackChanged: (track: any) => {
    console.log('Active track changed:', track);
  },

  handleRemotePause: () => {
    TrackPlayer.pause();
  },

  handleRemotePlay: () => {
    TrackPlayer.play();
  },

  handleRemoteNext: () => {
    TrackPlayer.skipNext();
  },

  handleRemotePrevious: () => {
    TrackPlayer.skipPrevious();
  },

  handleRemoteSeek: (data: { position: number }) => {
    TrackPlayer.seekTo(data.position);
  },

  async addChapters(chapters: AudioChapter[], startIndex = 0) {
    await TrackPlayer.reset();
    
    const tracks = chapters.map((chapter, index) => ({
      id: chapter.id,
      url: chapter.url,
      title: chapter.title,
      artist: 'BookWise',
      artwork: chapter.artwork || 'https://example.com/default-cover.jpg',
      duration: chapter.duration,
    }));

    await TrackPlayer.add(tracks);
    await TrackPlayer.skip(tracks[startIndex].id);
  },

  async play() {
    await TrackPlayer.play();
  },

  async pause() {
    await TrackPlayer.pause();
  },

  async stop() {
    await TrackPlayer.stop();
  },

  async seekTo(position: number) {
    await TrackPlayer.seekTo(position);
  },

  async skipNext() {
    await TrackPlayer.skipNext();
  },

  async skipPrevious() {
    await TrackPlayer.skipPrevious();
  },

  async setRate(rate: number) {
    await TrackPlayer.setRate(rate);
  },

  async setVolume(volume: number) {
    await TrackPlayer.setVolume(volume);
  },

  async getCurrentTrack() {
    return TrackPlayer.getCurrentTrack();
  },

  async getProgress() {
    return TrackPlayer.getProgress();
  },

  async getState() {
    return TrackPlayer.getState();
  },

  async getQueue() {
    return TrackPlayer.getQueue();
  },

  async removeUpcomingTracks() {
    const queue = await TrackPlayer.getQueue();
    const currentTrack = await TrackPlayer.getCurrentTrack();
    if (currentTrack !== null) {
      const upcomingTracks = queue.slice(currentTrack + 1);
      await TrackPlayer.remove(upcomingTracks.map(t => t.id));
    }
  },

  async updateTrackMetadata(trackId: string, metadata: any) {
    await TrackPlayer.updateMetadataForTrack(trackId, metadata);
  },

  async destroy() {
    await TrackPlayer.destroy();
    TrackPlayer.removeEventListener(Event.PlaybackState);
    TrackPlayer.removeEventListener(Event.PlaybackError);
    TrackPlayer.removeEventListener(Event.PlaybackQueueEnded);
    TrackPlayer.removeEventListener(Event.PlaybackActiveTrackChanged);
    TrackPlayer.removeEventListener(Event.RemotePause);
    TrackPlayer.removeEventListener(Event.RemotePlay);
    TrackPlayer.removeEventListener(Event.RemoteNext);
    TrackPlayer.removeEventListener(Event.RemotePrevious);
    TrackPlayer.removeEventListener(Event.RemoteSeek);
  },
};

export const useAudioPlayer = (chapters: AudioChapter[], initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isBuffering, setIsBuffering] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1.0);
  const [volume, setVolume] = React.useState(1.0);
  const [sleepTimer, setSleepTimer] = React.useState<number | null>(null);

  const sleepTimerRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    AudioService.initialize();
    AudioService.addChapters(chapters, initialIndex);
    return () => {
      AudioService.destroy();
    };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(async () => {
      const progress = await AudioService.getProgress();
      setPosition(progress.position);
      setDuration(progress.duration);
      setIsPlaying(progress.state === State.Playing);
      setIsBuffering(progress.state === State.Buffering);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (sleepTimer) {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = setTimeout(() => {
        AudioService.pause();
        setSleepTimer(null);
      }, sleepTimer * 60 * 1000);
    }
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepTimer]);

  const play = async () => {
    await AudioService.play();
    setIsPlaying(true);
  };

  const pause = async () => {
    await AudioService.pause();
    setIsPlaying(false);
  };

  const skip = async (seconds: number) => {
    await AudioService.seekTo(position + seconds);
  };

  const goToNextChapter = async () => {
    await AudioService.skipNext();
    const track = await AudioService.getCurrentTrack();
    if (track !== null) setCurrentIndex(track);
  };

  const goToPreviousChapter = async () => {
    await AudioService.skipPrevious();
    const track = await AudioService.getCurrentTrack();
    if (track !== null) setCurrentIndex(track);
  };

  const seekTo = async (value: number) => {
    await AudioService.seekTo((value / 100) * duration);
  };

  const changeRate = async (rate: number) => {
    await AudioService.setRate(rate);
    setPlaybackRate(rate);
  };

  const changeVolume = async (vol: number) => {
    await AudioService.setVolume(vol);
    setVolume(vol);
  };

  const setSleepTimerMinutes = (minutes: number | null) => {
    setSleepTimer(minutes);
  };

  const selectChapter = async (index: number) => {
    const queue = await AudioService.getQueue();
    if (index >= 0 && index < queue.length) {
      await TrackPlayer.skip(queue[index].id);
      setCurrentIndex(index);
    }
  };

  return {
    currentIndex,
    position,
    duration,
    isPlaying,
    isBuffering,
    playbackRate,
    volume,
    sleepTimer,
    currentChapter: chapters[currentIndex],
    play,
    pause,
    skip,
    goToNextChapter,
    goToPreviousChapter,
    seekTo,
    changeRate,
    changeVolume,
    setSleepTimerMinutes,
    selectChapter,
  };
};

import React from 'react';