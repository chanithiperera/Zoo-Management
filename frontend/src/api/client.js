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
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
