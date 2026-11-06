import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { API_CANDIDATES, DEFAULT_API_ORIGIN, IS_ENV_CONFIGURED, normalizeOrigin } from './config';
import { ThemeProvider, useStyles, useTheme } from './theme/ThemeContext';
import {
  DEFAULT_LOCATION_NAME, isUnauthorized, logoutRequest, requestJson, resolveLocationName, setAuthToken, uploadInspectionXHR,
} from './services/api';
import { IconButton } from './components/ui';
import { InspectionDetailSheet } from './components/inspection';
import { SigerCrown, TapisLine } from './components/lampung';
import { ChartIcon, GearIcon, HomeIcon, ListIcon } from './components/icons';
import HomeScreen from './screens/HomeScreen';
import SummaryScreen from './screens/SummaryScreen';
import HistoryScreen from './screens/HistoryScreen';
import CaptureScreen from './screens/CaptureScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsSheet from './screens/SettingsSheet';
import LoginScreen from './screens/LoginScreen';
import { clearSession, loadSession, saveSession } from './services/session';
import { loadSavedHost, saveHostPreference } from './services/serverHost';

const TABS = [
  { key: 'detect', label: 'Beranda', Icon: HomeIcon },
  { key: 'stats', label: 'Ringkasan', Icon: ChartIcon },
  { key: 'history', label: 'Riwayat', Icon: ListIcon },
];

const TAB_TITLES = {
  stats: { title: 'Ringkasan', sub: 'Statistik seluruh inspeksi' },
  history: { title: 'Riwayat', sub: 'Inspeksi dari lapangan' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RoadPulseApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const makeStyles = (t) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.colors.bg },
  appBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.md,
    paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.sm, minHeight: 56,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, flex: 1 },
  brandMark: { width: 40, height: 40, borderRadius: t.radius.md, backgroundColor: '#101827', borderWidth: 1, borderColor: 'rgba(212, 165, 55, 0.45)', alignItems: 'center', justifyContent: 'center' },
  brandName: { ...t.type.heading, fontSize: 18, color: t.colors.text },
  brandSub: { ...t.type.caption, color: t.colors.textSecondary, marginTop: 1 },
  heritage: { paddingHorizontal: t.spacing.xl, marginBottom: t.spacing.sm, overflow: 'hidden' },
  titleBlock: { paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.sm, paddingBottom: t.spacing.md },
  title: { ...t.type.display, color: t.colors.text },
  sub: { ...t.type.body, fontSize: 14, color: t.colors.textSecondary, marginTop: 2 },
  scroll: { paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.sm, paddingBottom: t.spacing.xxxl },
  tabBar: {
    flexDirection: 'row', backgroundColor: t.colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border,
    paddingTop: t.spacing.sm, paddingHorizontal: t.spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 56 },
  tabIcon: { width: 64, height: 32, borderRadius: t.radius.pill, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: t.colors.accentSoft },
  tabLabel: { ...t.type.caption, fontSize: 12 },
});

