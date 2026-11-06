#!/usr/bin/env bash
# Jalankan seluruh RoadPulse dengan satu perintah:  ./start.sh
#   Django :8001 + proxy :8000 + dashboard web :3000 + Expo (QR untuk Expo Go)
# Opsi:  ./start.sh --no-mobile   (tanpa Expo)
#        DB_ENGINE=sqlite ./start.sh   (default: postgresql)
# Tekan Ctrl+C untuk mematikan semuanya.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOGS="$ROOT/.logs"
mkdir -p "$LOGS"
export DB_ENGINE="${DB_ENGINE:-postgresql}"
PY="$ROOT/backend/venv311/bin/python"
[ -x "$PY" ] || { echo "✗ venv tidak ditemukan: backend/venv311 (lihat User Manual bab 2)"; exit 1; }

# Bebaskan port bila masih dipakai sesi sebelumnya
for port in 8001 8000 3000; do
  pids=$(lsof -t -nP -iTCP:$port -sTCP:LISTEN 2>/dev/null || true)
  [ -n "$pids" ] && { echo "• Port $port dipakai (PID $pids), dihentikan"; kill $pids 2>/dev/null || true; }
done
sleep 1

PIDS=()
cleanup() { echo; echo "Menghentikan layanan RoadPulse…"; kill "${PIDS[@]}" 2>/dev/null || true; }
trap cleanup EXIT
trap 'exit 130' INT TERM

(cd "$ROOT/backend" && exec "$PY" manage.py runserver 127.0.0.1:8001 --noreload) >"$LOGS/django.log" 2>&1 & PIDS+=($!)
(cd "$ROOT/backend" && exec node proxy.js) >"$LOGS/proxy.log" 2>&1 & PIDS+=($!)
(cd "$ROOT/frontend" && exec python3 -m http.server 3000) >"$LOGS/frontend.log" 2>&1 & PIDS+=($!)

# Tunggu API siap lewat proxy
printf "• Menunggu API"
for _ in $(seq 1 60); do
  curl -s -o /dev/null -m 2 http://127.0.0.1:8000/api/v1/ && break
  printf "."; sleep 1
done
echo
if ! curl -s -o /dev/null -m 2 http://127.0.0.1:8000/api/v1/; then
  echo "✗ API tidak merespons. Lihat log:"; tail -n 15 "$LOGS/django.log" "$LOGS/proxy.log"; exit 1
fi

IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo localhost)"
# Arahkan aplikasi mobile ke IP komputer saat ini (otomatis tiap start)
printf '# Diisi otomatis oleh start.sh\nEXPO_PUBLIC_API_URL=http://%s:8000\n' "$IP" >"$ROOT/mobile/.env.local"

cat <<EOF

✓ RoadPulse berjalan  (database: $DB_ENGINE, log: .logs/)
  Dashboard web   http://localhost:3000      (HP: http://$IP:3000)
  API / Swagger   http://localhost:8000/api/docs/
  Django Admin    http://127.0.0.1:8001/admin/
  Alamat mobile   http://$IP:8000

EOF

if [ "${1:-}" = "--no-mobile" ]; then
  echo "Tekan Ctrl+C untuk berhenti."; wait
else
  cd "$ROOT/mobile" && npx expo start --clear
fi
