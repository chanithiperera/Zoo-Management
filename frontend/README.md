# Zoo Management (Expo)

Mobile client for the Zoo and Visitor Management System.

**Expo SDK 54** — matches the current **Expo Go** app from the App Store / Play Store. If you previously saw an SDK mismatch error, run `npm install` in this folder after pulling changes, then `npm run start` (use `npm run start -- -c` once to clear the Metro cache).

**Metro port:** `npm run start`, `start:lan`, and `start:tunnel` use **port 8085** on purpose so they don’t fight with other tools on **8081** (Cursor, other Expo apps) and don’t hang waiting for “Use another port?” in a non-interactive terminal.

### “MongoDB connected” in the backend terminal but the app says database / 503

Expo Go on your **phone** only talks to **your API over HTTP** (LAN or a tunnel URL). It never connects to MongoDB directly. If `EXPO_PUBLIC_API_URL` is wrong or the phone cannot reach that host, you’ll get **503** even though MongoDB is fine on the PC.

1. In the **backend** terminal, note the real port: `Server listening on http://0.0.0.0:XXXX`.
2. Set **`frontend/.env`** so the phone can reach the API: same Wi‑Fi → `http://YOUR_PC_IP:XXXX/api`, or use **ngrok** (or similar) on port `XXXX` → `https://…/api`.
3. Restart Metro after changing `.env` (e.g. `npm run start -- -c`).
4. On the **phone’s browser**, open `YOUR_API_URL/health` — you want JSON with `"dbConnected": true`.

### If `npm install` fails

- **ENOENT / “Could not read package.json”** — `package.json` was removed. Restore it from Git or copy it from this repo; do **not** delete `package.json`, only `node_modules` and `package-lock.json` if you need a clean install.
- **ERESOLVE / peer dependency errors** — this repo includes [`.npmrc`](./.npmrc) with `legacy-peer-deps=true` so npm can install cleanly with React 19. If you removed `.npmrc`, run: `npm install --legacy-peer-deps`.

## Setup

```bash
npm install
copy .env.example .env
```

Set `EXPO_PUBLIC_API_URL` (must end with `/api`). See the [root README](../README.md) for emulator vs device URLs.

```bash
npm run start
```

### Expo Go: “The request timed out” / `exp://192.168.x.x:8081`

Your phone cannot reach **Metro** on your PC (port **8081**). Try this order:

1. **Tunnel (works most often)** — does not require the phone to see your LAN IP:
   ```bash
   npm run start:tunnel
   ```
   Or: `npx expo start --tunnel`  
   Scan the **new** QR code. First run may ask to install `@expo/ngrok` / sign in; allow it.

   **“ngrok tunnel took too long to connect”** — try turning off VPN, another network, `npx expo login`, or a longer wait before starting, for example in PowerShell:  
   `$env:EXPO_TUNNEL_TIMEOUT_MS="180000"; npm run start:tunnel`  
   This project defaults Metro to **8085** to avoid **8081** conflicts. If 8085 is busy, run `npx expo start --tunnel --port 8090` (pick any free port).

2. **LAN** (`exp://192.168…`) — if tunnel keeps failing but phone and PC share Wi‑Fi:
   ```bash
   npm run start:lan
   ```
   - Same Wi‑Fi (avoid “guest” networks that block device-to-device).
   - **Windows Firewall:** allow **Node.js** on **Private** networks, or allow **TCP 8081** inbound.
   - Turn off **VPN** on PC or phone while testing.

3. **Backend (login/API)** is separate: tunnel mode **does not** expose port **5000**. The phone can load JS from Expo’s tunnel but **cannot** reach `http://localhost:5000` or your LAN IP unless the network allows it.

### Using Expo tunnel **and** registration / login

Expo’s tunnel only carries Metro. Your **API** still needs a URL the phone can open (LAN IP or a tool like **ngrok** on the same port as the backend).

**If you use `expo start --tunnel` for Metro**

1. Start Mongo + API from `backend/`: `npm run dev` (or `npm start`).
2. Expose the API port (e.g. 5000) with **ngrok** or similar; copy the `https://…` URL.
3. In `frontend/.env` (keep `/api` at the end):
   ```env
   EXPO_PUBLIC_API_URL=https://YOUR_NGROK_HOST/api
   ```
4. Restart Metro with a clean cache: `npx expo start --tunnel -c`.

**LAN for API (same Wi‑Fi)**

If the phone can reach your PC on port **5000**, set `EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5000/api`. You can use plain `npm run start` or `start:lan` for Metro if the QR link works on your network.

## Phase 1

Authentication, home/dashboard, profile, and placeholder screens for six feature modules. Feature APIs and uploads arrive in Phase 2.
