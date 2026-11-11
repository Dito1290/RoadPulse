# Deploy RoadPulse ke Server

Paket ini menjalankan RoadPulse di satu server dengan Docker:

| Layanan | Isi |
|---|---|
| `db` | PostgreSQL 16 (data tersimpan di volume `pgdata`) |
| `backend` | Django + Gunicorn + model AI (PyTorch CPU) |
| `caddy` | HTTPS otomatis (Let's Encrypt), dashboard web, foto `/media/`, file statis admin |

Semua di bawah satu domain: `https://DOMAIN/` (dashboard), `/api/` (API), `/admin/` (Django Admin), `/privacy/` (Kebijakan Privasi), `/healthz/` (cek kesehatan).

Paket ini sudah diuji utuh dengan Docker: HTTPS, login wajib (tanpa token → 401), unggah foto dengan model asli, logout mencabut token, login Django Admin, batas unggah 12 MB (413), batas percobaan login yang tidak bisa diakali header `X-Forwarded-For`, pindah data lama, dan data tetap ada setelah restart.

> **Server bersama yang sudah memakai nginx** (mis. server kampus `roadpulse.iet-polinela.my.id`):
> jangan pakai `docker-compose.yml` (Caddy-nya memakai port 80/443 dan akan bentrok).
> Pakai `docker-compose.nginx.yml` (hanya membuka `127.0.0.1:ROADPULSE_PORT`) dan tempel
> `nginx/roadpulse.conf` ke file config nginx milik roadpulse, lalu HTTPS dengan certbot.
> Semua perintah: `sudo docker compose -f docker-compose.nginx.yml ...`.

## 1. Yang perlu disiapkan

- **VPS Linux** (Ubuntu 22.04/24.04 disarankan) dengan **RAM minimal 2 GB** (4 GB lebih nyaman; model AI memakai ±300 MB per worker) dan disk ±10 GB.
- **Domain** dengan DNS **A record** mengarah ke IP publik server, misalnya `roadpulse.contoh.id`.
- Port **80** dan **443** terbuka di firewall/security group server.
- File model **`mobilenetv2_road_damage.pt`** (tidak ada di Git; ambil dari laptop tim di `backend/ai_model/`).

## 2. Pasang Docker di server

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # lalu logout & login lagi
docker compose version          # pastikan perintah ini jalan
```

Jika RAM hanya 2 GB, tambahkan swap agar build tidak gagal:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 3. Ambil kode dan file model

```bash
git clone https://github.com/Dito1290/RoadPulse.git
cd RoadPulse
```

Dari **laptop**, kirim file model ke server (ganti `user@IP-SERVER`):

```bash
scp backend/ai_model/mobilenetv2_road_damage.pt user@IP-SERVER:~/RoadPulse/backend/ai_model/
```

## 4. Isi konfigurasi

```bash
cd deploy
cp .env.example .env
python3 -c "import secrets; print(secrets.token_urlsafe(50))"   # salin ke SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(24))"   # salin ke DB_PASSWORD
nano .env
```

Isi `DOMAIN`, `ACME_EMAIL`, `SECRET_KEY`, `DB_PASSWORD`, dan `PRIVACY_CONTACT_EMAIL`. Simpan baik-baik isi `.env` ini; jangan di-commit.

## 5. Jalankan

```bash
docker compose up -d --build
docker compose ps        # tunggu sampai backend "healthy" dan caddy "Up"
```

Build pertama memakan waktu 5–15 menit (mengunduh PyTorch). Lalu buat akun administrator:

```bash
docker compose exec backend python manage.py createsuperuser
```

Cek di browser:

- `https://DOMAIN/healthz/` → `{"status": "ok", "database": true}`
- `https://DOMAIN/` → dialihkan ke halaman login
- `https://DOMAIN/admin/` → login dengan akun administrator

Jika log menampilkan `PERINGATAN: ai_model/mobilenetv2_road_damage.pt tidak ada`, salin file model (langkah 3) lalu `docker compose up -d --build` lagi.

## 6. (Opsional) Pindahkan data dari laptop

Di **laptop**:

```bash
cd backend
venv311/bin/python manage.py dumpdata --natural-foreign --natural-primary \
  -e contenttypes -e auth.permission -e admin.logentry -e sessions -o roadpulse_data.json
scp roadpulse_data.json user@IP-SERVER:~/RoadPulse/deploy/
scp -r media/uploads user@IP-SERVER:~/RoadPulse/deploy/uploads
```

Di **server** (folder `deploy/`), sebelum ada data lain:

```bash
docker compose cp roadpulse_data.json backend:/tmp/roadpulse_data.json
docker compose exec backend python manage.py loaddata /tmp/roadpulse_data.json
docker compose cp uploads/. backend:/app/media/uploads/
docker compose exec -u root backend chown -R app:app /app/media
rm -r roadpulse_data.json uploads
```

Akun lama tetap bisa login dengan kata sandi yang sama.

## 7. Aplikasi mobile (APK / Play Store)

1. Ganti `https://roadpulse.contoh.id` di `mobile/eas.json` dengan domain Anda.
2. Di laptop: `npm install -g eas-cli`, lalu `cd mobile && eas login`.
3. APK untuk dicoba: `eas build -p android --profile preview`
4. Play Store (AAB): `eas build -p android --profile production`, lalu `eas submit -p android`.

Play Store meminta URL Kebijakan Privasi: gunakan `https://DOMAIN/privacy/`.

## 8. Perawatan

| Keperluan | Perintah (di folder `deploy/`) |
|---|---|
| Update ke kode terbaru | `git pull && docker compose up -d --build` |
| Lihat log | `docker compose logs -f backend` (atau `caddy`, `db`) |
| Restart | `docker compose restart` |
| Backup database | `docker compose exec -T db pg_dump -U roadpulse roadpulse > backup-$(date +%F).sql` |
| Backup foto | `docker compose cp backend:/app/media ./media-backup-$(date +%F)` |
| Restore database | `docker compose exec -T db psql -U roadpulse roadpulse < backup-YYYY-MM-DD.sql` |

Ganti `roadpulse` pada perintah backup bila `DB_USER`/`DB_NAME` di `.env` diubah. Simpan backup di luar server (mis. unduh dengan `scp`) secara rutin.

**Jangan** menjalankan `docker compose down -v`: opsi `-v` menghapus database dan semua foto.

## 9. Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| `docker compose` berhenti dengan "Isi ... di deploy/.env" | Variabel wajib di `.env` masih kosong. |
| Sertifikat HTTPS tidak terbit | DNS domain belum mengarah ke IP server, atau port 80/443 tertutup. Cek `docker compose logs caddy`. |
| Backend tidak "healthy" | `docker compose logs backend`; biasanya `SECRET_KEY` kurang dari 50 karakter atau database belum siap. |
| Klasifikasi foto 503 | File model belum disalin (lihat langkah 3), lalu build ulang. |
| Build terhenti / "Killed" | RAM kurang; tambahkan swap (langkah 2). |
| Unggah foto 429 | Batas 120 foto/jam per akun; ubah `THROTTLE_CLASSIFY` di `.env` lalu `docker compose up -d`. |
