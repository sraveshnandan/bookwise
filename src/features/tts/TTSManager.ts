import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as AV from 'expo-av';
import { Audio } from 'expo-av';

export interface TTSVoice {
  identifier: string;
  name: string;
  language: string;
  quality: 'default' | 'enhanced';
  gender?: 'male' | 'female';
}

export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export interface TTSState {
  speaking: boolean;
  paused: boolean;
  progress: number;
  currentText: string;
  queue: string[];
}

export class TTSManager {
  private static instance: TTSManager;
  private state: TTSState = {
    speaking: false,
    paused: false,
    progress: 0,
    currentText: '',
    queue: [],
  };
  private listeners: ((state: TTSState) => void)[] = [];
  private voices: TTSVoice[] = [];
  private currentUtterance: Speech.Speech | null = null;
  private audioSound: AV.Audio.Sound | null = null;
  private currentIndex = 0;
  private useNativeAudio = false;

  static getInstance(): TTSManager {
    if (!TTSManager.instance) {
      TTSManager.instance = new TTSManager();
    }
    return TTSManager.instance;
  }

  async initialize(): Promise<void> {
    await this.loadVoices();
    
    if (Platform.OS !== 'web') {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.warn('Audio mode setup failed:', error);
      }
    }
  }

  private async loadVoices(): Promise<void> {
    try {
      this.voices = await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.warn('Failed to load voices:', error);
      this.voices = [];
    }
  }

  getVoices(): TTSVoice[] {
    return this.voices;
  }

  getVoicesForLanguage(language: string): TTSVoice[] {
    return this.voices.filter(v => v.language.startsWith(language.split('-')[0]));
  }

  getState(): TTSState {
    return { ...this.state };
  }

  addListener(listener: (state: TTSState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text.trim()) return;

    this.state.currentText = text;
    this.state.speaking = true;
    this.state.paused = false;
    this.state.progress = 0;
    this.notifyListeners();

    try {
      if (this.useNativeAudio) {
        await this.speakWithAudio(text, options);
      } else {
        await this.speakWithExpoSpeech(text, options);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      this.state.speaking = false;
      this.state.paused = false;
      this.notifyListeners();
      throw error;
    }
  }

  private async speakWithExpoSpeech(text: string, options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        voice: options.voice,
        rate: options.rate ?? 1.0,
        pitch: options.pitch ?? 1.0,
        volume: options.volume ?? 1.0,
        language: options.language,
        onStart: () => {
          this.state.speaking = true;
          this.notifyListeners();
        },
        onDone: () => {
          this.state.speaking = false;
          this.state.paused = false;
          this.state.progress = 1;
          this.currentText = '';
          this.notifyListeners();
          resolve();
        },
        onStopped: () => {
          this.state.speaking = false;
          this.state.paused = false;
          this.notifyListeners();
          resolve();
        },
        onError: (error) => {
          this.state.speaking = false;
          this.state.paused = false;
          this.notifyListeners();
          reject(error);
        },
      });
    });
  }

  private async speakWithAudio(text: string, options: TTSOptions): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `https://api.tts.example.com/speak?text=${encodeURIComponent(text)}&voice=${options.voice || 'default'}&rate=${options.rate || 1.0}` },
        { shouldPlay: true, rate: options.rate, volume: options.volume },
        (status) => {
          if (status.isLoaded) {
            this.state.progress = status.positionMillis / status.durationMillis;
            this.notifyListeners();
          }
          
          if (status.didJustFinish) {
            this.state.speaking = false;
            this.state.progress = 1;
            this.currentText = '';
            this.notifyListeners();
          }
        }
      );

      this.audioSound = sound;
    } catch (error) {
      console.error('Audio TTS failed:', error);
      throw error;
    }
  }

  async speakQueue(texts: string[], options: TTSOptions = {}): Promise<void> {
    this.state.queue = texts;
    this.currentIndex = 0;
    
    const speakNext = async () => {
      if (this.currentIndex >= this.state.queue.length) {
        this.state.speaking = false;
        this.state.queue = [];
        this.notifyListeners();
        return;
      }

      this.state.currentText = this.state.queue[this.currentIndex];
      this.notifyListeners();

      try {
        await this.speak(this.state.queue[this.currentIndex], options);
        this.currentIndex++;
        await speakNext();
      } catch (error) {
        console.error('Queue speak error:', error);
        this.currentIndex++;
        await speakNext();
      }
    };

    this.state.speaking = true;
    this.notifyListeners();
    await speakNext();
  }

  async pause(): Promise<void> {
    if (!this.state.speaking || this.state.paused) return;

    if (this.useNativeAudio && this.audioSound) {
      await this.audioSound.pauseAsync();
    } else {
      Speech.pause();
    }

    this.state.paused = true;
    this.notifyListeners();
  }

  async resume(): Promise<void> {
    if (!this.state.speaking || !this.state.paused) return;

    if (this.useNativeAudio && this.audioSound) {
      await this.audioSound.playAsync();
    } else {
      Speech.resume();
    }

    this.state.paused = false;
    this.notifyListeners();
  }

  async stop(): Promise<void> {
    this.state.speaking = false;
    this.state.paused = false;
    this.state.progress = 0;
    this.state.queue = [];
    this.currentIndex = 0;
    this.state.currentText = '';

    if (this.useNativeAudio && this.audioSound) {
      await this.audioSound.stopAsync();
      await this.audioSound.unloadAsync();
      this.audioSound = null;
    } else {
      Speech.stop();
    }

    this.notifyListeners();
  }

  async skip(): Promise<void> {
    if (this.state.queue.length > 0 && this.currentIndex < this.state.queue.length - 1) {
      await this.stop();
      this.currentIndex++;
      if (this.currentIndex < this.state.queue.length) {
        await this.speak(this.state.queue[this.currentIndex]);
      }
    }
  }

  setUseNativeAudio(use: boolean): void {
    this.useNativeAudio = use;
  }

  async setRate(rate: number): Promise<void> {
    if (this.useNativeAudio && this.audioSound) {
      await this.audioSound.setRateAsync(rate, false);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (this.useNativeAudio && this.audioSound) {
      await this.audioSound.setVolumeAsync(volume);
    }
  }

  destroy(): void {
    this.stop();
    this.listeners = [];
  }
}

