import { apiClient } from './client';
import type {
  LicenseListItem,
  FishingLicense,
  FishingLicenseInfoJson,
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

  async getUserLicense(userId: string): Promise<FishingLicenseInfoJson> {
    const response = await apiClient.get<FishingLicense>(`/license/fishing/${userId}`);
    return {
      id: userId,
      ...response.data,
    };
  },

  async createLicense(payload: CreateLicensePayload): Promise<void> {
    await apiClient.post('/license/fishing/admin', payload);
  },

  async uploadLicense(userId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', file);
    // Let axios set the multipart boundary in the Content-Type header.
    await apiClient.post('/license/fishing', formData);
  },

  async updateLicense(userId: string, payload: UpdateLicensePayload): Promise<void> {
    await apiClient.put(`/license/fishing/${userId}`, payload);
  },

  async deleteLicense(userId: string): Promise<void> {
    await apiClient.delete(`/license/fishing/${userId}`);
  },
};
