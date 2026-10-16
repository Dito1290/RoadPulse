import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
  Linking,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

// ── Konfigurasi Default Host Backend ─────────────────────────
const DEFAULT_HOST = 'http://172.20.10.5:8000';

// ── Helper HTTP Berbasis XMLHttpRequest (Bypass Bug expo/fetch di iOS) ──
function requestJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.timeout = timeoutMs;
    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      } catch (err) {
        reject(err);
      }
    };
    xhr.ontimeout = () => reject(new Error('Koneksi timeout.'));
    xhr.onerror = () => reject(new Error('Gagal terhubung ke server.'));
    xhr.send();
  });
}

function uploadInspectionXHR(url, photoUri, lat, lng, locationName, capturedAt) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = 35000;

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(json);
        } else {
          reject(new Error(json.error || `Server error (${xhr.status})`));
        }
      } catch (err) {
        reject(new Error(`Respon tidak valid (${xhr.status})`));
      }
    };

    xhr.ontimeout = () => reject(new Error('Upload timeout.'));
    xhr.onerror = () => reject(new Error('Gagal mengirim gambar ke server.'));

    const formData = new FormData();
    formData.append('image', {
      uri: photoUri,
      name: 'road_inspection.jpg',
      type: 'image/jpeg',
    });

    if (lat !== null && lat !== undefined) formData.append('latitude', String(lat));
    if (lng !== null && lng !== undefined) formData.append('longitude', String(lng));
    if (capturedAt) formData.append('captured_at', capturedAt);
    if (locationName) formData.append('location_name', locationName);

    xhr.send(formData);
  });
}

