// Alamat API dipakai bersama oleh semua halaman frontend.
// Development (./start.sh, halaman di port 3000): API di host yang sama, port 8000 (proxy RoadPulse).
// Produksi (deploy/, Caddy): dashboard dan API berada di domain yang sama, jadi memakai origin halaman.
// Override tanpa ubah kode: localStorage.setItem('rp_api_origin', 'http://192.168.1.10:8000')
const API_PORT = 8000;
const API_ORIGIN = (() => {
    try {
        const saved = localStorage.getItem('rp_api_origin');
        if (saved) return saved.replace(/\/+$/, '');
    } catch (_) {}
    const { protocol, hostname, port, origin } = window.location;
    if (protocol === 'file:' || port === '3000') return `http://${hostname || 'localhost'}:${API_PORT}`;
    return origin;
})();
const API_BASE_URL = `${API_ORIGIN}/api/v1`;

// Label kelas dalam Bahasa Indonesia (sama dengan aplikasi mobile)
const CLASS_LABELS = { Crack: 'Retakan', Pothole: 'Lubang', 'Surface Erosion': 'Erosi permukaan', Normal: 'Normal' };
const classLabel = (label) => CLASS_LABELS[label] || label;
const LOW_CONFIDENCE = 0.5; // di bawah ini hasil sebaiknya dicek ulang

// Semua data inspeksi wajib login: kirim token, dan kembali ke halaman login bila token tidak ada/kedaluwarsa.
function authFetch(url, options = {}) {
    const token = localStorage.getItem('rp_token');
    if (!token) { window.location.replace('login.html'); return Promise.reject(new Error('Belum login')); }
    options.headers = { ...(options.headers || {}), Authorization: `Token ${token}` };
    return fetch(url, options).then((res) => {
        if (res.status === 401) { localStorage.removeItem('rp_token'); window.location.replace('login.html'); }
        return res;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-api-href]').forEach((link) => {
        link.href = `${API_ORIGIN}${link.dataset.apiHref}`;
    });
});
