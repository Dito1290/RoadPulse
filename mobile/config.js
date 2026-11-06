import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Port proxy RoadPulse (backend/proxy.js) yang bisa diakses dari HP di jaringan yang sama.
export const API_PORT = 8000;

// Terima "192.168.1.10", "192.168.1.10:8000", atau "http://192.168.1.10:8000/api/v1/".
export function normalizeOrigin(value) {
  let origin = (value || '').trim();
  if (!origin) return '';
  if (!/^https?:\/\//i.test(origin)) origin = `http://${origin}`;
  origin = origin.replace(/\/+$/, '').replace(/\/api\/v1$/i, '');
  const hostPart = origin.replace(/^https?:\/\//i, '');
  if (/^http:\/\//i.test(origin) && !/:\d+$/.test(hostPart)) origin = `${origin}:${API_PORT}`;
  return origin;
}

// IP komputer yang menjalankan `npx expo start` (mis. "172.20.10.5:8081"),
// jadi alamat API ikut berubah otomatis saat pindah Wi-Fi/hotspot.
// Mode --tunnel memberi domain, bukan IP, sehingga tidak dipakai.
function detectDevServerOrigin() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || '';
  const host = hostUri.split(':')[0];
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('127.')) return '';
  return `http://${host}:${API_PORT}`;
}

// Opsional dari mobile/.env.local (EXPO_PUBLIC_API_URL=http://<IP-LAN-komputer>:8000).
const ENV_ORIGIN = normalizeOrigin(process.env.EXPO_PUBLIC_API_URL);
const DEV_SERVER_ORIGIN = detectDevServerOrigin();

export const IS_ENV_CONFIGURED = Boolean(ENV_ORIGIN || DEV_SERVER_ORIGIN);

// Tanpa keduanya hanya berfungsi di emulator/simulator, bukan di HP fisik.
const EMULATOR_ORIGIN = Platform.OS === 'android'
  ? `http://10.0.2.2:${API_PORT}`
  : `http://localhost:${API_PORT}`;

export const DEFAULT_API_ORIGIN = DEV_SERVER_ORIGIN || ENV_ORIGIN || EMULATOR_ORIGIN;

// Dicoba berurutan bila alamat utama tidak bisa dijangkau.
export const API_CANDIDATES = [DEV_SERVER_ORIGIN, ENV_ORIGIN, EMULATOR_ORIGIN]
  .filter((origin, i, all) => origin && all.indexOf(origin) === i);
