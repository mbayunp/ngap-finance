# Panduan Deployment Ngap Finance ke VPS (Picme)

Panduan ini berisi langkah-langkah praktis untuk mendepoy aplikasi Ngap Finance (Node.js/Express + React/Vite) ke VPS produksi menggunakan PM2 dan Nginx.

## 1. Setup Database di VPS

Aplikasi ini menggunakan MySQL. Pastikan MySQL Server sudah terinstal dan berjalan di VPS Anda.

1. Login ke MySQL melalui terminal VPS:
   ```bash
   mysql -u root -p
   ```
2. Buat database `ngap_finance`:
   ```sql
   CREATE DATABASE ngap_finance;
   EXIT;
   ```
3. Import skema dan data awal (jika ada file `.sql`):
   ```bash
   mysql -u root -p ngap_finance < backend/ngap_finance.sql
   ```

## 2. Setup & Menjalankan Backend (PM2)

Backend dibangun menggunakan Express.js dan akan di-hosting menggunakan PM2 agar berjalan di background dan otomatis *restart* jika VPS reboot.

1. Masuk ke direktori backend:
   ```bash
   cd path/to/ngap-finance/backend
   ```
2. Install semua dependensi:
   ```bash
   npm install
   ```
3. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
4. Sesuaikan konfigurasi `.env` menggunakan nano/vim:
   ```bash
   nano .env
   ```
   *Pastikan port adalah 5001 (atau port lain selain 5000) dan kredensial database sesuai dengan setup MySQL di VPS Anda.*
5. Install PM2 secara global (jika belum ada):
   ```bash
   npm install -g pm2
   ```
6. Jalankan backend menggunakan PM2:
   ```bash
   pm2 start index.js --name "ngap-finance-backend"
   ```
7. Simpan konfigurasi PM2 agar otomatis berjalan saat *startup*:
   ```bash
   pm2 save
   pm2 startup
   ```

## 3. Setup & Build Frontend

Frontend dibangun menggunakan Vite. Kita akan mem-build aplikasi menjadi file statis (`dist`) yang nantinya disajikan oleh Nginx.

1. Masuk ke direktori frontend:
   ```bash
   cd path/to/ngap-finance/frontend
   ```
2. Install semua dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` (berdasarkan `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Sesuaikan `.env` dengan IP/Domain VPS dan port backend Anda:
   ```bash
   nano .env
   # Ganti isi dengan: VITE_API_URL=http://<IP_VPS_ANDA>:5001
   ```
5. Build frontend untuk produksi:
   ```bash
   npm run build
   ```
   *Perintah ini akan menghasilkan folder `dist/` yang siap dideploy.*

## 4. Konfigurasi Nginx untuk Frontend

Gunakan Nginx untuk menyajikan folder statis hasil build frontend.

1. Buat file konfigurasi baru di Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/ngap-finance
   ```
2. Masukkan konfigurasi berikut (sesuaikan path folder `dist` dan `server_name`):
   ```nginx
   server {
       listen 80;
       server_name domainanda.com atau_IP_VPS;

       root /path/to/ngap-finance/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. Aktifkan konfigurasi Nginx dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ngap-finance /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

Aplikasi Ngap Finance sekarang seharusnya sudah berhasil berjalan di VPS Anda!