function RoadPulseApp() {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const hostSetManually = useRef(false);

  // Sesi login (token DRF disimpan di perangkat)
  const [session, setSession] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const loggedIn = !!session?.token;

  // Navigation & Screen States
  const [activeTab, setActiveTab] = useState('detect'); // 'detect' | 'stats' | 'history'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // Dynamic Backend Host
  const [backendHost, setBackendHost] = useState(DEFAULT_API_ORIGIN);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [tempIpInput, setTempIpInput] = useState(DEFAULT_API_ORIGIN);

  // Camera & Location Permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);

  // Data & Loading States
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiConnected, setApiConnected] = useState(null);

  // Dashboard Stats & History
  const [stats, setStats] = useState({
    total_inspections: 0,
    class_distribution: { Crack: 0, Pothole: 0, 'Surface Erosion': 0, Normal: 0 },
  });
  const [historyList, setHistoryList] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, totalPages: 1, totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');
  const [mapPoints, setMapPoints] = useState([]);
  const [mapError, setMapError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const applyHistoryPage = (data, append) => {
    setHistoryList((prev) => {
      if (!append) return data.results || [];
      const seen = new Set(prev.map((i) => i.id));
      return [...prev, ...(data.results || []).filter((i) => !seen.has(i.id))];
    });
    setHistoryMeta({ page: data.page || 1, totalPages: data.total_pages || 1, totalRecords: data.total_records ?? 0 });
  };

  // Token kedaluwarsa/dicabut (401): kembali ke layar login.
  const expireSession = useCallback(() => {
    setAuthToken(null);
    clearSession();
    setSession(null);
  }, []);

  // Fetch Stats & History dari Backend Django
  const fetchDashboardData = useCallback(async (host, loggedIn) => {
    try {
      // Root API publik: menentukan status server, termasuk di layar login.
      await requestJson(`${host}/api/v1/`, 6000);
      setApiConnected(true);
      if (!loggedIn) return true;
      const [statsData, historyData] = await Promise.all([
        requestJson(`${host}/api/v1/dashboard/stats/`, 6000),
        requestJson(`${host}/api/v1/dashboard/history/?page=1`, 6000),
      ]);
      setStats(statsData);
      applyHistoryPage(historyData, false);
      setLoadMoreError('');
      setApiConnected(true);
      setLastUpdated(new Date());
      // Titik peta (endpoint yang sama dengan dashboard web); gagal di sini tidak mengubah status server
      requestJson(`${host}/api/v1/dashboard/map/`, 6000)
        .then((points) => {
          setMapPoints(Array.isArray(points) ? points : []);
          setMapError('');
        })
        .catch((error) => setMapError(error?.message || String(error)));
      return true;
    } catch (error) {
      if (isUnauthorized(error)) {
        expireSession();
        return true; // server terjangkau, hanya sesi yang habis
      }
      console.log(`Backend connection error (${host}):`, error?.message || error);
      setApiConnected(false);
      return false;
    }
  }, [expireSession]);

  const loadMoreHistory = async () => {
    if (loadingMore || historyMeta.page >= historyMeta.totalPages) return;
    setLoadingMore(true);
    setLoadMoreError('');
    try {
      const data = await requestJson(`${backendHost}/api/v1/dashboard/history/?page=${historyMeta.page + 1}`, 6000);
      applyHistoryPage(data, true);
    } catch (error) {
      if (isUnauthorized(error)) {
        expireSession();
        return;
      }
      setLoadMoreError(`Gagal memuat halaman berikutnya: ${error?.message || error}`);
    } finally {
      setLoadingMore(false);
    }
  };

  // Alamat server tersimpan dipakai lebih dulu; bila tidak terjangkau (mis. ganti Wi-Fi),
  // aplikasi tetap mencoba kandidat otomatis (IP Expo, .env.local).
  useEffect(() => {
    loadSavedHost().then((saved) => {
      if (saved && saved !== DEFAULT_API_ORIGIN) {
        setBackendHost(saved);
        setTempIpInput(saved);
      }
    });
  }, []);

  useEffect(() => {
    loadSession().then((saved) => {
      setAuthToken(saved?.token);
      setSession(saved);
      setSessionReady(true);
    });
  }, []);

  const handleLoggedIn = (next) => {
    setAuthToken(next.token);
    saveSession(next);
    setSession(next);
    setActiveTab('detect');
  };

  const handleLogout = () => {
    Alert.alert('Keluar dari akun?', 'Anda perlu masuk lagi untuk memakai RoadPulse.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          setSettingsVisible(false);
          logoutRequest(backendHost).finally(() => setAuthToken(null)); // cabut token di server
          clearSession();
          setSession(null);
        },
      },
    ]);
  };

  // Izin lokasi cukup diminta sekali saat aplikasi dibuka
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const granted = status === 'granted';
        setLocationPermission(granted);
        if (granted) {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setCurrentCoords(loc.coords);
        }
      } catch (err) {
        console.log('Location error:', err?.message || err);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setApiConnected(null);
      const ok = await fetchDashboardData(backendHost, loggedIn);
      if (ok || cancelled || hostSetManually.current) return;
      // Alamat utama gagal: coba kandidat lain (IP dev server, .env.local, emulator)
      for (const candidate of API_CANDIDATES) {
        if (candidate === backendHost) continue;
        try {
          await requestJson(`${candidate}/api/v1/`, 3000);
          if (!cancelled) setBackendHost(candidate);
          return;
        } catch (_) {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backendHost, fetchDashboardData, loggedIn]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(backendHost, loggedIn);
    setRefreshing(false);
  };

  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Izin Kamera Dibutuhkan', 'Mohon izinkan akses kamera untuk mendeteksi jalan.');
        return;
      }
    }
    setCameraReady(false);
    setIsCameraActive(true);
  };

  // Ambil Foto & Analisis AI
  const takePictureAndAnalyze = async () => {
    if (!cameraRef.current || !cameraReady || loading) return;
    setLoading(true);
    setErrorMessage('');
    setPredictionResult(null);
    let photoTaken = false;

    try {
      // skipProcessing dimatikan: tanpa itu orientasi foto tidak pasti (hanya di EXIF)
      const photoData = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      photoTaken = true;
      const capturedAt = new Date().toISOString();
      setIsCameraActive(false);

      let lat = currentCoords?.latitude ?? null;
      let lng = currentCoords?.longitude ?? null;
      setCapturedPhoto({
        uri: photoData.uri,
        width: photoData.width,
        height: photoData.height,
        latitude: lat,
        longitude: lng,
        locationName: DEFAULT_LOCATION_NAME,
        capturedAt,
      });

      if (locationPermission && (lat === null || lng === null)) {
        try {
          const lastLoc = await Location.getLastKnownPositionAsync();
          if (lastLoc) {
            lat = lastLoc.coords.latitude;
            lng = lastLoc.coords.longitude;
            setCurrentCoords(lastLoc.coords);
          }
        } catch (_) {}
      }

      const locationName = await resolveLocationName(lat, lng);
      setCapturedPhoto((prev) => (prev ? { ...prev, latitude: lat, longitude: lng, locationName } : prev));

      const result = await uploadInspectionXHR(
        `${backendHost}/api/v1/classify/`,
        photoData.uri,
        lat,
        lng,
        locationName,
        capturedAt
      );

      setPredictionResult(result);
      fetchDashboardData(backendHost, loggedIn);
    } catch (err) {
      console.log('Classify error:', err?.message || err);
      if (isUnauthorized(err)) {
        resetDetection();
        expireSession();
        Alert.alert('Sesi berakhir', 'Silakan masuk lagi untuk mengirim foto.');
        return;
      }
      if (!photoTaken) {
        Alert.alert('Gagal Mengambil Foto', err?.message || 'Coba arahkan ulang kamera lalu ambil foto lagi.');
        return;
      }
      setErrorMessage(err?.message || 'Terjadi kesalahan saat klasifikasi gambar.');
    } finally {
      setLoading(false);
    }
  };

  const resetDetection = () => {
    setCapturedPhoto(null);
    setPredictionResult(null);
    setErrorMessage('');
  };

  // Titik peta → detail; pakai data riwayat (berisi foto) bila sudah dimuat
  const selectMapPoint = (id) => {
    const item = historyList.find((i) => i.id === id) || mapPoints.find((p) => p.id === id);
    if (item) setDetailItem(item);
  };

  const openSettings = () => {
    setTempIpInput(backendHost);
    setSettingsVisible(true);
  };

  const saveHost = () => {
    const host = normalizeOrigin(tempIpInput);
    if (!host) {
      Alert.alert('Alamat kosong', 'Isi alamat server, contoh https://roadpulse.contoh.id atau http://192.168.1.10:8000');
      return;
    }
    setSettingsVisible(false);
    hostSetManually.current = true;
    saveHostPreference(host);
    if (host === backendHost) {
      setApiConnected(null);
      fetchDashboardData(host, loggedIn);
    } else {
      setBackendHost(host);
    }
  };

  // ── 0. Login ──
  if (!sessionReady) return <View style={s.screen} />;
  if (!session) {
    return (
      <>
        <LoginScreen host={backendHost} apiConnected={apiConnected} onLoggedIn={handleLoggedIn} onOpenSettings={openSettings} />
        <SettingsSheet
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          host={backendHost}
          apiConnected={apiConnected}
          draftHost={tempIpInput}
          onChangeDraftHost={setTempIpInput}
          onSaveHost={saveHost}
        />
      </>
    );
  }

  // ── 1. Kamera ──
  if (isCameraActive) {
    return (
      <CaptureScreen
        cameraRef={cameraRef}
        cameraReady={cameraReady}
        onCameraReady={() => setCameraReady(true)}
        loading={loading}
        hasGps={!!currentCoords}
        onClose={() => setIsCameraActive(false)}
        onShutter={takePictureAndAnalyze}
      />
    );
  }

  // ── 2. Hasil analisis ──
  if (capturedPhoto) {
    return (
      <ResultScreen
        photo={capturedPhoto}
        result={predictionResult}
        errorMessage={errorMessage}
        loading={loading}
        host={backendHost}
        onClose={resetDetection}
        onRetake={() => {
          resetDetection();
          handleStartCamera();
        }}
      />
    );
  }

  // ── 3. Layar utama dengan tab ──
  return (
    <View style={[s.screen, { paddingTop: insets.top + 8 }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={s.appBar}>
        <View style={s.brand}>
          <View style={s.brandMark}><SigerCrown width={24} color={c.heritage} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.brandName}>RoadPulse</Text>
            <Text style={s.brandSub}>Smart Mobility · Lampung</Text>
          </View>
        </View>
        <IconButton onPress={openSettings} accessibilityLabel="Pengaturan">
          <GearIcon color={c.text} size={18} />
        </IconButton>
      </View>
      <View style={s.heritage}><TapisLine color={c.heritage} count={48} size={4} gap={5} opacity={0.35} /></View>

      {TAB_TITLES[activeTab] ? (
        <View style={s.titleBlock}>
          <Text style={s.title} accessibilityRole="header">{TAB_TITLES[activeTab].title}</Text>
          <Text style={s.sub}>{TAB_TITLES[activeTab].sub}</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} colors={[c.accent]} progressBackgroundColor={c.surface} />}
      >
        {activeTab === 'detect' ? (
          <HomeScreen
            stats={stats}
            historyList={historyList}
            mapPoints={mapPoints}
            mapError={mapError}
            apiConnected={apiConnected}
            host={backendHost}
            lastUpdated={lastUpdated}
            currentCoords={currentCoords}
            locationPermission={locationPermission}
            onStartCamera={handleStartCamera}
            onNavigate={setActiveTab}
            onOpenSettings={openSettings}
            onOpenDetail={setDetailItem}
            onSelectMapPoint={selectMapPoint}
            username={session.username}
          />
        ) : null}
        {activeTab === 'stats' ? <SummaryScreen stats={stats} apiConnected={apiConnected} /> : null}
        {activeTab === 'history' ? (
          <HistoryScreen
            historyList={historyList}
            historyMeta={historyMeta}
            apiConnected={apiConnected}
            host={backendHost}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            onLoadMore={loadMoreHistory}
            onOpenDetail={setDetailItem}
          />
        ) : null}
      </ScrollView>

      <View style={[s.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]} accessibilityRole="tablist">
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          const color = active ? c.accentText : c.textSecondary;
          return (
            <Pressable
              key={key}
              style={s.tab}
              onPress={() => setActiveTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
            >
              <View style={[s.tabIcon, active && s.tabIconActive]}><Icon color={color} size={22} /></View>
              <Text style={[s.tabLabel, { color, fontWeight: active ? '800' : '600' }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <SettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        host={backendHost}
        apiConnected={apiConnected}
        draftHost={tempIpInput}
        onChangeDraftHost={setTempIpInput}
        onSaveHost={saveHost}
        username={session?.username}
        onLogout={handleLogout}
      />
      {detailItem ? <InspectionDetailSheet item={detailItem} host={backendHost} onClose={() => setDetailItem(null)} /> : null}
    </View>
  );
}
