import type { LoginJson, RegisterJson } from '../types/models';
import { apiClient } from './client';

export interface LoginResponse {
  userId: string;
  verified: boolean;
}

export const authApi = {
  async login(credentials: LoginJson): Promise<LoginResponse | string> {
    const response = await apiClient.post<LoginResponse | string>('/login', credentials);
    return response.data;
  },

  async adminLogin(credentials: LoginJson): Promise<string> {
    const response = await apiClient.post<string>('/login/admin', credentials);
    return response.data;
  },

  async register(userData: RegisterJson): Promise<unknown> {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/logout');
  },
};
