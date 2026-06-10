import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://permitnow-ids.duckdns.org';

export const apiClient = axios.create({
  // Keep this aligned with backend host/port; VITE_API_BASE_URL can override per environment.
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
