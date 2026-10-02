// Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const changeImageBtn = document.getElementById('changeImageBtn');
const classifyBtn = document.getElementById('classifyBtn');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('resultSection');
const resultCard = document.getElementById('resultCard');
const resultLabel = document.getElementById('resultLabel');
const resultConfidence = document.getElementById('resultConfidence');
const resultMeta = document.getElementById('resultMeta');
const resultLocation = document.getElementById('resultLocation');
const uploadMessage = document.getElementById('uploadMessage');
const captureDetails = document.getElementById('captureDetails');
const photoCapturedAt = document.getElementById('photoCapturedAt');
const photoLocation = document.getElementById('photoLocation');

// State
let selectedFile = null;
let selectedCoordinates = null;
let selectedLocationName = '';
let selectedCapturedAt = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDashboard();
});

function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => {
        if (!previewArea.style.display || previewArea.style.display === 'none') {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            handleFileSelect(file);
        }
    });

    // Change image button
    changeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // Classify button
    classifyBtn.addEventListener('click', classifyImage);
    document.getElementById('getLocationBtn').addEventListener('click', async () => {
        try {
            await locateCurrentPhoto();
            uploadMessage.textContent = 'Lokasi GPS berhasil diperoleh.';
        } catch (error) {
            uploadMessage.textContent = error.message;
        }
    });

    document.getElementById('startDetectionBtn').addEventListener('click', () => {
        document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' });
    });
}

async function handleFileSelect(file) {
    if (!file || !file.type.match('image.*')) {
        alert('Please select a valid image file (JPEG or PNG)');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    selectedFile = file;
    selectedCoordinates = null;
    selectedLocationName = '';
    selectedCapturedAt = new Date(file.lastModified);
    captureDetails.hidden = false;
    uploadMessage.textContent = '';
    updateCaptureDetails();

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadArea.querySelector('.upload-placeholder').style.display = 'none';
        previewArea.style.display = 'block';
        classifyBtn.disabled = false;
    };
    reader.readAsDataURL(file);

    if (window.exifr?.parse) {
        try {
            const metadata = await window.exifr.parse(file);
            const originalDate = metadata?.DateTimeOriginal || metadata?.CreateDate;
            if (originalDate) {
                const parsedDate = new Date(originalDate);
                if (!Number.isNaN(parsedDate.getTime())) selectedCapturedAt = parsedDate;
            }
            if (Number.isFinite(metadata?.latitude) && Number.isFinite(metadata?.longitude)) {
                await setPhotoLocation(metadata.latitude, metadata.longitude);
            } else {
                updateCaptureDetails();
            }
        } catch (error) {
            console.info('Photo EXIF metadata unavailable:', error);
        }
    }
    updateCaptureDetails();
}

function updateCaptureDetails() {
    photoCapturedAt.textContent = selectedCapturedAt
        ? selectedCapturedAt.toLocaleString('id-ID')
        : 'Waktu tidak tersedia';
    photoLocation.textContent = selectedLocationName || (selectedCoordinates
        ? `${selectedCoordinates.latitude.toFixed(6)}, ${selectedCoordinates.longitude.toFixed(6)}`
        : 'GPS belum diambil');
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Browser ini tidak mendukung akses GPS.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            resolve,
            () => reject(new Error('Izin/lokasi GPS tidak tersedia. Aktifkan lokasi perangkat lalu coba lagi.')),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    });
}

async function locateCurrentPhoto() {
    const position = await getCurrentPosition();
    await setPhotoLocation(position.coords.latitude, position.coords.longitude);
}

async function setPhotoLocation(latitude, longitude) {
    selectedCoordinates = { latitude, longitude };
    selectedLocationName = '';
    photoLocation.textContent = 'Mencari nama jalan...';
    try {
        const query = new URLSearchParams({
            format: 'jsonv2',
            lat: latitude,
            lon: longitude,
            zoom: 18,
            addressdetails: 1
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`);
        if (response.ok) {
            const result = await response.json();
            const address = result.address || {};
            const road = address.road || address.pedestrian || address.footway || address.residential;
            const area = address.suburb || address.city_district || address.city || address.town;
            selectedLocationName = [road, area].filter(Boolean).join(', ') || result.display_name || '';
        }
    } catch (error) {
        console.info('Road-name lookup unavailable:', error);
    }
    updateCaptureDetails();
}

async function classifyImage() {
    if (!selectedFile) return;

    // Show loading
    classifyBtn.disabled = true;
    loading.style.display = 'block';
    uploadMessage.textContent = 'Mengirim gambar untuk dianalisis...';
    resultSection.style.display = 'none';

    if (!selectedCoordinates) {
        try {
            await locateCurrentPhoto();
        } catch (error) {
            uploadMessage.textContent = `${error.message} Analisis dilanjutkan tanpa titik peta.`;
        }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image', selectedFile);
    if (selectedCapturedAt) formData.append('captured_at', selectedCapturedAt.toISOString());
    if (selectedCoordinates) {
        formData.append('latitude', String(selectedCoordinates.latitude));
        formData.append('longitude', String(selectedCoordinates.longitude));
    }
    if (selectedLocationName) formData.append('location_name', selectedLocationName);

    try {
        const response = await fetch(`${API_BASE_URL}/classify/`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.detail || 'Klasifikasi gagal. Periksa server dan model.');
        }
        displayResult(result);
        uploadMessage.textContent = 'Analisis selesai dan hasil tersimpan.';
        await loadDashboard(1);

    } catch (error) {
        console.error('Error:', error);
        uploadMessage.textContent = error.message || 'Tidak dapat terhubung ke API. Pastikan backend Django berjalan di port 8000.';
    } finally {
        loading.style.display = 'none';
        classifyBtn.disabled = !selectedFile;
    }
}

function displayResult(result) {
    // Set class-specific styling
    const className = result.class_label.toLowerCase().replace(' ', '-');
    resultCard.className = 'result-card ' + className;

    // Display label and confidence
    resultLabel.textContent = result.class_label;
    resultConfidence.textContent = `Confidence: ${(result.confidence_score * 100).toFixed(1)}%`;

    // Display metadata
    const capturedAt = result.captured_at || selectedCapturedAt;
    const capturedText = capturedAt
        ? new Date(capturedAt).toLocaleString('id-ID')
        : 'Waktu foto tidak tersedia';
    const analyzedText = new Date(result.created_at).toLocaleString('id-ID');
    const metaText = `Waktu foto: ${capturedText} | Waktu analisis: ${analyzedText}`;
    resultMeta.textContent = metaText;
    resultLocation.replaceChildren();
    if (result.location_name) {
        resultLocation.append(document.createTextNode(`Lokasi: ${result.location_name}`));
    } else if (result.latitude != null && result.longitude != null) {
        resultLocation.append(document.createTextNode('Lokasi: '));
        resultLocation.append(document.createTextNode(
            `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`
        ));
    } else {
        resultLocation.textContent = 'Lokasi foto tidak tersedia.';
    }
    if (result.latitude != null && result.longitude != null) {
        const mapLink = document.createElement('a');
        mapLink.href = `https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=18/${result.latitude}/${result.longitude}`;
        mapLink.target = '_blank';
        mapLink.rel = 'noreferrer';
        mapLink.textContent = 'Lihat peta';
        resultLocation.append(mapLink);
    }

    // Show result section
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}
