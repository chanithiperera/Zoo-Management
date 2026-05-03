import axios, { AxiosHeaders } from 'axios';
import { getToken } from '../services/tokenStorage';
import { getApiBaseUrl } from './getApiBaseUrl';

/**
 * Do NOT default `Content-Type: application/json` on the axios instance.
 * Axios transformRequest converts FormData to JSON when that header is present,
 * which breaks multipart uploads — Multer never receives the file (`images` stays empty).
 */
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  // Tunnels + Mongo cold start can be slow; 408s often mean the proxy gave up before the PC responded
  timeout: 60000,
});

function isFormDataBody(data) {
  if (data == null) return false;
  if (typeof FormData !== 'undefined' && data instanceof FormData) return true;
  return typeof data === 'object' && data.constructor?.name === 'FormData';
}

apiClient.interceptors.request.use(async (config) => {
  config.baseURL = getApiBaseUrl();

  const headers = AxiosHeaders.from(config.headers);
  config.headers = headers;

  const multipart = isFormDataBody(config.data);

  if (multipart) {
    // Required so defaults/transformRequest treats this as multipart, not JSON.
    headers.setContentType(false);
  } else if (
    config.data != null &&
    typeof config.data === 'object' &&
    !(typeof URLSearchParams !== 'undefined' && config.data instanceof URLSearchParams) &&
    !(typeof Blob !== 'undefined' && config.data instanceof Blob) &&
    !isFormDataBody(config.data)
  ) {
    if (!headers.has('Content-Type')) {
      headers.setContentType('application/json');
    }
  }

  const token = await getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.get('Accept')) {
    headers.set('Accept', 'application/json');
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