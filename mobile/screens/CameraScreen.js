import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import axios from 'axios';

// IMPORTANT: Update this with your local IP address when testing on physical device
// Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera permission is required to use this app
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureAndClassify = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      const capturedAt = new Date().toISOString();

      setCapturedImage(photo.uri);

      // Get GPS coordinates
      let latitude = null;
      let longitude = null;
      let locationName = '';

      if (locationPermission) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
          const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
          locationName = [place?.street || place?.name, place?.district, place?.city]
            .filter(Boolean)
            .join(', ');
        } catch (error) {
          console.log('Location error:', error);
        }
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        name: 'road_damage.jpg',
        type: 'image/jpeg',
      });

      if (latitude !== null && longitude !== null) {
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
      }
      formData.append('captured_at', capturedAt);
      if (locationName) formData.append('location_name', locationName);

      // Upload to backend
      const response = await axios.post(
        `${API_BASE_URL}/classify/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      // Show result
      setResult(response.data);
      setShowResult(true);

    } catch (error) {
      console.error('Classification error:', error);
      let errorMessage = 'Classification failed. ';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Check your connection.';
      } else if (error.response) {
        errorMessage += `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'Cannot reach server. Make sure backend is running.';
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getResultColor = (className) => {
    const lowerClass = className.toLowerCase();
    if (lowerClass.includes('crack') || lowerClass.includes('pothole')) {
      return '#dc2626'; // Red
    } else if (lowerClass.includes('erosion')) {
      return '#f59e0b'; // Yellow
    } else {
      return '#16a34a'; // Green
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setResult(null);
    setCapturedImage(null);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.header}>
          <Text style={styles.title}>🛣️ RoadPulse</Text>
          <Text style={styles.subtitle}>Capture road damage</Text>
        </View>

        <View style={styles.buttonContainer}>
          {!isProcessing ? (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureAndClassify}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          ) : (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Analyzing...</Text>
            </View>
          )}
        </View>
      </CameraView>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={closeResult}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {capturedImage && (
              <Image
                source={{ uri: capturedImage }}
                style={styles.resultImage}
              />
            )}

            {result && (
              <View
                style={[
                  styles.resultCard,
                  { borderColor: getResultColor(result.class_label) },
                ]}
              >
                <Text
                  style={[
                    styles.resultLabel,
                    { color: getResultColor(result.class_label) },
                  ]}
                >
                  {result.class_label}
                </Text>
                <Text style={styles.resultConfidence}>
                  Confidence: {(result.confidence_score * 100).toFixed(1)}%
                </Text>
                {result.latitude != null && result.longitude != null && (
                  <Text style={styles.resultLocation}>
                    📍 {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                  </Text>
                )}
                <Text style={styles.resultLocation}>
                  {result.location_name || 'Nama jalan tidak tersedia'}
                </Text>
                <Text style={styles.resultTime}>
                  Waktu foto: {new Date(result.captured_at || result.created_at).toLocaleString('id-ID')}
                </Text>
                <Text style={styles.resultTime}>
                  Waktu analisis: {new Date(result.created_at).toLocaleString('id-ID')}
                </Text>
                {result.latitude != null && result.longitude != null && (
                  <TouchableOpacity onPress={() => Linking.openURL(
                    `https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=18/${result.latitude}/${result.longitude}`
                  )}>
                    <Text style={styles.resultLocation}>Buka lokasi di peta</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeResult}>
              <Text style={styles.closeButtonText}>Take Another Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#2563eb',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    fontWeight: '600',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  resultImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultConfidence: {
    fontSize: 20,
    color: '#4b5563',
    marginBottom: 10,
  },
  resultLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  resultTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  closeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
