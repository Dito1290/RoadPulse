#!/bin/sh
# Dijalankan setiap container backend start: siapkan database & file statis, lalu jalankan Gunicorn.
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput --verbosity 0

if [ ! -f ai_model/mobilenetv2_road_damage.pt ]; then
  echo "PERINGATAN: ai_model/mobilenetv2_road_damage.pt tidak ada di image."
  echo "            Klasifikasi foto akan gagal (HTTP 503) sampai file model disalin lalu image di-build ulang."
fi

exec gunicorn roadpulse.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-120}" \
  --access-logfile - \
  --error-logfile -
