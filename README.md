# Bakso Berkah — Website Warung & Pemesanan Online

Website restoran dan sistem pemesanan online full-stack untuk **Bakso Berkah**, dibangun dengan **Nuxt 3** (Nitro Server API), **Tailwind CSS**, **Drizzle ORM**, dan **TiDB Cloud** (MySQL-compatible dengan SSL/TLS).

## Fitur Utama

1. **Halaman Pelanggan (`/`)**:
   - Hero & informasi warung (status Buka/Tutup real-time, jam operasional, alamat, tombol Google Maps otomatis muncul hanya jika `maps_url` diisi).
   - Katalog menu dengan tab kategori (*Semua, Bakso, Mie & Kwetiau, Nasi, Minuman*), pencarian, badge *Terlaris*, dan status *Habis*.
   - Modal kustomisasi cerdas:
     - **Bakso**: pilihan mie (*Mie Kuning, Bihun, Campur, Tanpa Mie*), tingkat pedas (*Tidak Pedas, Sedang, Pedas, Pedas Gila*), dan catatan.
     - **Mie & Nasi**: tingkat pedas, catatan, serta pilihan *Goreng / Kuah* khusus untuk *Mie Tiaw*.
   - Keranjang melayang & checkout WhatsApp: simpan pesanan ke TiDB Cloud (`/api/orders`), hasilkan kode pesanan unik, dan buka pesan WhatsApp terformat (`https://wa.me/...`).

2. **Dashboard Admin & Kasir (`/admin`)**:
   - Dilindungi login PIN (`ADMIN_PIN` di `.env`, default `1234`).
   - **Pesanan Masuk**: pantau pesanan terbaru, ubah status (`Menunggu` → `Dimasak` → `Selesai` / `Dibatalkan`).
   - **Kelola Menu & Harga**: ubah harga cepat, toggle `Tersedia / Habis` satu klik, tambah menu baru, edit detail & deskripsi.
   - **Pengaturan Warung & Peta**: buka/tutup warung, nomor WhatsApp, alamat, jam buka, serta tautan Google Maps & embed URL opsional.

## Konfigurasi TiDB Cloud

1. Salin `.env.example` menjadi `.env` lalu isi koneksi TiDB Cloud Anda:

```env
DATABASE_URL=mysql://USER.root:PASSWORD@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/bakso_berkah
ADMIN_PIN=1234
ADMIN_SESSION_SECRET=ganti-dengan-string-rahasia-panjang
```

2. Dorong skema Drizzle ke TiDB Cloud dan jalankan seeder awal:

```bash
npm run db:push
npm run db:seed
```

*(Server Nitro juga otomatis membuat tabel jika belum ada dan mengisi data awal Bakso Berkah saat pertama kali terhubung ke TiDB Cloud.)*

## Menjalankan Aplikasi

```bash
# Development server
npm run dev

# Production build & preview
npm run build
npm run preview
```
