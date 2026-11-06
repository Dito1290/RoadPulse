import * as Location from 'expo-location';

// Endpoint, payload, dan batas waktu sama persis dengan versi sebelumnya (kontrak API tidak berubah).
export const DEFAULT_LOCATION_NAME = 'Bandar Lampung, Lampung';

function withTimeout(promise, ms, fallback) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

// ── Helper HTTP Berbasis XMLHttpRequest (Bypass Bug expo/fetch di iOS) ──
export function requestJson(url, timeoutMs = 8000) {
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

export function uploadInspectionXHR(url, photoUri, lat, lng, locationName, capturedAt) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = 35000;

    xhr.onload = () => {
      let json = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch (_) {
        reject(new Error(`Respon tidak valid (${xhr.status})`));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(json);
      } else {
        reject(new Error(json?.error || `Server error (${xhr.status})`));
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

// Nama jalan/kecamatan dari GPS; kembali ke default bila geocoder lambat/gagal.
export async function resolveLocationName(lat, lng) {
  if (lat == null || lng == null) return DEFAULT_LOCATION_NAME;
  try {
    const places = await withTimeout(Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }), 3000, null);
    const p = places?.[0];
    if (!p) return DEFAULT_LOCATION_NAME;
    const parts = [p.street || p.name, p.district || p.subregion, p.city].filter(Boolean);
    const unique = parts.filter((part, i) => parts.indexOf(part) === i);
    return unique.length ? unique.join(', ') : DEFAULT_LOCATION_NAME;
  } catch (_) {
    return DEFAULT_LOCATION_NAME;
  }
}

export function imageUrlFor(item, host) {
  if (!item?.image_url) return null;
  return item.image_url.startsWith('http') ? item.image_url : `${host}${item.image_url}`;
}

export function osmUrl(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

export function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Login token DRF (POST /api/v1/auth/login/) — endpoint yang sama dengan halaman login web.
export function loginRequest(host, username, password, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${host}/api/v1/auth/login/`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = timeoutMs;
    xhr.onload = () => {
      let json = null;
      try { json = JSON.parse(xhr.responseText); } catch (_) {}
      if (xhr.status >= 200 && xhr.status < 300 && json?.token) resolve(json);
      else if (xhr.status === 401) reject(new Error(json?.error || 'Username atau kata sandi salah'));
      else reject(new Error(json?.error || `Server error (${xhr.status})`));
    };
    xhr.ontimeout = () => reject(new Error('Server tidak merespons. Periksa koneksi lalu coba lagi.'));
    xhr.onerror = () => reject(new Error('Gagal terhubung ke server. Pastikan HP dan komputer satu Wi-Fi.'));
    xhr.send(JSON.stringify({ username, password }));
  });
}

// Pendaftaran akun pengguna biasa (POST /api/v1/auth/register/). Error berisi `fields` per kolom.
export function registerRequest(host, username, password, passwordConfirm, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${host}/api/v1/auth/register/`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = timeoutMs;
    xhr.onload = () => {
      let json = null;
      try { json = JSON.parse(xhr.responseText); } catch (_) {}
      if (xhr.status >= 200 && xhr.status < 300 && json?.token) {
        resolve(json);
        return;
      }
      const err = new Error(json?.error || (xhr.status === 404 ? 'Server belum mendukung pendaftaran. Perbarui backend.' : `Server error (${xhr.status})`));
      err.fields = json?.fields || {};
      reject(err);
    };
    xhr.ontimeout = () => reject(new Error('Server tidak merespons. Periksa koneksi lalu coba lagi.'));
    xhr.onerror = () => reject(new Error('Gagal terhubung ke server. Pastikan HP dan komputer satu Wi-Fi.'));
    xhr.send(JSON.stringify({ username, password, password_confirm: passwordConfirm }));
  });
}
