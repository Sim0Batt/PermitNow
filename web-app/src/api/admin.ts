import { apiClient } from './client';
import type { UserListItem } from '../types/models';

export const adminApi = {
  async listUsers(): Promise<UserListItem[]> {
    const response = await apiClient.get<UserListItem[]>('/user/list');
    return response.data;
  },

  async verifyUser(userId: string): Promise<void> {
    await apiClient.post(`/user/${userId}/verify`);
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/user/${userId}`);
  },
};
