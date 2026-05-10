import type { LoginJson, RegisterJson } from '../types/models';
import { apiClient } from './client';

// TODO: replace unknown with the actual server response type
export const authApi = {
  async login(credentials: LoginJson): Promise<unknown> {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  },

  async register(userData: RegisterJson): Promise<unknown> {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },
};
