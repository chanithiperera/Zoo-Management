import axios from 'axios';
import { getTunnelModeApiMisconfigMessage } from '../api/getApiBaseUrl';

/**
 * User-facing copy for failed login/register requests.
 * When Metro uses --tunnel, the API on :5000 is not tunneled unless configured.
 */
export function describeAuthRequestError(err, fallbackTitle) {
  const isNetwork =
    axios.isAxiosError(err) &&
    !err.response &&
    (err.code === 'ERR_NETWORK' || /network error/i.test(String(err.message)));

  if (__DEV__ && isNetwork) {
    const tunnelHint = getTunnelModeApiMisconfigMessage();
    if (tunnelHint) {
      return {
        title: 'Cannot reach API (tunnel mode)',
        message: tunnelHint,
      };
    }
  }

  if (axios.isAxiosError(err) && err.response?.status === 503) {
    const data = err.response?.data;
    const apiMsg = typeof data?.message === 'string' ? data.message : '';
    const fromOurApi = data?.code === 'DB_NOT_CONNECTED' || data?.dbConnected === false;

    if (fromOurApi) {
      return {
        title: 'MongoDB not connected (on server)',
        message:
          'Your phone reached the API, but this server process is not connected to MongoDB.\n\n' +
          'On the PC: check the backend terminal for Mongo errors. Confirm MONGODB_URI and Atlas → Network Access.\n' +
          'Open in a browser: YOUR_API_URL/api/health — dbConnected should be true.\n\n' +
          (apiMsg ? `\nDetails: ${apiMsg}` : ''),
      };
    }

    return {
      title: 'Cannot reach your API (503)',
      message:
        'This is usually NOT a MongoDB problem on your phone. The app must reach your PC’s API (Express). MongoDB only runs on the PC.\n\n' +
        'Fix:\n' +
        '• If you use LocalTunnel/ngrok: point it at the SAME port as the API (see backend terminal, e.g. 5000). Copy the https URL into frontend/.env as EXPO_PUBLIC_API_URL=…/api then restart Metro with -c.\n' +
        '• In a phone browser, open YOUR_TUNNEL/api/health — you need JSON with success:true and dbConnected:true.\n' +
        (apiMsg ? `\nServer said: ${apiMsg}` : ''),
    };
  }

  if (
    __DEV__ &&
    axios.isAxiosError(err) &&
    err.response?.status === 408
  ) {
    return {
      title: 'Tunnel timed out (408)',
      message:
        'LocalTunnel often returns 408 if the link was not opened in a browser first, the tunnel restarted, or your PC is slow to answer.\n\n' +
        'Try:\n' +
        '1. On your PC, open the tunnel base URL in Chrome (e.g. https://….loca.lt) and pass any warning page.\n' +
        '2. Test: https://YOUR_TUNNEL/api/health in the browser — you should see JSON.\n' +
        '3. Keep backend `npm run dev` and your tunnel process running; restart both if the URL changed — update frontend/.env and Metro (-c).\n' +
        '4. If it keeps failing, use ngrok or Cloudflare Tunnel instead of loca.lt.',
    };
  }

  const msg = err.response?.data?.message || err.message || fallbackTitle;
  return { title: fallbackTitle, message: msg };
}
