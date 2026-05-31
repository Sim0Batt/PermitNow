import { apiClient } from './client';
import type { UserListItem } from '../types/models';

export interface CreateUserPayload {
  name: string;
  surname: string;
  email: string;
  password: string;
  fiscalCode: string;
}

export const adminApi = {
  async createUser(payload: CreateUserPayload): Promise<string> {
    const response = await apiClient.post<{ id: string }>('/admin/users', payload);
    return response.data.id;
  },

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
