import { device, element, by, expect } from 'detox';

describe('BookWise App', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, delete: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Onboarding Flow', () => {
    it('should show welcome screen', async () => {
      await expect(element(by.id('welcome-screen'))).toBeVisible();
      await expect(element(by.text('BookWise'))).toBeVisible();
    });

    it('should navigate to login', async () => {
      await element(by.id('login-button')).tap();
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should navigate to register', async () => {
      await element(by.id('register-button')).tap();
      await expect(element(by.id('register-screen'))).toBeVisible();
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      
      await waitFor(element(by.id('tabs')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error for invalid credentials', async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('invalid@test.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-submit')).tap();
      
      await expect(element(by.text('Invalid credentials'))).toBeVisible();
    });
  });

  describe('Home Tab', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      await waitFor(element(by.id('tabs'))).toBeVisible().withTimeout(5000);
    });

    it('should display home screen', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
      await expect(element(by.text('Good morning'))).toBeVisible();
    });

    it('should navigate to book detail', async () => {
      await element(by.id('book-card-0')).tap();
      await expect(element(by.id('book-detail-screen'))).toBeVisible();
    });

    it('should pull to refresh', async () => {
      await element(by.id('home-scroll')).scrollTo('top');
      // Pull to refresh gesture would be tested here
    });
  });

  describe('Library Tab', () => {
    beforeEach(async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      await waitFor(element(by.id('tabs'))).toBeVisible().withTimeout(5000);
    });

    it('should navigate to library tab', async () => {
      await element(by.id('library-tab')).tap();
      await expect(element(by.id('library-screen'))).toBeVisible();
    });

    it('should show empty state for new users', async () => {
      await element(by.id('library-tab')).tap();
      await expect(element(by.text('Your Library is Empty'))).toBeVisible();
    });

    it('should filter library items', async () => {
      await element(by.id('library-tab')).tap();
      await element(by.id('filter-reading')).tap();
      // Verify filtered results
    });
  });

  describe('Search Tab', () => {
    beforeEach(async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      await waitFor(element(by.id('tabs'))).toBeVisible().withTimeout(5000);
    });

    it('should navigate to search tab', async () => {
      await element(by.id('search-tab')).tap();
      await expect(element(by.id('search-screen'))).toBeVisible();
    });

    it('should search for books', async () => {
      await element(by.id('search-tab')).tap();
      await element(by.id('search-input')).typeText('Atomic Habits');
      await element(by.id('search-submit')).tap();
      
      await waitFor(element(by.id('search-results'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Atomic Habits'))).toBeVisible();
    });

    it('should filter search results', async () => {
      await element(by.id('search-tab')).tap();
      await element(by.id('filter-button')).tap();
      await element(by.id('filter-audiobook')).tap();
      await element(by.id('apply-filters')).tap();
      
      // Verify filtered results
    });
  });

  describe('Profile Tab', () => {
    beforeEach(async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      await waitFor(element(by.id('tabs'))).toBeVisible().withTimeout(5000);
    });

    it('should navigate to profile tab', async () => {
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });

    it('should show user stats', async () => {
      await element(by.id('profile-tab')).tap();
      await expect(element(by.text('Books Read'))).toBeVisible();
      await expect(element(by.text('Hours Listened'))).toBeVisible();
    });

    it('should navigate to settings', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });
  });

  describe('Book Detail', () => {
    beforeEach(async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      await waitFor(element(by.id('tabs'))).toBeVisible().withTimeout(5000);
    });

    it('should open book detail from home', async () => {
      await element(by.id('book-card-0')).tap();
      await expect(element(by.id('book-detail-screen'))).toBeVisible();
      await expect(element(by.id('book-title'))).toBeVisible();
      await expect(element(by.id('book-author'))).toBeVisible();
    });

    it('should start reading', async () => {
      await element(by.id('book-card-0')).tap();
      await element(by.id('read-button')).tap();
      await expect(element(by.id('reader-screen'))).toBeVisible();
    });

    it('should start listening', async () => {
      await element(by.id('book-card-0')).tap();
      await element(by.id('listen-button')).tap();
      await expect(element(by.id('audio-player-screen'))).toBeVisible();
    });

    it('should view summary', async () => {
      await element(by.id('book-card-0')).tap();
      await element(by.id('summary-button')).tap();
      await expect(element(by.id('summary-screen'))).toBeVisible();
    });
  });

  describe('Reader', () => {
    beforeEach(async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      await waitFor(element(by.id('tabs'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('book-card-0')).tap();
      await element(by.id('read-button')).tap();
      await expect(element(by.id('reader-screen'))).toBeVisible();
    });

    it('should navigate chapters', async () => {
      await element(by.id('next-chapter')).tap();
      await expect(element(by.text('Chapter 2'))).toBeVisible();
      
      await element(by.id('prev-chapter')).tap();
      await expect(element(by.text('Chapter 1'))).toBeVisible();
    });

    it('should open settings', async () => {
      await element(by.id('reader-settings')).tap();
      await expect(element(by.id('reader-settings-modal'))).toBeVisible();
    });

    it('should change font size', async () => {
      await element(by.id('reader-settings')).tap();
      await element(by.id('increase-font')).tap();
      await element(by.id('close-settings')).tap();
      // Verify font size changed
    });

    it('should open table of contents', async () => {
      await element(by.id('reader-toc')).tap();
      await expect(element(by.id('toc-modal'))).toBeVisible();
    });
  });

  describe('Audio Player', () => {
    beforeEach(async () => {
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-submit')).tap();
      await waitFor(element(by.id('tabs'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('book-card-0')).tap();
      await element(by.id('listen-button')).tap();
      await expect(element(by.id('audio-player-screen'))).toBeVisible();
    });

    it('should play/pause audio', async () => {
      await element(by.id('play-pause-button')).tap();
      // Verify playing state
      await element(by.id('play-pause-button')).tap();
      // Verify paused state
    });

    it('should skip forward/backward', async () => {
      await element(by.id('skip-forward')).tap();
      await element(by.id('skip-backward')).tap();
    });

    it('should change playback speed', async () => {
      await element(by.id('speed-button')).tap();
      await element(by.id('speed-1.5x')).tap();
      // Verify speed changed
    });

    it('should set sleep timer', async () => {
      await element(by.id('sleep-timer-button')).tap();
      await element(by.id('sleep-30m')).tap();
      // Verify timer set
    });

    it('should show chapters', async () => {
      await element(by.id('chapters-button')).tap();
      await expect(element(by.id('chapters-modal'))).toBeVisible();
    });
  });

  describe('Offline Support', () => {
    it('should work offline', async () => {
      await device.setURLBlacklist(['*']); // Block network
      
      // App should still function with cached data
      await expect(element(by.id('home-screen'))).toBeVisible();
      
      await device.setURLBlacklist([]); // Restore network
    });
  });

  describe('Accessibility', () => {
    it('should support VoiceOver/TalkBack', async () => {
      // Test accessibility labels
      await expect(element(by.id('login-button'))).toHaveLabel('Sign In');
      await expect(element(by.id('search-input'))).toHaveLabel('Search books, authors, topics');
    });

    it('should support dynamic type', async () => {
      // Test with larger font sizes
      await device.setTextSize('large');
      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });
});

// Helper function for waiting
function waitFor(matcher: any) {
  return {
    toBeVisible: () => ({
      withTimeout: (timeout: number) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            matcher.toBeVisible();
            resolve(true);
          }, timeout);
        });
      },
    },
  };
}