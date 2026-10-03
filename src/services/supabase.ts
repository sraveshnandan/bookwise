import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const supabaseAdmin = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const AuthService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signInWithOAuth(provider: 'google' | 'apple') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'bookwise://auth/callback',
      },
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'bookwise://reset-password',
    });
    return { data, error };
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  },

  async updateProfile(updates: { name?: string; avatar_url?: string }) {
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    return { data, error };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export const SyncService = {
  async syncReadingProgress(userId: string, progress: any) {
    const { data, error } = await supabase
      .from('reading_progress')
      .upsert({
        user_id: userId,
        book_id: progress.bookId,
        chapter_index: progress.chapterIndex,
        chapter_progress: progress.chapterProgress,
        page_number: progress.pageNumber,
        audio_position: progress.audioPosition,
        cfi: progress.cfi,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,book_id',
      });
    return { data, error };
  },

  async getReadingProgress(userId: string, bookId: string) {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    return { data, error };
  },

  async syncHighlights(userId: string, highlights: any[]) {
    const { data, error } = await supabase
      .from('highlights')
      .upsert(highlights.map(h => ({
        user_id: userId,
        book_id: h.bookId,
        content: h.content,
        note: h.note,
        color: h.color,
        position: h.position,
        created_at: h.createdAt,
        updated_at: h.updatedAt,
      })));
    return { data, error };
  },

  async getHighlights(userId: string, bookId?: string) {
    let query = supabase
      .from('highlights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (bookId) {
      query = query.eq('book_id', bookId);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  async syncBookmarks(userId: string, bookmarks: any[]) {
    const { data, error } = await supabase
      .from('bookmarks')
      .upsert(bookmarks.map(b => ({
        user_id: userId,
        book_id: b.bookId,
        position: b.position,
        title: b.title,
        note: b.note,
        created_at: b.createdAt,
      })));
    return { data, error };
  },

  async getBookmarks(userId: string, bookId?: string) {
    let query = supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (bookId) {
      query = query.eq('book_id', bookId);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  async syncLibrary(userId: string, library: any[]) {
    const { data, error } = await supabase
      .from('user_library')
      .upsert(library.map(item => ({
        user_id: userId,
        book_id: item.bookId,
        progress: item.progress,
        current_position: item.currentPosition,
        last_read_at: item.lastReadAt,
        downloaded_formats: item.downloadedFormats,
        is_purchased: item.isPurchased,
        is_favorite: item.isFavorite,
        rating: item.rating,
        review: item.review,
        tags: item.tags,
        reading_goal: item.readingGoal,
        updated_at: new Date().toISOString(),
      })));
    return { data, error };
  },

  async getLibrary(userId: string) {
    const { data, error } = await supabase
      .from('user_library')
      .select(`
        *,
        books (*)
      `)
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false });
    return { data, error };
  },

  async syncStats(userId: string, stats: any) {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        ...stats,
        updated_at: new Date().toISOString(),
      });
    return { data, error };
  },

  async getStats(userId: string) {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },
};

export const StorageService = {
  async uploadFile(bucket: string, path: string, file: Blob | ArrayBuffer) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: 'application/octet-stream',
        upsert: true,
      });
    return { data, error };
  },

  async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async createSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    return { data, error };
  },

  async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },

  async listFiles(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    return { data, error };
  },
};

export const RealtimeService = {
  subscribeToReadingProgress(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`reading_progress:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reading_progress',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe();
  },

  subscribeToLibrary(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`library:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_library',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe();
  },

  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  },
};