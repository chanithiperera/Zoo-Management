import axios from 'axios';
import { getToken } from '../services/tokenStorage';
import { getApiBaseUrl } from './getApiBaseUrl';

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  // Tunnels + Mongo cold start can be slow; 408s often mean the proxy gave up before the PC responded
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  config.baseURL = getApiBaseUrl();
  // Let axios/runtime set multipart boundaries for FormData payloads.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  const token = await getToken();
  if (token) {
    // Axios v1 may use AxiosHeaders; set safely for both cases.
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Ensure we always accept JSON responses
  if (config.headers && typeof config.headers.set === 'function') {
    if (!config.headers.get?.('Accept')) config.headers.set('Accept', 'application/json');
  } else {
    config.headers = config.headers || {};
    if (!config.headers.Accept) config.headers.Accept = 'application/json';
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Centralized logging so we always see real backend failures.
    const status = err?.response?.status;
    const data = err?.response?.data;
    const base = err?.config?.baseURL || '';
    const path = err?.config?.url || '';
    const fullUrl = path.startsWith('http') ? path : `${base}${path}`;
    console.error('[api] request failed', {
      status,
      baseURL: err?.config?.baseURL,
      fullUrl,
      method: err?.config?.method,
      message: err?.message,
      data,
    });
    return Promise.reject(err);
  }
);

export default apiClient;