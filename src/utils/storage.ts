import * as FileSystem from 'expo-file-system';
import { DOWNLOAD_CONFIG } from '@/constants/app';

export const STORAGE_PATHS = {
  documents: FileSystem.documentDirectory!,
  cache: FileSystem.cacheDirectory!,
  downloads: `${FileSystem.documentDirectory!}downloads/`,
  books: `${FileSystem.documentDirectory!}books/`,
  audiobooks: `${FileSystem.documentDirectory!}audiobooks/`,
  summaries: `${FileSystem.documentDirectory!}summaries/`,
  covers: `${FileSystem.documentDirectory!}covers/`,
  temp: `${FileSystem.cacheDirectory!}temp/`,
} as const;

export async function ensureDirectories(): Promise<void> {
  const directories = Object.values(STORAGE_PATHS);
  await Promise.all(
    directories.map((dir) =>
      FileSystem.makeDirectoryAsync(dir, { intermediates: true })
    )
  );
}

export async function getFileInfo(uri: string): Promise<FileSystem.FileInfo | null> {
  try {
    return await FileSystem.getInfoAsync(uri);
  } catch {
    return null;
  }
}

export async function fileExists(uri: string): Promise<boolean> {
  const info = await getFileInfo(uri);
  return info?.exists ?? false;
}

export async function getFileSize(uri: string): Promise<number> {
  const info = await getFileInfo(uri);
  return info?.size ?? 0;
}

export async function deleteFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

export async function moveFile(from: string, to: string): Promise<void> {
  await FileSystem.moveAsync({ from, to });
}

export async function copyFile(from: string, to: string): Promise<void> {
  await FileSystem.copyAsync({ from, to });
}

export async function readFile(uri: string, encoding: FileSystem.EncodingType = 'utf8'): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding });
}

export async function writeFile(uri: string, content: string, encoding: FileSystem.EncodingType = 'utf8'): Promise<void> {
  await FileSystem.writeAsStringAsync(uri, content, { encoding });
}

export async function downloadFile(
  url: string,
  destination: string,
  onProgress?: (progress: number, totalBytes: number, downloadedBytes: number) => void
): Promise<FileSystem.DownloadResult> {
  return FileSystem.downloadAsync(url, destination, {
    headers: {
      'User-Agent': 'BookWise/1.0',
    },
    md5: false,
    cache: false,
    progressCallback: onProgress
      ? ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const progress = totalBytesExpectedToWrite > 0
            ? totalBytesWritten / totalBytesExpectedToWrite
            : 0;
          onProgress(progress, totalBytesExpectedToWrite, totalBytesWritten);
        }
      : undefined,
  });
}

export async function downloadWithResume(
  url: string,
  destination: string,
  resumeData?: string,
  onProgress?: (progress: number, totalBytes: number, downloadedBytes: number) => void
): Promise<{ result: FileSystem.DownloadResult; resumeData?: string }> {
  // Note: expo-file-system doesn't natively support resume
  // This would need a custom implementation or native module
  const result = await downloadFile(url, destination, onProgress);
  return { result };
}

export async function getStorageUsage(path: string = STORAGE_PATHS.documents): Promise<{
  used: number;
  available: number;
  total: number;
}> {
  try {
    const info = await FileSystem.getFreeDiskStorageAsync();
    // This is a simplified version - in reality you'd need to calculate used space
    const total = 1024 * 1024 * 1024; // 1GB estimate
    const available = info;
    const used = total - available;
    
    return { used, available, total };
  } catch {
    return { used: 0, available: 0, total: 0 };
  }
}

export async function getDirectorySize(path: string): Promise<number> {
  try {
    const files = await FileSystem.readDirectoryAsync(path);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = `${path}${file}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        if (info.isDirectory) {
          totalSize += await getDirectorySize(`${filePath}/`);
        } else {
          totalSize += info.size || 0;
        }
      }
    }
    
    return totalSize;
  } catch {
    return 0;
  }
}

export async function cleanupTempFiles(maxAgeHours = 24): Promise<number> {
  try {
    const tempDir = STORAGE_PATHS.temp;
    const files = await FileSystem.readDirectoryAsync(tempDir);
    let deletedCount = 0;
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    
    for (const file of files) {
      const filePath = `${tempDir}${file}`;
      const info = await FileSystem.getInfoAsync(filePath);
      
      if (info.exists && info.modificationTime) {
        const age = now - info.modificationTime * 1000;
        if (age > maxAgeMs) {
          await deleteFile(filePath);
          deletedCount++;
        }
      }
    }
    
    return deletedCount;
  } catch {
    return 0;
  }
}

export function getBookPath(bookId: string, format: 'epub' | 'pdf'): string {
  return `${STORAGE_PATHS.books}${bookId}.${format}`;
}

export function getAudiobookPath(bookId: string): string {
  return `${STORAGE_PATHS.audiobooks}${bookId}/`;
}

export function getSummaryPath(bookId: string, format: 'text' | 'pdf' | 'audio'): string {
  const ext = format === 'text' ? 'json' : format === 'pdf' ? 'pdf' : 'mp3';
  return `${STORAGE_PATHS.summaries}${bookId}.${ext}`;
}

export function getCoverPath(bookId: string): string {
  return `${STORAGE_PATHS.covers}${bookId}.jpg`;
}

export async function ensureBookDirectory(bookId: string): Promise<string> {
  const dir = `${STORAGE_PATHS.books}${bookId}/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

export async function ensureAudiobookDirectory(bookId: string): Promise<string> {
  const dir = getAudiobookPath(bookId);
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}