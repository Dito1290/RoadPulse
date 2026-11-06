# Image produksi backend RoadPulse (Django + Gunicorn + model PyTorch CPU).
# Dibangun oleh deploy/docker-compose.yml; jangan lupa letakkan
# ai_model/mobilenetv2_road_damage.pt sebelum build (file ini tidak ada di Git).
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# PyTorch versi CPU (jauh lebih kecil dari versi CUDA); fallback ke PyPI bila arsitektur tidak tersedia.
RUN pip install torch==2.2.2 torchvision==0.17.2 --index-url https://download.pytorch.org/whl/cpu \
    || pip install torch==2.2.2 torchvision==0.17.2

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Jalan sebagai user biasa; folder volume dibuat lebih dulu agar kepemilikannya ikut ke volume.
RUN useradd --create-home --uid 1000 app \
    && mkdir -p /app/media/uploads /app/staticfiles \
    && chown -R app:app /app/media /app/staticfiles \
    && chmod +x /usr/local/bin/docker-entrypoint.sh
USER app

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/healthz/', timeout=4).status == 200 else 1)"

ENTRYPOINT ["docker-entrypoint.sh"]
