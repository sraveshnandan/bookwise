import {
  formatDuration,
  formatDurationLong,
  formatTime,
  formatFileSize,
  formatNumber,
  formatDate,
  formatRelativeTime,
  truncate,
  slugify,
  capitalize,
  titleCase,
  generateId,
  debounce,
  throttle,
  clamp,
  lerp,
  range,
  chunk,
  unique,
  groupBy,
  sortBy,
  sleep,
  retry,
  isValidEmail,
  isValidUrl,
  parseQueryString,
  buildQueryString,
} from '@/utils/formatters';

describe('formatters', () => {
  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('formats minutes correctly', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(3600)).toBe('1h 0m');
    });

    it('formats hours correctly', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(7200)).toBe('2h 0m');
      expect(formatDuration(3661)).toBe('1h 1m');
    });
  });

  describe('formatDurationLong', () => {
    it('formats with full words', () => {
      expect(formatDurationLong(3661)).toBe('1 hour 1 minute 1 second');
      expect(formatDurationLong(7200)).toBe('2 hours');
      expect(formatDurationLong(45)).toBe('45 seconds');
    });
  });

  describe('formatTime', () => {
    it('formats time in HH:MM:SS', () => {
      expect(formatTime(3661)).toBe('01:01:01');
      expect(formatTime(3600)).toBe('01:00:00');
      expect(formatTime(61)).toBe('01:01');
    });

    it('formats without hours when showHours is false', () => {
      expect(formatTime(61, false)).toBe('01:01');
      expect(formatTime(3661, false)).toBe('61:01');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('formatNumber', () => {
    it('formats large numbers with suffixes', () => {
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(1500000)).toBe('1.5M');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2024');
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time correctly', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
      
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1m ago');
      
      const oneHourAgo = new Date(now.getTime() - 3600000);
      expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
      
      const oneDayAgo = new Date(now.getTime() - 86400000);
      expect(formatRelativeTime(oneDayAgo)).toBe('1d ago');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('uses custom suffix', () => {
      expect(truncate('Hello World', 8, '>>')).toBe('Hello>>');
    });
  });

  describe('slugify', () => {
    it('creates URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello@World!')).toBe('hello-world');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(slugify('UPPERCASE')).toBe('uppercase');
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('h')).toBe('H');
    });
  });

  describe('titleCase', () => {
    it('converts to title case', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('THE QUICK BROWN FOX')).toBe('The Quick Brown Fox');
      expect(titleCase('hello-world')).toBe('Hello-World');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBe(9);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('delays function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn();
      expect(fn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('only calls once for multiple rapid calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('limits function execution rate', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(fn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('clamp', () => {
    it('clamps values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('interpolates between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 100, 0.25)).toBe(25);
      expect(lerp(10, 20, 0)).toBe(10);
      expect(lerp(10, 20, 1)).toBe(20);
    });
  });

  describe('range', () => {
    it('generates number ranges', () => {
      expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
      expect(range(1, 6)).toEqual([1, 2, 3, 4, 5]);
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
    });
  });

  describe('chunk', () => {
    it('chunks arrays correctly', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
      expect(chunk([], 2)).toEqual([]);
    });
  });

  describe('unique', () => {
    it('removes duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });
  });

  describe('groupBy', () => {
    it('groups objects by key', () => {
      const items = [
        { category: 'fruit', name: 'apple' },
        { category: 'vegetable', name: 'carrot' },
        { category: 'fruit', name: 'banana' },
      ];
      
      const grouped = groupBy(items, 'category');
      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });

    it('groups by function', () => {
      const items = [1, 2, 3, 4, 5, 6];
      const grouped = groupBy(items, (n) => n % 2 === 0 ? 'even' : 'odd');
      expect(grouped.even).toEqual([2, 4, 6]);
      expect(grouped.odd).toEqual([1, 3, 5]);
    });
  });

  describe('sortBy', () => {
    it('sorts by key ascending', () => {
      const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
      expect(sortBy(items, 'value')).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    it('sorts by key descending', () => {
      const items = [{ value: 1 }, { value: 3 }, { value: 2 }];
      expect(sortBy(items, 'value', 'desc')).toEqual([{ value: 3 }, { value: 2 }, { value: 1 }]);
    });

    it('sorts by function', () => {
      const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      expect(sortBy(items, (item) => item.name)).toEqual([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ]);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('resolves after specified time', async () => {
      const promise = sleep(100);
      jest.advanceTimersByTime(100);
      await promise;
    });
  });

  describe('retry', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('retries on failure', async () => {
      let attempts = 0;
      const fn = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) throw new Error('Fail');
        return 'success';
      });

      const promise = retry(fn, 3, 100);
      jest.advanceTimersByTime(300);
      const result = await promise;
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('throws after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));
      
      await expect(retry(fn, 2, 100)).rejects.toThrow('Fail');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isValidEmail', () => {
    it('validates email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('validates URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true);
    });
  });

  describe('parseQueryString', () => {
    it('parses query strings', () => {
      expect(parseQueryString('a=1&b=2')).toEqual({ a: '1', b: '2' });
      expect(parseQueryString('?a=1&b=2')).toEqual({ a: '1', b: '2' });
      expect(parseQueryString('')).toEqual({});
    });
  });

  describe('buildQueryString', () => {
    it('builds query strings', () => {
      expect(buildQueryString({ a: 1, b: 2 })).toBe('a=1&b=2');
      expect(buildQueryString({ a: 1, b: null })).toBe('a=1');
      expect(buildQueryString({ a: 1, b: undefined })).toBe('a=1');
      expect(buildQueryString({ a: 1, b: '' })).toBe('a=1');
    });
  });
});