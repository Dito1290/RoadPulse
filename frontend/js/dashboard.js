let distributionChart = null;
let historyPage = 1;
let totalHistoryPages = 1;
let currentHistory = [];
let inspectionMap = null;
let inspectionMarkers = null;

async function loadDashboard(page = historyPage) {
    const apiStatus = document.getElementById('apiStatus');
    try {
        const [statsResponse, historyResponse, mapResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/dashboard/stats/`),
            fetch(`${API_BASE_URL}/dashboard/history/?page=${page}`),
            fetch(`${API_BASE_URL}/dashboard/map/`)
        ]);

        if (!statsResponse.ok || !historyResponse.ok) {
            throw new Error('API mengembalikan respons gagal.');
        }

        const [stats, history] = await Promise.all([
            statsResponse.json(),
            historyResponse.json()
        ]);
        const mapPoints = mapResponse.ok ? await mapResponse.json() : [];
        apiStatus.classList.add('connected');
        apiStatus.classList.remove('disconnected');
        apiStatus.innerHTML = '<span class="dot"></span> API terhubung';

        updateStats(stats);
        updateChart(stats.class_distribution);
        renderHistory(history);
        updateInspectionMap(mapPoints);
    } catch (error) {
        console.error('Dashboard error:', error);
        apiStatus.classList.add('disconnected');
        apiStatus.classList.remove('connected');
        apiStatus.innerHTML = '<span class="dot"></span> API tidak terhubung';
        document.getElementById('historySummary').textContent =
            'Riwayat tidak dapat dimuat. Jalankan backend Django di port 8000.';
        document.getElementById('historyTableBody').innerHTML =
            '<tr><td colspan="5">Data belum tersedia.</td></tr>';
    }
}

function updateInspectionMap(points) {
    const mapStatus = document.getElementById('mapStatus');
    const mapElement = document.getElementById('inspectionMap');
    if (typeof L === 'undefined' || !mapElement) {
        mapStatus.textContent = 'Peta tidak dapat dimuat. Periksa koneksi internet.';
        return;
    }

    if (!inspectionMap) {
        inspectionMap = L.map(mapElement).setView([-5.429, 105.262], 12);
        inspectionMarkers = L.featureGroup().addTo(inspectionMap);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(inspectionMap);
    }

    inspectionMarkers.clearLayers();
    const validPoints = points.filter((point) =>
        Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    );

    for (const point of validPoints) {
        const popup = document.createElement('div');
        popup.className = 'map-popup';
        const title = document.createElement('strong');
        title.textContent = point.class_label;
        const location = document.createElement('span');
        location.textContent = point.location_name ||
            `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
        const captured = document.createElement('span');
        captured.textContent = point.captured_at
            ? `Foto: ${new Date(point.captured_at).toLocaleString('id-ID')}`
            : `Analisis: ${new Date(point.created_at).toLocaleString('id-ID')}`;
        const link = document.createElement('a');
        link.href = `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=18/${point.latitude}/${point.longitude}`;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = 'Buka peta';
        popup.append(title, location, captured, link);

        const color = point.class_label === 'Normal' ? '#398b70' : '#ce665d';
        L.circleMarker([point.latitude, point.longitude], {
            radius: 8,
            color: '#ffffff',
            weight: 2,
            fillColor: color,
            fillOpacity: 0.95
        }).bindPopup(popup).addTo(inspectionMarkers);
    }

    mapStatus.textContent = validPoints.length
        ? `${validPoints.length} titik foto berlokasi ditampilkan.`
        : 'Belum ada foto dengan data GPS. Aktifkan lokasi saat mengambil atau mengunggah foto.';
    if (validPoints.length) {
        const bounds = validPoints.map((point) => [point.latitude, point.longitude]);
        inspectionMap.fitBounds(bounds, { maxZoom: 15 });
    } else {
        inspectionMap.setView([-5.429, 105.262], 12);
    }
    window.setTimeout(() => inspectionMap.invalidateSize(), 0);
}

function updateStats(data) {
    const distribution = data.class_distribution;
    document.getElementById('totalInspections').textContent = data.total_inspections;
    document.getElementById('crackCount').textContent = distribution.Crack || 0;
    document.getElementById('potholeCount').textContent = distribution.Pothole || 0;
    document.getElementById('erosionCount').textContent = distribution['Surface Erosion'] || 0;
    document.getElementById('normalCount').textContent = distribution.Normal || 0;
}

function updateChart(distribution) {
    const canvas = document.getElementById('distributionChart');
    if (typeof Chart === 'undefined' || !canvas) return;

    if (distributionChart) distributionChart.destroy();
    distributionChart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Crack', 'Pothole', 'Surface Erosion', 'Normal'],
            datasets: [{
                label: 'Jumlah deteksi',
                data: [
                    distribution.Crack || 0,
                    distribution.Pothole || 0,
                    distribution['Surface Erosion'] || 0,
                    distribution.Normal || 0
                ],
                backgroundColor: ['#ce665d', '#d88948', '#d1ae55', '#398b70'],
                borderRadius: 3,
                maxBarThickness: 64
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

function renderHistory(data) {
    historyPage = data.page;
    totalHistoryPages = data.total_pages;
    currentHistory = data.results;

    const tableBody = document.getElementById('historyTableBody');
    const summary = document.getElementById('historySummary');
    const pageLabel = document.getElementById('historyPageLabel');
    const previous = document.getElementById('historyPrevious');
    const next = document.getElementById('historyNext');
    const exportButton = document.getElementById('downloadReportBtn');

    summary.textContent = `${data.total_records} inspeksi tersimpan`;
    pageLabel.textContent = `Halaman ${historyPage} dari ${totalHistoryPages}`;
    previous.disabled = historyPage <= 1;
    next.disabled = historyPage >= totalHistoryPages;
    exportButton.disabled = data.total_records === 0;
    tableBody.replaceChildren();

    if (!data.results.length) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent = 'Belum ada hasil klasifikasi.';
        return;
    }

    for (const record of data.results) {
        const row = tableBody.insertRow();
        const imageCell = row.insertCell();
        if (record.image_url) {
            const link = document.createElement('a');
            link.href = new URL(record.image_url, API_BASE_URL).href;
            link.target = '_blank';
            link.rel = 'noreferrer';
            link.textContent = 'Buka foto';
            imageCell.append(link);
        } else {
            imageCell.textContent = '-';
        }
        row.insertCell().textContent = record.class_label;
        row.insertCell().textContent = `${(record.confidence_score * 100).toFixed(1)}%`;
        const timeCell = row.insertCell();
        const photoTime = record.captured_at
            ? new Date(record.captured_at).toLocaleString('id-ID')
            : 'Waktu foto tidak tersedia';
        timeCell.textContent = `${photoTime}\nAnalisis: ${new Date(record.created_at).toLocaleString('id-ID')}`;
        const locationCell = row.insertCell();
        if (record.location_name) {
            locationCell.textContent = record.location_name;
        } else if (record.latitude != null && record.longitude != null) {
            const mapLink = document.createElement('a');
            mapLink.href = `https://www.openstreetmap.org/?mlat=${record.latitude}&mlon=${record.longitude}#map=18/${record.latitude}/${record.longitude}`;
            mapLink.target = '_blank';
            mapLink.rel = 'noreferrer';
            mapLink.textContent = `${record.latitude.toFixed(5)}, ${record.longitude.toFixed(5)}`;
            locationCell.append(mapLink);
        } else {
            locationCell.textContent = 'Lokasi tidak tersedia';
        }
    }
}

async function downloadReport() {
    const button = document.getElementById('downloadReportBtn');
    button.disabled = true;
    try {
        const firstResponse = await fetch(`${API_BASE_URL}/dashboard/history/?page=1`);
        if (!firstResponse.ok) throw new Error('Tidak dapat mengambil riwayat.');
        const firstPage = await firstResponse.json();
        const records = [...firstPage.results];

        for (let page = 2; page <= firstPage.total_pages; page += 1) {
            const response = await fetch(`${API_BASE_URL}/dashboard/history/?page=${page}`);
            if (!response.ok) throw new Error('Tidak dapat mengambil seluruh riwayat.');
            const data = await response.json();
            records.push(...data.results);
        }

        const columns = ['kelas', 'confidence', 'waktu_foto', 'waktu_analisis', 'lokasi_jalan', 'latitude', 'longitude', 'image_url'];
        const csv = [columns, ...records.map((record) => [
            record.class_label,
            record.confidence_score,
            record.captured_at ?? '',
            record.created_at,
            record.location_name ?? '',
            record.latitude ?? '',
            record.longitude ?? '',
            record.image_url ?? ''
        ])].map((row) => row.map(csvValue).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'roadpulse-riwayat.csv';
        anchor.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        document.getElementById('historySummary').textContent = error.message;
    } finally {
        button.disabled = currentHistory.length === 0;
    }
}

function csvValue(value) {
    return `"${String(value).replaceAll('"', '""')}"`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('historyPrevious').addEventListener('click', () => {
        if (historyPage > 1) loadDashboard(historyPage - 1);
    });
    document.getElementById('historyNext').addEventListener('click', () => {
        if (historyPage < totalHistoryPages) loadDashboard(historyPage + 1);
    });
    document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
    loadDashboard();
});