export const ttsManager = TTSManager.getInstance();

export function useTTS(): {
  state: TTSState;
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  speakQueue: (texts: string[], options?: TTSOptions) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  skip: () => Promise<void>;
  voices: TTSVoice[];
} {
  const [state, setState] = useState<TTSState>(ttsManager.getState());
  const [voices, setVoices] = useState<TTSVoice[]>([]);

  useEffect(() => {
    const cleanup = ttsManager.addListener(setState);
    setVoices(ttsManager.getVoices());
    return cleanup;
  }, []);

  const speak = useCallback(async (text: string, options?: TTSOptions) => {
    await ttsManager.speak(text, options);
  }, []);

  const speakQueue = useCallback(async (texts: string[], options?: TTSOptions) => {
    await ttsManager.speakQueue(texts, options);
  }, []);

  const pause = useCallback(async () => {
    await ttsManager.pause();
  }, []);

  const resume = useCallback(async () => {
    await ttsManager.resume();
  }, []);

  const stop = useCallback(async () => {
    await ttsManager.stop();
  }, []);

  const skip = useCallback(async () => {
    await ttsManager.skip();
  }, []);

  return { state, speak, speakQueue, pause, resume, stop, skip, voices };
}

export function useTTSForText(text: string, options: TTSOptions = {}): {
  speak: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  speaking: boolean;
  paused: boolean;
  progress: number;
} {
  const { state, speak, pause, resume, stop } = useTTS();

  const handleSpeak = useCallback(() => speak(text, options), [text, options, speak]);

  return {
    speak: handleSpeak,
    pause,
    resume,
    stop,
    speaking: state.speaking && state.currentText === text,
    paused: state.paused && state.currentText === text,
    progress: state.currentText === text ? state.progress : 0,
  };
}

export function useTTSForHighlights(highlights: string[], options: TTSOptions = {}): {
  speakAll: () => Promise<void>;
  speakFrom: (index: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  skip: () => Promise<void>;
  speaking: boolean;
  currentIndex: number;
} {
  const { state, speakQueue, pause, resume, stop, skip } = useTTS();

  const speakAll = useCallback(() => speakQueue(highlights, options), [highlights, options, speakQueue]);
  const speakFrom = useCallback(async (index: number) => {
    await speakQueue(highlights.slice(index), options);
  }, [highlights, options, speakQueue]);

  return {
    speakAll,
    speakFrom,
    pause,
    resume,
    stop,
    skip,
    speaking: state.speaking,
    currentIndex: 0, // Would need to track from manager
  };
}