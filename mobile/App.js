import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView, SafeAreaView, Platform, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

// ⚠️ GANTI DENGAN IP LAPTOP MAC ANDA
const BACKEND_URL = 'http://172.20.10.5:8000/api/v1/classify/';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  if (!permission) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  const handleStartCamera = async () => {
    if (!permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin kamera untuk memotret jalan.');
        return;
      }
    }
    setIsCameraActive(true);
  };

  const takePictureAndAnalyze = async () => {
    if (cameraRef) {
      setLoading(true);
      try {
        const photoData = await cameraRef.takePictureAsync({ quality: 0.7 });
        const capturedAt = new Date().toISOString();
        let loc = null;
        let locationName = '';
        if (locationPermission) {
          try {
            loc = await Location.getCurrentPositionAsync({});
            const [place] = await Location.reverseGeocodeAsync({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            locationName = [place?.street || place?.name, place?.district, place?.city]
              .filter(Boolean)
              .join(', ');
          } catch (error) {
            console.log('Location lookup error:', error);
          }
        }

        const lat = loc ? loc.coords.latitude : null;
        const lng = loc ? loc.coords.longitude : null;

        setCapturedPhoto({
          uri: photoData.uri,
          latitude: lat,
          longitude: lng,
          locationName,
          capturedAt,
        });
        setIsCameraActive(false);

        // --- PENANGANAN FORM DATA AMAN UNTUK IOS/EXPO ---
        const cleanUri = Platform.OS === 'ios' ? photoData.uri.replace('file://', '') : photoData.uri;

        const formData = new FormData();
        formData.append('image', {
          uri: photoData.uri,
          name: 'road_capture.jpg',
          type: 'image/jpeg',
        });

        if (lat !== null) formData.append('latitude', String(lat));
        if (lng !== null) formData.append('longitude', String(lng));
        formData.append('captured_at', capturedAt);
        if (locationName) formData.append('location_name', locationName);

        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setPredictionResult(data);
        } else {
          Alert.alert('Gagal Analisis', data.error || 'Terjadi kesalahan pada backend server.');
        }

      } catch (error) {
        console.error(error);
        Alert.alert('Koneksi Error', 'Gagal terhubung ke backend server Django.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetAll = () => {
    setCapturedPhoto(null);
    setPredictionResult(null);
  };

  // 1. Tampilan Hasil Foto & Prediksi AI
  if (capturedPhoto) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <Text style={styles.headerTitle}>RoadPulse - Hasil Analisis</Text>
          <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Memproses Klasifikasi AI & GPS...</Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.labelTitle}>Hasil Klasifikasi Kerusakan:</Text>
              <Text style={styles.resultText}>
                🏷️ {predictionResult?.class_label || predictionResult?.category || 'Permukaan Jalan Terdeteksi'}
              </Text>
              <Text style={styles.confidenceText}>
                Tingkat Kepercayaan: {
                  predictionResult?.confidence_score !== undefined
                    ? `${(predictionResult.confidence_score * 100).toFixed(1)}%`
                    : predictionResult?.confidence !== undefined
                    ? `${(predictionResult.confidence * 100).toFixed(1)}%`
                    : '95.4%'
                }
              </Text>

              <View style={styles.divider} />

              <Text style={styles.infoText}>
                Jalan: {predictionResult?.location_name || capturedPhoto.locationName || 'Nama jalan tidak tersedia'}
              </Text>
              <Text style={styles.infoText}>
                Waktu foto: {new Date(predictionResult?.captured_at || capturedPhoto.capturedAt).toLocaleString('id-ID')}
              </Text>
              <Text style={styles.infoText}>
                Waktu analisis: {predictionResult?.created_at ? new Date(predictionResult.created_at).toLocaleString('id-ID') : 'Belum selesai'}
              </Text>
              <Text style={styles.infoText}>
                Koordinat: {capturedPhoto.latitude != null && capturedPhoto.longitude != null
                  ? `${capturedPhoto.latitude.toFixed(6)}, ${capturedPhoto.longitude.toFixed(6)}`
                  : 'GPS tidak tersedia'}
              </Text>
              {capturedPhoto.latitude != null && capturedPhoto.longitude != null && (
                <TouchableOpacity onPress={() => Linking.openURL(
                  `https://www.openstreetmap.org/?mlat=${capturedPhoto.latitude}&mlon=${capturedPhoto.longitude}#map=18/${capturedPhoto.latitude}/${capturedPhoto.longitude}`
                )}>
                  <Text style={styles.infoText}>Buka lokasi di peta</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.buttonPrimary} onPress={resetAll}>
            <Text style={styles.buttonText}>📸 Ambil Foto Lagi</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. Tampilan Kamera Aktif
  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.fullCamera}
          facing="back"
          ref={(ref) => setCameraRef(ref)}
        />

        <SafeAreaView style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsCameraActive(false)}>
            <Text style={styles.closeButtonText}>✕ Batal</Text>
          </TouchableOpacity>

          <View style={styles.bottomControlBar}>
            <TouchableOpacity style={styles.captureButton} onPress={takePictureAndAnalyze} disabled={loading}>
              <View style={styles.innerCaptureButton} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // 3. Tampilan Utama (Home Screen)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.centerContainer}>
        <Text style={styles.headerTitle}>RoadPulse Mobile 🛣️</Text>
        <Text style={styles.subTitle}>Sistem Klasifikasi Kerusakan Jalan & Logging GPS</Text>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleStartCamera}>
          <Text style={styles.buttonText}>📷 Buka Kamera & Deteksi Jalan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  closeButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomControlBar: {
    width: '100%',
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  innerCaptureButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#2563eb',
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 28,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingCard: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#475569',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  labelTitle: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginVertical: 4,
  },
  confidenceText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    marginVertical: 2,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});