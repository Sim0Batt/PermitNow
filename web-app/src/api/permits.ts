import { apiClient } from './client';
import type { FishingPermit, CreatePermitPayload } from '../types/models';

export const permitsApi = {
  async listPermits(): Promise<FishingPermit[]> {
    const response = await apiClient.get<FishingPermit[]>('/permit/list');
    return response.data;
  },

  async getPermitsByUser(userId: string): Promise<FishingPermit[]> {
    const response = await apiClient.get<FishingPermit[]>(`/permit/fishing/${userId}`);
    return response.data;
  },

  async createPermit(payload: CreatePermitPayload): Promise<void> {
    await apiClient.post('/permit/fishing/admin', payload);
  },

  async requestPermit(payload: CreatePermitPayload): Promise<void> {
    await apiClient.post('/permit/fishing', payload);
  },

  async deletePermit(permitId: string): Promise<void> {
    await apiClient.delete(`/permit/fishing/${permitId}`);
  },
};
