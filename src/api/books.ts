import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError, Book, SearchFilters, SearchResult, PaginatedResponse } from '@/types';

const createApiClient = (baseUrl: string, defaultParams?: Record<string, string>): AxiosInstance => {
  const client = axios.create({
    baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    params: defaultParams,
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      console.error(`[API Error] ${error.config?.url}:`, message);
      return Promise.reject({
        code: error.code || 'UNKNOWN_ERROR',
        message,
        details: error.response?.data,
        statusCode: error.response?.status || 500,
      } as ApiError);
    }
  );

  return client;
};

export const googleBooksClient = createApiClient('https://www.googleapis.com/books/v1', {
  key: process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY,
});

export const openLibraryClient = createApiClient('https://openlibrary.org');

export const gutenbergClient = createApiClient('https://gutendex.com');

export const librivoxClient = createApiClient('https://librivox.org/api');

export const apiClient = createApiClient(process.env.EXPO_PUBLIC_API_URL || 'https://api.bookwise.app');

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const searchGoogleBooks = async (filters: SearchFilters): Promise<SearchResult> => {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('q', filters.query);
  if (filters.genres?.length) params.append('subject', filters.genres.join(' '));
  if (filters.languages?.length) params.append('langRestrict', filters.languages.join(','));
  if (filters.price === 'free') params.append('filter', 'free-ebooks');
  if (filters.price === 'paid') params.append('filter', 'paid-ebooks');
  
  params.append('maxResults', String(filters.limit || 40));
  params.append('startIndex', String(((filters.page || 1) - 1) * (filters.limit || 40)));
  
  if (filters.sortBy === 'newest') params.append('orderBy', 'newest');
  else if (filters.sortBy === 'relevance') params.append('orderBy', 'relevance');

  const response = await googleBooksClient.get<{ items: any[]; totalItems: number }>('/volumes', { params });
  
  const books = (response.data.items || []).map(mapGoogleBookToBook);
  return {
    books,
    total: response.data.totalItems,
    page: filters.page || 1,
    limit: filters.limit || 40,
    hasMore: books.length === (filters.limit || 40),
  };
};

export const getGoogleBookById = async (id: string): Promise<Book | null> => {
  try {
    const response = await googleBooksClient.get(`/volumes/${id}`);
    return mapGoogleBookToBook(response.data);
  } catch {
    return null;
  }
};

export const searchOpenLibrary = async (filters: SearchFilters): Promise<SearchResult> => {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('q', filters.query);
  if (filters.genres?.length) params.append('subject', filters.genres.join(' '));
  if (filters.languages?.length) params.append('language', filters.languages.join(','));
  
  params.append('limit', String(filters.limit || 40));
  params.append('offset', String(((filters.page || 1) - 1) * (filters.limit || 40)));
  
  if (filters.sortBy === 'newest') params.append('sort', 'new');
  else if (filters.sortBy === 'popular') params.append('sort', 'rating');
  else params.append('sort', 'relevance');

  const response = await openLibraryClient.get<{ docs: any[]; numFound: number }>('/search.json', { params });
  
  const books = (response.data.docs || []).map(mapOpenLibraryBookToBook);
  return {
    books,
    total: response.data.numFound,
    page: filters.page || 1,
    limit: filters.limit || 40,
    hasMore: books.length === (filters.limit || 40),
  };
};

export const getOpenLibraryBookById = async (id: string): Promise<Book | null> => {
  try {
    const response = await openLibraryClient.get(`/works/${id}.json`);
    return mapOpenLibraryWorkToBook(response.data);
  } catch {
    return null;
  }
};

export const getOpenLibraryCover = (key: string, size: 'S' | 'M' | 'L' = 'M'): string => {
  return `https://covers.openlibrary.org/b/${key}-${size}.jpg`;
};

export const searchGutenberg = async (filters: SearchFilters): Promise<SearchResult> => {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('search', filters.query);
  if (filters.languages?.length) params.append('languages', filters.languages.join(','));
  if (filters.genres?.length) params.append('topic', filters.genres.join(','));
  
  params.append('limit', String(filters.limit || 40));
  params.append('page', String(filters.page || 1));

  const response = await gutenbergClient.get<{ results: any[]; count: number }>('/books', { params });
  
  const books = (response.data.results || []).map(mapGutenbergBookToBook);
  return {
    books,
    total: response.data.count,
    page: filters.page || 1,
    limit: filters.limit || 40,
    hasMore: books.length === (filters.limit || 40),
  };
};

