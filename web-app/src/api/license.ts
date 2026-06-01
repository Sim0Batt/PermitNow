import { apiClient } from './client';
import type {
  LicenseListItem,
  FishingLicense,
  CreateLicensePayload,
  UpdateLicensePayload,
} from '../types/models';

export const licenseApi = {
  async listLicenses(): Promise<LicenseListItem[]> {
    const response = await apiClient.get<LicenseListItem[]>('/license/list');
    return response.data;
  },

  async getLicense(userId: string): Promise<FishingLicense> {
    const response = await apiClient.get<FishingLicense>(`/license/fishing/${userId}`);
    return response.data;
  },

  async createLicense(payload: CreateLicensePayload): Promise<void> {
    await apiClient.post('/license/fishing/admin', payload);
  },

  async updateLicense(userId: string, payload: UpdateLicensePayload): Promise<void> {
    await apiClient.put(`/license/fishing/${userId}`, payload);
  },

  async deleteLicense(userId: string): Promise<void> {
    await apiClient.delete(`/license/fishing/${userId}`);
  },
};
