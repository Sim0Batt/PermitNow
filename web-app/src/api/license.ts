import { apiClient } from './client';
import type { FishingLicenseInfoJson } from '../types/models';

export const licenseApi = {
  async getUserLicense(userId: string): Promise<FishingLicenseInfoJson> {
    const response = await apiClient.get<FishingLicenseInfoJson>(`/license/${userId}`);
    return response.data;
  },
};