export const searchLibrivox = async (filters: SearchFilters): Promise<SearchResult> => {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('q', filters.query);
  if (filters.genres?.length) params.append('genre', filters.genres.join(','));
  if (filters.languages?.length) params.append('language', filters.languages.join(','));
  
  params.append('limit', String(filters.limit || 40));
  params.append('offset', String(((filters.page || 1) - 1) * (filters.limit || 40)));
  params.append('format', 'json');

  const response = await librivoxClient.get<{ books: any[]; total: number }>('', { params });
  
  const books = (response.data.books || []).map(mapLibrivoxBookToBook);
  return {
    books,
    total: response.data.total,
    page: filters.page || 1,
    limit: filters.limit || 40,
    hasMore: books.length === (filters.limit || 40),
  };
};

function mapGoogleBookToBook(data: any): Book {
  const volumeInfo = data.volumeInfo || {};
  const saleInfo = data.saleInfo || {};
  const accessInfo = data.accessInfo || {};
  
  const imageLinks = volumeInfo.imageLinks || {};
  const coverUrl = imageLinks.thumbnail?.replace('http:', 'https:') || imageLinks.smallThumbnail?.replace('http:', 'https:');
  
  return {
    id: data.id,
    title: volumeInfo.title || 'Unknown Title',
    subtitle: volumeInfo.subtitle,
    author: volumeInfo.authors?.[0] || 'Unknown Author',
    authors: volumeInfo.authors,
    coverUrl,
    coverUrls: {
      small: imageLinks.smallThumbnail?.replace('http:', 'https:'),
      medium: imageLinks.thumbnail?.replace('http:', 'https:'),
      large: imageLinks.large?.replace('http:', 'https:') || imageLinks.thumbnail?.replace('http:', 'https:'),
    },
    description: volumeInfo.description,
    genres: volumeInfo.categories || [],
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    language: volumeInfo.language || 'en',
    isbn10: volumeInfo.industryIdentifiers?.find((i: any) => i.type === 'ISBN_10')?.identifier,
    isbn13: volumeInfo.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier,
    publisher: volumeInfo.publisher,
    maturityRating: volumeInfo.maturityRating,
    averageRating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount,
    previewUrl: volumeInfo.previewLink,
    infoLink: volumeInfo.infoLink,
    canonicalVolumeLink: volumeInfo.canonicalVolumeLink,
    googleBooksId: data.id,
    hasEpub: accessInfo.epub?.isAvailable || false,
    hasPdf: accessInfo.pdf?.isAvailable || false,
    hasAudiobook: false,
    hasSummary: false,
    isFree: saleInfo.saleability === 'FREE',
    price: saleInfo.listPrice?.amount,
    salePrice: saleInfo.retailPrice?.amount,
    currency: saleInfo.listPrice?.currencyCode || 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapOpenLibraryBookToBook(data: any): Book {
  const coverId = data.cover_i || data.cover_key || data.ia_id;
  
  return {
    id: `ol-${data.key?.replace('/works/', '') || data.id}`,
    title: data.title || 'Unknown Title',
    subtitle: data.subtitle,
    author: data.author_name?.[0] || 'Unknown Author',
    authors: data.author_name,
    coverUrl: coverId ? getOpenLibraryCover(`id/${coverId}`, 'M') : undefined,
    coverUrls: coverId ? {
      small: getOpenLibraryCover(`id/${coverId}`, 'S'),
      medium: getOpenLibraryCover(`id/${coverId}`, 'M'),
      large: getOpenLibraryCover(`id/${coverId}`, 'L'),
    } : undefined,
    description: typeof data.description === 'string' ? data.description : data.description?.value,
    genres: data.subject || [],
    publishedDate: data.first_publish_year?.toString(),
    pageCount: data.number_of_pages_median,
    language: data.language?.[0] || 'en',
    isbn10: data.isbn?.[0],
    isbn13: data.isbn?.[1],
    publisher: data.publisher?.[0],
    openLibraryId: data.key?.replace('/works/', ''),
    openLibraryKey: data.key,
    hasEpub: data.ebook_access === 'borrow' || data.ebook_access === 'read',
    hasPdf: false,
    hasAudiobook: false,
    hasSummary: false,
    isFree: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapOpenLibraryWorkToBook(data: any): Book {
  const coverId = data.covers?.[0];
  
  return {
    id: `ol-${data.key?.replace('/works/', '')}`,
    title: data.title || 'Unknown Title',
    subtitle: data.subtitle,
    author: data.authors?.[0]?.name || 'Unknown Author',
    authors: data.authors?.map((a: any) => a.name),
    coverUrl: coverId ? getOpenLibraryCover(`id/${coverId}`, 'M') : undefined,
    coverUrls: coverId ? {
      small: getOpenLibraryCover(`id/${coverId}`, 'S'),
      medium: getOpenLibraryCover(`id/${coverId}`, 'M'),
      large: getOpenLibraryCover(`id/${coverId}`, 'L'),
    } : undefined,
    description: typeof data.description === 'string' ? data.description : data.description?.value,
    genres: data.subjects || [],
    publishedDate: data.first_publish_date?.[0],
    pageCount: data.number_of_pages,
    language: 'en',
    openLibraryId: data.key?.replace('/works/', ''),
    openLibraryKey: data.key,
    hasEpub: data.ebooks?.some((e: any) => e.format === 'epub') || false,
    hasPdf: data.ebooks?.some((e: any) => e.format === 'pdf') || false,
    hasAudiobook: false,
    hasSummary: false,
    isFree: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapGutenbergBookToBook(data: any): Book {
  const coverUrl = data.formats?.['image/jpeg'] || data.formats?.['image/png'];
  
  return {
    id: `gutenberg-${data.id}`,
    title: data.title || 'Unknown Title',
    author: data.authors?.[0]?.name || 'Unknown Author',
    authors: data.authors?.map((a: any) => a.name),
    coverUrl,
    coverUrls: coverUrl ? { medium: coverUrl } : undefined,
    description: data.summaries?.[0],
    genres: data.subjects || [],
    publishedDate: data.copyright_year?.toString(),
    language: data.languages?.[0] || 'en',
    gutenbergId: data.id.toString(),
    hasEpub: !!data.formats?.['application/epub+zip'],
    hasPdf: false,
    hasAudiobook: false,
    hasSummary: false,
    isFree: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapLibrivoxBookToBook(data: any): Book {
  return {
    id: `librivox-${data.id}`,
    title: data.title || 'Unknown Title',
    author: data.author || 'Unknown Author',
    authors: [data.author].filter(Boolean),
    coverUrl: data.cover_url,
    coverUrls: data.cover_url ? { medium: data.cover_url } : undefined,
    description: data.description,
    genres: data.genres?.split(',').map((g: string) => g.trim()) || [],
    publishedDate: data.published_date,
    language: data.language || 'en',
    librivoxId: data.id.toString(),
    hasEpub: false,
    hasPdf: false,
    hasAudiobook: true,
    hasSummary: false,
    isFree: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const searchAllSources = async (filters: SearchFilters): Promise<SearchResult> => {
  const [googleBooks, openLibrary, gutenberg, librivox] = await Promise.allSettled([
    searchGoogleBooks(filters),
    searchOpenLibrary(filters),
    filters.formats?.includes('audiobook') ? searchLibrivox(filters) : Promise.resolve({ books: [], total: 0, page: 1, limit: filters.limit || 40, hasMore: false }),
    searchGutenberg(filters),
  ]);

  const allBooks: Book[] = [];
  const seenIds = new Set<string>();

  for (const result of [googleBooks, openLibrary, gutenberg, librivox]) {
    if (result.status === 'fulfilled') {
      for (const book of result.value.books) {
        const dedupeKey = book.isbn13 || book.googleBooksId || book.openLibraryId || book.gutenbergId || book.librivoxId || book.id;
        if (!seenIds.has(dedupeKey)) {
          seenIds.add(dedupeKey);
          allBooks.push(book);
        }
      }
    }
  }

  return {
    books: allBooks.slice(0, filters.limit || 40),
    total: allBooks.length,
    page: filters.page || 1,
    limit: filters.limit || 40,
    hasMore: allBooks.length > (filters.limit || 40),
  };
};