// Alamat API dipakai bersama oleh semua halaman frontend.
// Default: host yang sama dengan halaman ini, port 8000 (proxy RoadPulse).
// Override tanpa ubah kode: localStorage.setItem('rp_api_origin', 'http://192.168.1.10:8000')
const API_PORT = 8000;
const API_ORIGIN = (() => {
    try {
        const saved = localStorage.getItem('rp_api_origin');
        if (saved) return saved.replace(/\/+$/, '');
    } catch (_) {}
    const host = window.location.hostname || 'localhost';
    return `http://${host}:${API_PORT}`;
})();
const API_BASE_URL = `${API_ORIGIN}/api/v1`;

// Label kelas dalam Bahasa Indonesia (sama dengan aplikasi mobile)
const CLASS_LABELS = { Crack: 'Retakan', Pothole: 'Lubang', 'Surface Erosion': 'Erosi permukaan', Normal: 'Normal' };
const classLabel = (label) => CLASS_LABELS[label] || label;
const LOW_CONFIDENCE = 0.5; // di bawah ini hasil sebaiknya dicek ulang

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-api-href]').forEach((link) => {
        link.href = `${API_ORIGIN}${link.dataset.apiHref}`;
    });
});
