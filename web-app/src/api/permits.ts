import { apiClient } from './client';
import type { FishingPermit, PermitRequestPayload } from '../types/models';

export const permitsApi = {
  async getPermitsByUser(userId: string): Promise<FishingPermit[]> {
    const response = await apiClient.get<FishingPermit[]>(`/permit/fishing/${userId}`);
    return response.data;
  },

  async requestPermit(payload: PermitRequestPayload): Promise<void> {
    await apiClient.post('/permit/fishing', payload);
  },
};
