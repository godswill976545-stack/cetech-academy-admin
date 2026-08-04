import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const isLocalConfiguredUrl = configuredApiUrl?.includes('localhost') || configuredApiUrl?.includes('127.0.0.1');
const apiBaseUrl = typeof window !== 'undefined' && isLocalConfiguredUrl
  ? `${window.location.origin}/api`
  : configuredApiUrl || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
