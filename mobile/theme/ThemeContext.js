import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme } from './tokens';

// Preferensi tema disimpan lokal di perangkat; tidak ada endpoint backend.
const STORAGE_KEY = 'roadpulse:theme-preference';
export const THEME_PREFERENCES = ['system', 'light', 'dark'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (alive && THEME_PREFERENCES.includes(saved)) setPreferenceState(saved);
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const setPreference = (next) => {
    if (!THEME_PREFERENCES.includes(next)) return;
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  // "Sistem" mengikuti perangkat; bila perangkat tidak melapor, pakai gelap (tema utama brand).
  const scheme = preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
  const value = useMemo(
    () => ({ theme: buildTheme(scheme), scheme, preference, setPreference }),
    [scheme, preference]
  );

  // Tunggu preferensi tersimpan dibaca agar layar tidak berkedip antar-tema.
  if (!ready) return <View style={{ flex: 1, backgroundColor: value.theme.colors.bg }} />;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme harus dipakai di dalam ThemeProvider');
  return ctx;
}

// Membuat StyleSheet sekali per tema
export function useStyles(factory) {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
