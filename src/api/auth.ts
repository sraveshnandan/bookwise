import { apiClient, setAuthToken } from './books';
import { User, ApiResponse, AuthTokens, OnboardingData } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { user, tokens } = response.data.data;
    setAuthToken(tokens.accessToken);
    return { user, tokens };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { user, tokens } = response.data.data;
    setAuthToken(tokens.accessToken);
    return { user, tokens };
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    setAuthToken(null);
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    const tokens = response.data.data;
    setAuthToken(tokens.accessToken);
    return tokens;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/auth/profile', data);
    return response.data.data;
  },

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<User['preferences']> {
    const response = await apiClient.patch<ApiResponse<User['preferences']>>('/auth/preferences', preferences);
    return response.data.data;
  },

  async completeOnboarding(data: OnboardingData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/onboarding', data);
    return response.data.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password/reset', { email });
  },

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/password/confirm', { token, password });
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/auth/account');
    setAuthToken(null);
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/email/verify', { token });
  },

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/email/resend');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password/change', { currentPassword, newPassword });
  },

  async linkProvider(provider: 'google' | 'apple', token: string): Promise<void> {
    await apiClient.post('/auth/link', { provider, token });
  },

  async unlinkProvider(provider: 'google' | 'apple'): Promise<void> {
    await apiClient.delete(`/auth/unlink/${provider}`);
  },
};

export const socialAuth = {
  async googleSignIn(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/social/google', { idToken });
    const { user, tokens } = response.data.data;
    setAuthToken(tokens.accessToken);
    return { user, tokens };
  },

  async appleSignIn(identityToken: string, authorizationCode: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/social/apple', { 
      identityToken, 
      authorizationCode 
    });
    const { user, tokens } = response.data.data;
    setAuthToken(tokens.accessToken);
    return { user, tokens };
  },
};