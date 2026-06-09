import { apiClient } from './client';
import type { UserProfileJson, ProfileUpdatePayload } from '../types/models';

export const userApi = {
  async getUser(userId: string): Promise<UserProfileJson> {
    const response = await apiClient.get<UserProfileJson>(`/user/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: ProfileUpdatePayload): Promise<void> {
    await apiClient.post(`/user/${userId}/profile`, data);
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await apiClient.post(`/user/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  },
};
