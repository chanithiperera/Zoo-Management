import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

const DEFAULT_PORT = Number(process.env.EXPO_PUBLIC_API_PORT) || 5000;
const API_SUFFIX = '/api';

let didLogTunnelApiHint = false;

function parseHostFromDevUri(hostUri) {
  if (!hostUri || typeof hostUri !== 'string') return null;
  const withoutQuery = hostUri.split('?')[0];
  const hostPort = withoutQuery.includes('://')
    ? withoutQuery.split('://')[1]
    : withoutQuery;
  const host = hostPort?.split(':')[0]?.split('/')[0]?.trim();
  return host || null;
}

/** Metro serves the JS bundle from this URL in dev — often the most reliable host for the PC. */
function getHostFromScriptUrl() {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL || typeof scriptURL !== 'string') return null;
  const ipv6 = scriptURL.match(/^https?:\/\/\[([^\]]+)\](?::\d+)?/i);
  if (ipv6) return ipv6[1];
  const m = scriptURL.match(/^https?:\/\/([^/:?[\]]+)(?::\d+)?/i);
  return m ? m[1].trim() : null;
}

function isTunnelLikeHost(host) {
  if (!host) return false;
  const h = host.toLowerCase();
  return (
    h.includes('exp.direct') ||
    h.includes('ngrok') ||
    h.includes('ngrok-free') ||
    h.endsWith('.loca.lt') ||
    h.endsWith('.exp.host') ||
    h === 'expo.dev' ||
    h.endsWith('.expo.dev')
  );
}

function hostFromUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return new URL(raw).hostname?.trim() || null;
  } catch {
    return null;
  }
}

function isLoopbackHost(host) {
  if (!host) return false;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
}

/** True for localhost, emulator bridge, typical private LAN IPv4, or Bonjour .local (dev machine). */
function isLikelyReachableDevHost(host) {
  if (!host) return false;
  if (host === '10.0.2.2') return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (/\.local$/i.test(host)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  return /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host);
}

function collectDevHostCandidates() {
  const out = [];
  const push = (h) => {
    if (h && !out.includes(h)) out.push(h);
  };
  push(getHostFromScriptUrl());
  push(parseHostFromDevUri(Constants.expoConfig?.hostUri));
  push(parseHostFromDevUri(Constants.expoGoConfig?.debuggerHost));
  push(parseHostFromDevUri(Constants.manifest2?.extra?.expoGo?.debuggerHost));
  push(parseHostFromDevUri(Constants.manifest?.debuggerHost));
  return out;
}

function pickDevApiHost() {
  const candidates = collectDevHostCandidates();
  const hadTunnelCandidate = candidates.some((h) => h && isTunnelLikeHost(h));
  /** `10.0.2.2` reaches the host machine only from the Android *emulator*, not a physical phone. */
  const isPhysicalAndroid = Platform.OS === 'android' && Constants.isDevice;

  for (const parsed of candidates) {
    if (!parsed || isTunnelLikeHost(parsed)) continue;
    if (isLikelyReachableDevHost(parsed)) {
      if (Platform.OS === 'android' && (parsed === 'localhost' || parsed === '127.0.0.1')) {
        if (isPhysicalAndroid) {
          // Skip: mapping to 10.0.2.2 breaks real devices; prefer another candidate (LAN IP).
          continue;
        }
        return '10.0.2.2';
      }
      return parsed;
    }
  }

  if (hadTunnelCandidate) {
    if (!didLogTunnelApiHint) {
      didLogTunnelApiHint = true;
      console.warn(
        '[api] Metro is on a tunnel; set EXPO_PUBLIC_API_URL to a public HTTPS URL that reaches your API (e.g. ngrok). See frontend/README.md.'
      );
    }
    return null;
  }

  if (Platform.OS === 'android' && !isPhysicalAndroid) {
    return '10.0.2.2';
  }

  return null;
}

/**
 * When true, user is in dev with localhost-style API env while Metro host is tunnel-only.
 * Registration/login should show setup instructions instead of a generic "Network Error".
 */
export function getTunnelModeApiMisconfigMessage() {
  if (!__DEV__) return null;
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  const wantsAutoLocalhost =
    !fromEnv ||
    /\blocalhost\b/i.test(fromEnv) ||
    /\b127\.0\.0\.1\b/.test(fromEnv);
  if (!wantsAutoLocalhost) return null;

  const candidates = collectDevHostCandidates();
  if (!candidates.some((h) => h && isTunnelLikeHost(h))) return null;

  const host = pickDevApiHost();
  if (host !== null) return null;

  return [
    'Expo tunnel only forwards Metro, not your API (e.g. port 5000).',
    '',
    '1. Expose your API with ngrok, Cloudflare Tunnel, or similar — copy the https://… base URL.',
    '2. In frontend/.env set: EXPO_PUBLIC_API_URL=<that-url>/api',
    '3. Restart Metro (npx expo start --tunnel -c).',
  ].join('\n');
}

/**
 * Resolves API base URL. In __DEV__, if EXPO_PUBLIC_API_URL is missing or uses
 * localhost/127.0.0.1, uses the Metro/dev machine host (script URL + Expo constants).
 */
export function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  const envHost = hostFromUrl(fromEnv);

  const wantsAutoLocalhost =
    !fromEnv ||
    /\blocalhost\b/i.test(fromEnv) ||
    /\b127\.0\.0\.1\b/.test(fromEnv);

  // For Expo Web on the same machine, tunnel URLs often fail CORS preflight.
  // Prefer localhost API when running from localhost in browser dev.
  if (__DEV__ && Platform.OS === 'web' && isTunnelLikeHost(envHost)) {
    const browserHost = typeof window !== 'undefined' ? window.location?.hostname : null;
    if (isLoopbackHost(browserHost)) {
      return `http://localhost:${DEFAULT_PORT}${API_SUFFIX}`;
    }
  }

  if (__DEV__ && wantsAutoLocalhost) {
    const host = pickDevApiHost();
    if (host) {
      const url = `http://${host}:${DEFAULT_PORT}${API_SUFFIX}`;
      if (__DEV__) console.log('[api] base URL (dev auto):', url);
      return url;
    }
    if (Platform.OS === 'android' && Constants.isDevice) {
      console.warn(
        `[api] Could not infer your PC's LAN IP for the API. On a physical Android device, set in frontend/.env:\n` +
          `EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:${DEFAULT_PORT}${API_SUFFIX}\n` +
          `(same Wi‑Fi as the phone; Windows: ipconfig → IPv4). Then restart Expo with -c.`
      );
    }
  }

  const fallback = `http://localhost:${DEFAULT_PORT}${API_SUFFIX}`;
  const resolved = fromEnv || fallback;
  if (__DEV__) console.log('[api] base URL:', resolved);
  return resolved;
}

/**
 * Server origin for static files under `/uploads` (not under `/api`).
 * `getApiBaseUrl()` ends with `/api` but Express serves uploads at the host root.
 */
export function getServerOriginUrl() {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  if (base.endsWith('/api')) {
    return base.slice(0, -4);
  }
  return base;
}

/** Build a display/fetch URI for a stored upload path or absolute URL. */
export function resolveUploadsFileUri(relativeOrAbsolutePath) {
  const raw = String(relativeOrAbsolutePath || '').trim();
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('file://')) return raw;
  const pathPart = raw.startsWith('/') ? raw : `/${raw}`;
  const origin = getServerOriginUrl().replace(/\/+$/, '');
  return `${origin}${pathPart}`;
}

export function getStaticBaseUrl() {
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/\/api$/, '');
}