export default function App() {
  // Navigation & Screen States
  const [activeTab, setActiveTab] = useState('detect'); // 'detect' | 'stats' | 'history'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);

  // Dynamic Backend Host
  const [backendHost, setBackendHost] = useState(DEFAULT_HOST);
  const [ipModalVisible, setIpModalVisible] = useState(false);
  const [tempIpInput, setTempIpInput] = useState(DEFAULT_HOST);

  // Camera & Location Permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);

  // Data & Loading States
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiConnected, setApiConnected] = useState(null);

  // Dashboard Stats & History
  const [stats, setStats] = useState({
    total_inspections: 0,
    class_distribution: {
      Crack: 0,
      Pothole: 0,
      'Surface Erosion': 0,
      Normal: 0,
    },
  });
  const [historyList, setHistoryList] = useState([]);

  // Fetch Stats & History dari Backend Django
  const fetchDashboardData = useCallback(async (host = backendHost) => {
    try {
      const statsUrl = `${host}/api/v1/dashboard/stats/`;
      const historyUrl = `${host}/api/v1/dashboard/history/?page=1`;

      const [statsData, historyData] = await Promise.all([
        requestJson(statsUrl, 6000),
        requestJson(historyUrl, 6000),
      ]);

      setStats(statsData);
      setHistoryList(historyData.results || []);
      setApiConnected(true);
    } catch (error) {
      console.log('Backend connection error:', error?.message || error);
      setApiConnected(false);
    }
  }, [backendHost]);

  // Init permissions & sync data
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

    fetchDashboardData(backendHost);
  }, [backendHost, fetchDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(backendHost);
    setRefreshing(false);
  };

  // Kamera Trigger
  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Izin Kamera Dibutuhkan', 'Mohon izinkan akses kamera untuk mendeteksi jalan.');
        return;
      }
    }
    setIsCameraActive(true);
  };

  // Ambil Foto & Analisis AI
  const takePictureAndAnalyze = async () => {
    if (!cameraRef) return;
    setLoading(true);

    try {
      const photoData = await cameraRef.takePictureAsync({ quality: 0.8 });
      const capturedAt = new Date().toISOString();

      let lat = null;
      let lng = null;
      let locationName = '';

      if (locationPermission) {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
          setCurrentCoords(loc.coords);

          const [place] = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });
          locationName = [place?.street || place?.name, place?.district, place?.city]
            .filter(Boolean)
            .join(', ');
        } catch (locErr) {
          console.log('Reverse geocode error:', locErr?.message || locErr);
        }
      }

      setCapturedPhoto({
        uri: photoData.uri,
        latitude: lat,
        longitude: lng,
        locationName,
        capturedAt,
      });
      setIsCameraActive(false);

      // Upload via XMLHttpRequest yang stabil tanpa error FormDataPart
      const classifyUrl = `${backendHost}/api/v1/classify/`;
      const result = await uploadInspectionXHR(
        classifyUrl,
        photoData.uri,
        lat,
        lng,
        locationName,
        capturedAt
      );

      setPredictionResult(result);
      fetchDashboardData(backendHost);
    } catch (err) {
      console.error(err);
      Alert.alert('Gagal Memproses', err?.message || 'Terjadi kesalahan saat klasifikasi gambar.');
    } finally {
      setLoading(false);
    }
  };

  const resetDetection = () => {
    setCapturedPhoto(null);
    setPredictionResult(null);
  };

  // Helper warna badge kelas kerusakan
  const getClassStyle = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('crack') || l.includes('pothole')) {
      return {
        color: '#f06e6e',
        bg: 'rgba(240, 110, 110, 0.12)',
        border: 'rgba(240, 110, 110, 0.3)',
      };
    }
    if (l.includes('erosion') || l.includes('surface')) {
      return {
        color: '#e3b857',
        bg: 'rgba(227, 184, 87, 0.12)',
        border: 'rgba(227, 184, 87, 0.3)',
      };
    }
    return {
      color: '#2ac78a',
      bg: 'rgba(42, 199, 138, 0.12)',
      border: 'rgba(42, 199, 138, 0.3)',
    };
  };

  // ═════════════════════════════════════════════════════════════
  // 1. TAMPILAN KAMERA ASLI (BERSIH, LIVE PREVIEW JELAS)
  // ═════════════════════════════════════════════════════════════
  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <StatusBar style="light" />

        {/* Live Camera View */}
        <CameraView
          style={styles.fullCamera}
          facing="back"
          ref={(ref) => setCameraRef(ref)}
        />

        {/* Clean Overlay UI */}
        <SafeAreaView style={styles.cameraOverlay}>
          {/* Top Bar */}
          <View style={styles.cameraTopBar}>
            <TouchableOpacity
              style={styles.cameraCloseBtn}
              onPress={() => setIsCameraActive(false)}
            >
              <Text style={styles.cameraCloseBtnText}>✕ Batal</Text>
            </TouchableOpacity>

            <View style={styles.cameraGpsBadge}>
              <View style={[styles.dot, { backgroundColor: currentCoords ? '#26b66a' : '#c99834' }]} />
              <Text style={styles.cameraGpsText}>
                {currentCoords ? 'GPS Terkoneksi' : 'GPS Aktif'}
              </Text>
            </View>
          </View>

          {/* Bottom Bar: Clean Shutter Button */}
          <View style={styles.cameraBottomBar}>
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePictureAndAnalyze}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <Text style={styles.shutterText}>Ambil foto jalan</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // 2. TAMPILAN HASIL ANALISIS
  // ═════════════════════════════════════════════════════════════
  if (capturedPhoto) {
    const classLabel =
      predictionResult?.class_label || predictionResult?.category || 'Memproses...';
    const confScore =
      predictionResult?.confidence_score !== undefined
        ? (predictionResult.confidence_score * 100).toFixed(1)
        : predictionResult?.confidence !== undefined
        ? (predictionResult.confidence * 100).toFixed(1)
        : '95.0';
    const classStyle = getClassStyle(classLabel);

    return (
      <SafeAreaView style={styles.screenShell}>
        <StatusBar style="light" />

        {/* Topbar */}
        <View style={styles.topbar}>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>RP</Text>
            </View>
            <View>
              <Text style={styles.brandName}>RoadPulse</Text>
              <Text style={styles.brandSub}>BANDAR LAMPUNG</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnDone} onPress={resetDetection}>
            <Text style={styles.btnDoneText}>Selesai</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.resultScroll}>
          <Text style={styles.eyebrow}>HASIL ANALISIS</Text>
          <Text style={styles.sectionTitle}>Klasifikasi Kerusakan Jalan</Text>

          {/* Foto Hasil */}
          <View style={styles.resultImageCard}>
            <Image source={{ uri: capturedPhoto.uri }} style={styles.resultImage} resizeMode="cover" />
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#2ac78a" />
              <Text style={styles.loadingText}>Menganalisis citra jalan dengan AI...</Text>
            </View>
          ) : (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: classStyle.bg, borderColor: classStyle.border },
              ]}
            >
              <Text style={[styles.resultClassLabel, { color: classStyle.color }]}>
                {classLabel}
              </Text>
              <Text style={styles.resultConf}>
                Keyakinan Model: <Text style={{ fontWeight: '800', color: '#edf5ff' }}>{confScore}%</Text>
              </Text>

              <View style={styles.divider} />

              <View style={styles.metaItem}>
                <Text style={styles.metaTitle}>Lokasi</Text>
                <Text style={styles.metaDesc}>
                  {predictionResult?.location_name || capturedPhoto.locationName || 'Bandar Lampung, Indonesia'}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaTitle}>Koordinat GPS</Text>
                <Text style={styles.metaDesc}>
                  {capturedPhoto.latitude != null && capturedPhoto.longitude != null
                    ? `${capturedPhoto.latitude.toFixed(6)}, ${capturedPhoto.longitude.toFixed(6)}`
                    : 'GPS belum tersedia'}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaTitle}>Waktu Pengambilan</Text>
                <Text style={styles.metaDesc}>
                  {new Date(
                    predictionResult?.captured_at || capturedPhoto.capturedAt
                  ).toLocaleString('id-ID')}
                </Text>
              </View>

              {capturedPhoto.latitude != null && capturedPhoto.longitude != null && (
                <TouchableOpacity
                  style={styles.btnMap}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.openstreetmap.org/?mlat=${capturedPhoto.latitude}&mlon=${capturedPhoto.longitude}#map=18/${capturedPhoto.latitude}/${capturedPhoto.longitude}`
                    )
                  }
                >
                  <Text style={styles.btnMapText}>Buka di Peta OpenStreetMap ↗</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.btnPrimary} onPress={resetDetection}>
            <Text style={styles.btnPrimaryText}>📸 Ambil Foto Lagi</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // 3. TAMPILAN UTAMA (DESAIN BERSIH & SELARAS DENGAN WEB)
  // ═════════════════════════════════════════════════════════════
  const total = stats.total_inspections || 0;
  const crack = stats.class_distribution?.Crack || 0;
  const pothole = stats.class_distribution?.Pothole || 0;
  const erosion = stats.class_distribution?.['Surface Erosion'] || 0;
  const normal = stats.class_distribution?.Normal || 0;

  return (
    <SafeAreaView style={styles.screenShell}>
      <StatusBar style="light" />

      {/* Topbar Bersih */}
      <View style={styles.topbar}>
        <View style={styles.brandBlock}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>RP</Text>
          </View>
          <View>
            <Text style={styles.brandName}>RoadPulse</Text>
            <Text style={styles.brandSub}>BANDAR LAMPUNG</Text>
          </View>
        </View>

        {/* Status Pill Interaktif */}
        <TouchableOpacity
          style={styles.statusPill}
          onPress={() => {
            setTempIpInput(backendHost);
            setIpModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: apiConnected ? '#26b66a' : apiConnected === false ? '#d85a5a' : '#c99834' },
            ]}
          />
          <Text style={styles.statusPillText}>
            {apiConnected ? 'API Terhubung' : apiConnected === false ? 'API Offline' : 'Memeriksa...'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nav Tabs */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'detect' && styles.tabButtonActive]}
          onPress={() => setActiveTab('detect')}
        >
          <Text style={[styles.tabText, activeTab === 'detect' && styles.tabTextActive]}>
            Deteksi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'stats' && styles.tabButtonActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            Ringkasan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Riwayat
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2ac78a" />}
      >
        {/* ── TAB 1: DETEKSI ── */}
        {activeTab === 'detect' && (
          <View>
            <View style={styles.heroSection}>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>LAMPUNG • SMART ROAD MONITORING</Text>
              </View>

              <Text style={styles.eyebrow}>KOTA BANDAR LAMPUNG</Text>
              <Text style={styles.heroTitle}>
                Kondisi{'\n'}
                <Text style={{ color: '#edf5ff' }}>jalan rusak</Text>
                {'\n'}di Bandar Lampung.
              </Text>

              <Text style={styles.heroSubtitle}>
                Satu alur monitoring untuk deteksi retakan, lubang, erosi, dan klasifikasi kondisi jalan di kota Bandar Lampung secara otomatis.
              </Text>
            </View>

            {/* Kartu Kamera Bersih */}
            <TouchableOpacity
              style={styles.cardUploadArea}
              onPress={handleStartCamera}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 32 }}>📸</Text>
              </View>
              <Text style={styles.cardUploadTitle}>Buka Kamera & Deteksi Jalan</Text>
              <Text style={styles.cardUploadSub}>
                Arahkan kamera ke permukaan aspal untuk identifikasi kondisi jalan secara instan
              </Text>

              <View style={styles.btnActionInside}>
                <Text style={styles.btnActionInsideText}>Buka Kamera Sekarang</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                Total inspeksi terdata di sistem: <Text style={{ color: '#edf5ff', fontWeight: '800' }}>{total}</Text> jalan
              </Text>
            </View>
          </View>
        )}

        {/* ── TAB 2: RINGKASAN STATISTIK ── */}
        {activeTab === 'stats' && (
          <View>
            <Text style={styles.eyebrow}>RINGKASAN</Text>
            <Text style={styles.sectionTitle}>Dashboard Statistik</Text>

            <View style={styles.statsCardGrid}>
              {/* Total */}
              <View style={[styles.statBox, styles.statBoxTotal]}>
                <Text style={styles.statBoxLabel}>TOTAL</Text>
                <Text style={styles.statBoxNumber}>{total}</Text>
                <Text style={styles.statBoxDesc}>Inspeksi Tercatat</Text>
              </View>

              {/* Crack */}
              <View style={styles.statBox}>
                <Text style={[styles.statBoxLabel, { color: '#f06e6e' }]}>CRACK</Text>
                <Text style={[styles.statBoxNumber, { color: '#f06e6e' }]}>{crack}</Text>
                <Text style={styles.statBoxDesc}>Retakan</Text>
              </View>

              {/* Pothole */}
              <View style={styles.statBox}>
                <Text style={[styles.statBoxLabel, { color: '#f06e6e' }]}>POTHOLE</Text>
                <Text style={[styles.statBoxNumber, { color: '#f06e6e' }]}>{pothole}</Text>
                <Text style={styles.statBoxDesc}>Lubang Jalan</Text>
              </View>

              {/* Surface Erosion */}
              <View style={styles.statBox}>
                <Text style={[styles.statBoxLabel, { color: '#e3b857' }]}>EROSION</Text>
                <Text style={[styles.statBoxNumber, { color: '#e3b857' }]}>{erosion}</Text>
                <Text style={styles.statBoxDesc}>Pengikisan</Text>
              </View>

              {/* Normal */}
              <View style={styles.statBox}>
                <Text style={[styles.statBoxLabel, { color: '#2ac78a' }]}>NORMAL</Text>
                <Text style={[styles.statBoxNumber, { color: '#2ac78a' }]}>{normal}</Text>
                <Text style={styles.statBoxDesc}>Kondisi Baik</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 3: RIWAYAT ── */}
        {activeTab === 'history' && (
          <View>
            <Text style={styles.eyebrow}>RIWAYAT</Text>
            <Text style={styles.sectionTitle}>Daftar Unggahan Inspeksi</Text>

            {historyList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
                <Text style={styles.emptySub}>Hasil deteksi kamera akan otomatis tersimpan di sini.</Text>
              </View>
            ) : (
              historyList.map((item) => {
                const style = getClassStyle(item.class_label);
                const fullImageUrl = item.image_url?.startsWith('http')
                  ? item.image_url
                  : `${backendHost}${item.image_url}`;

                return (
                  <View key={item.id} style={styles.historyItem}>
                    <Image source={{ uri: fullImageUrl }} style={styles.historyThumb} />
                    <View style={styles.historyMeta}>
                      <View style={styles.historyTopRow}>
                        <View style={[styles.historyBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
                          <Text style={[styles.historyBadgeText, { color: style.color }]}>{item.class_label}</Text>
                        </View>
                        <Text style={styles.historyConfidence}>{(item.confidence_score * 100).toFixed(0)}%</Text>
                      </View>
                      <Text style={styles.historyLocation} numberOfLines={1}>
                        📍 {item.location_name || 'Bandar Lampung'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.created_at || item.captured_at).toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Ubah IP Backend */}
      <Modal visible={ipModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pengaturan IP Backend</Text>
            <Text style={styles.modalDesc}>
              Masukkan alamat IP laptop Anda yang sedang menjalankan backend Django:
            </Text>

            <TextInput
              style={styles.modalInput}
              value={tempIpInput}
              onChangeText={setTempIpInput}
              placeholder="http://172.20.10.5:8000"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setIpModalVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSave}
                onPress={() => {
                  let host = tempIpInput.trim();
                  if (!host.startsWith('http')) host = `http://${host}`;
                  if (host.endsWith('/')) host = host.slice(0, -1);
                  setBackendHost(host);
                  setIpModalVisible(false);
                  fetchDashboardData(host);
                }}
              >
                <Text style={styles.btnSaveText}>Simpan & Hubungkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ═════════════════════════════════════════════════════════════
// STYLESHEET BERSIH, MODERN & ASLI
// ═════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  screenShell: {
    flex: 1,
    backgroundColor: '#091016',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Topbar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 14,
    backgroundColor: '#0d1720',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(46, 182, 125, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(46, 182, 125, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandMarkText: {
    color: '#2ac78a',
    fontWeight: '800',
    fontSize: 14,
  },
  brandName: {
    color: '#edf5ff',
    fontWeight: '800',
    fontSize: 16,
  },
  brandSub: {
    color: '#94a3b8',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    color: '#cad5e2',
    fontSize: 11,
    fontWeight: '600',
  },

  // Tabs
  tabNav: {
    flexDirection: 'row',
    backgroundColor: '#0b141d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2ac78a',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13.5,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#edf5ff',
    fontWeight: '800',
  },

  // Hero Section
  heroSection: {
    marginBottom: 20,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(90, 104, 116, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(90, 104, 116, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
  },
  tagPillText: {
    color: '#cad5e2',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  eyebrow: {
    color: '#77d7f8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#edf5ff',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: 13.5,
    lineHeight: 20,
  },

  // Card Upload / Camera Trigger
  cardUploadArea: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(146, 166, 189, 0.35)',
    backgroundColor: 'rgba(15, 24, 31, 0.65)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(42, 199, 138, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardUploadTitle: {
    color: '#edf5ff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardUploadSub: {
    color: '#94a3b8',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  btnActionInside: {
    backgroundColor: '#dce8eb',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  btnActionInsideText: {
    color: '#0f1720',
    fontSize: 13.5,
    fontWeight: '800',
  },

  infoBanner: {
    backgroundColor: 'rgba(15, 24, 31, 0.5)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoBannerText: {
    color: '#94a3b8',
    fontSize: 12.5,
    textAlign: 'center',
  },

  // Stats Grid
  sectionTitle: {
    color: '#edf5ff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  statsCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#0f1822',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  statBoxTotal: {
    width: '100%',
    backgroundColor: '#13202c',
  },
  statBoxLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statBoxNumber: {
    color: '#edf5ff',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 2,
  },
  statBoxDesc: {
    color: '#64748b',
    fontSize: 11.5,
  },

  // Riwayat
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#0f1822',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  historyThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyConfidence: {
    color: '#cad5e2',
    fontSize: 12,
    fontWeight: '700',
  },
  historyLocation: {
    color: '#edf5ff',
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 2,
  },
  historyDate: {
    color: '#64748b',
    fontSize: 10.5,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#0f1822',
    borderRadius: 16,
  },
  emptyTitle: {
    color: '#edf5ff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12.5,
    textAlign: 'center',
  },

  // ═════════════════════════════════════════════════════════════
  // KAMERA LAYOUT (BERSIH & ALAMI)
  // ═════════════════════════════════════════════════════════════
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullCamera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  cameraTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
  },
  cameraCloseBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cameraGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraGpsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraBottomBar: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 28 : 36,
    alignItems: 'center',
  },
  shutterButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  shutterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // ═════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ═════════════════════════════════════════════════════════════
  resultScroll: {
    padding: 18,
    paddingBottom: 40,
  },
  btnDone: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  btnDoneText: {
    color: '#edf5ff',
    fontSize: 13,
    fontWeight: '700',
  },
  resultImageCard: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  loadingCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#0f1822',
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingText: {
    color: '#cad5e2',
    fontSize: 13,
    marginTop: 10,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  resultClassLabel: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  resultConf: {
    color: '#cad5e2',
    fontSize: 13,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  metaItem: {
    marginBottom: 8,
  },
  metaTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaDesc: {
    color: '#edf5ff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  btnMap: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(119, 215, 248, 0.15)',
    borderRadius: 10,
  },
  btnMapText: {
    color: '#77d7f8',
    fontSize: 12.5,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: '#2ac78a',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#091016',
    fontSize: 15,
    fontWeight: '800',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0d1720',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#edf5ff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalDesc: {
    color: '#94a3b8',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: 'rgba(2, 9, 14, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#edf5ff',
    fontSize: 14,
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  btnCancelText: {
    color: '#cad5e2',
    fontSize: 13,
  },
  btnSave: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2ac78a',
  },
  btnSaveText: {
    color: '#091016',
    fontSize: 13,
    fontWeight: '800',
  },
});