import AsyncStorage from '@react-native-async-storage/async-storage';

// Alamat server yang diisi manual di Pengaturan, disimpan agar tidak hilang saat aplikasi ditutup.
const KEY = 'roadpulse:apiHost';

export async function loadSavedHost() {
  try {
    return (await AsyncStorage.getItem(KEY)) || null;
  } catch (_) {
    return null;
  }
}

export function saveHostPreference(host) {
  return AsyncStorage.setItem(KEY, host).catch(() => {});
}
