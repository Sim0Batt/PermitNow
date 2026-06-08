import { apiClient } from './client';
import type { PermitListItem, CreatePermitPayload } from '../types/models';

export const permitApi = {
  async listPermits(): Promise<PermitListItem[]> {
    const response = await apiClient.get<PermitListItem[]>('/permit/list');
    return response.data;
  },

  async getPermitsByUser(userId: string): Promise<PermitListItem[]> {
    const response = await apiClient.get<PermitListItem[]>(`/permit/fishing/${userId}`);
    return response.data;
  },

  async createPermit(payload: CreatePermitPayload): Promise<void> {
    await apiClient.post('/permit/fishing/admin', payload);
  },

  async deletePermit(permitId: string): Promise<void> {
    await apiClient.delete(`/permit/fishing/${permitId}`);
  },
};
