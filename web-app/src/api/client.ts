import axios from 'axios';

export const apiClient = axios.create({
  // Must match the <Port> defined in the backend XML configuration
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
