import axios from 'axios';
import { apiClient } from './client';
import type { FishingPage, FishingRow, CreateFishingRowPayload } from '../types/models';

export const bookApi = {
  async getPages(bookId: string): Promise<FishingPage[]> {
    try {
      const response = await apiClient.get<FishingPage[]>(`/page/${bookId}`);
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        return [];
      }
      throw e;
    }
  },

  async getRows(pageId: string): Promise<FishingRow[]> {
    try {
      const response = await apiClient.get<FishingRow[]>(`/row/${pageId}`);
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        return [];
      }
      throw e;
    }
  },

  async createPage(userId: string): Promise<void> {
    await apiClient.post(`/page/${userId}`);
  },

  async addRow(pageId: string, payload: Omit<CreateFishingRowPayload, 'id' | 'pageId' | 'date'>): Promise<void> {
    const body: CreateFishingRowPayload = {
      id: '',
      pageId,
      date: new Date().toISOString().split('T')[0],
      ...payload,
    };
    await apiClient.post(`/row/${pageId}`, body);
  },

  async deletePage(pageId: string): Promise<void> {
    try {
      await apiClient.delete(`/page/${pageId}`);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return;
      throw e;
    }
  },

  async deleteRow(rowId: string): Promise<void> {
    try {
      await apiClient.delete(`/row/${rowId}`);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return;
      throw e;
    }
  },
};
