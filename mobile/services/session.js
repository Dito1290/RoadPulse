import AsyncStorage from '@react-native-async-storage/async-storage';

// Sesi login disimpan lokal agar pengguna tidak perlu masuk ulang setiap membuka aplikasi.
const KEY = 'roadpulse:session';

export async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const s = raw ? JSON.parse(raw) : null;
    return s?.token && s?.username ? s : null;
  } catch (_) {
    return null;
  }
}

export function saveSession(session) {
  return AsyncStorage.setItem(KEY, JSON.stringify(session)).catch(() => {});
}

export function clearSession() {
  return AsyncStorage.removeItem(KEY).catch(() => {});
}
