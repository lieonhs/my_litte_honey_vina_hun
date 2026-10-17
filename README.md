# Buku Besar Pribadi

Pembukuan pribadi dengan konsep perusahaan: COA, jurnal double-entry, buku besar, neraca saldo, rekonsiliasi bank, anggaran, Laba Rugi / Neraca / Arus Kas, reverse & reklas, serta tutup periode. Struk dan screenshot bank dibaca dengan Gemini.

**Arsitektur**
- **GitHub Pages**: menampilkan halaman. Halamannya publik, tetapi tanpa login tidak ada data yang tampil.
- **Supabase**: menyimpan data dan mengurus login. Row Level Security memastikan hanya akunmu yang bisa membaca datamu.
- **Supabase Edge Function `read-receipt`**: meneruskan foto ke Gemini. API key Gemini hanya disimpan di sini.

```
index.html              aplikasi
config.js               URL & anon key Supabase (aman untuk publik)
manifest.webmanifest    supaya bisa "Add to Home Screen" di HP
supabase/schema.sql     tabel + aturan keamanan
supabase/functions/read-receipt/index.ts   pembaca foto (Gemini)
```

---

## Setup (±20 menit, sekali saja)

### 1. Buat project Supabase
1. Daftar di https://supabase.com lalu buat **New project**. Region terdekat: **Singapore**.
2. Buka **SQL Editor**, paste isi `supabase/schema.sql`, lalu klik **Run**.

### 2. Buat akun login dan tutup pendaftaran
1. Buka **Authentication → Users → Add user**, isi email dan password kamu, lalu centang *Auto confirm*.
2. Buka **Authentication → Sign In / Providers** dan **matikan "Allow new users to sign up"**.
   Langkah ini penting. Kalau dibiarkan menyala, orang lain bisa membuat akun sendiri dan memakai kuota Gemini-mu. Data kamu tetap aman karena RLS, tapi kuotanya tidak.

### 3. Ambil API key Gemini
1. Buka https://aistudio.google.com, lalu **Get API key → Create API key**.
2. Simpan key-nya. **Jangan pernah** ditaruh di `config.js` atau di repo GitHub.

### 4. Deploy Edge Function
Lewat dashboard Supabase (tanpa perlu install apa pun):
1. Buka **Edge Functions → Deploy a new function → Via Editor**, beri nama **`read-receipt`**, paste isi `supabase/functions/read-receipt/index.ts`, lalu Deploy.
2. Di **Edge Functions → Secrets**, tambahkan:
   | Nama | Nilai |
   |---|---|
   | `GEMINI_API_KEY` | key dari langkah 3 |
   | `ALLOWED_EMAILS` | email login kamu (lapisan pengaman tambahan) |
   | `GEMINI_MODEL` | *(opsional)* default `gemini-3.5-flash-lite`; ganti ke `gemini-3.6-flash` kalau hasil bacaannya kurang akurat |

Alternatif lewat CLI:
```bash
supabase functions deploy read-receipt
supabase secrets set GEMINI_API_KEY=xxx ALLOWED_EMAILS=kamu@email.com
```

### 5. Isi `config.js`
Buka **Project Settings → API** (atau tombol **Connect**), lalu salin:
- **Project URL** ke `SUPABASE_URL`
- **anon / publishable key** ke `SUPABASE_ANON_KEY`

Jangan pakai *service_role / secret key*. Key itu bisa melewati semua aturan keamanan.

### 6. Upload ke GitHub Pages
1. Buat repo baru di GitHub, lalu upload semua file di folder ini (boleh lewat tombol *Add file → Upload files*).
2. Buka **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.
3. Tunggu 1–2 menit. Situs akan aktif di `https://<username>.github.io/<nama-repo>/`.
4. Di Supabase, buka **Authentication → URL Configuration** dan isi **Site URL** dengan alamat itu.

### 7. Pakai di HP
Buka alamat GitHub Pages di Chrome, lalu pilih menu ⋮ → **Add to Home screen**.

---

## Catatan penting
- **Repo publik itu aman, asalkan** isinya hanya anon key dan RLS aktif. Kalau mau ekstra aman, buat repo **private**. Perlu dicatat, GitHub Pages dari repo private butuh akun berbayar (GitHub Pro).
- **Kuota gratis Gemini** bisa berubah sewaktu-waktu. Cek di https://ai.google.dev/gemini-api/docs/pricing. Kalau kuota habis, input manual tetap bisa dipakai.
- **Supabase free tier mem-pause project yang tidak aktif ±1 minggu.** Kalau aplikasi tidak bisa login, buka dashboard Supabase lalu klik *Restore*. Datanya tidak hilang.
- **Backup**: menu Pengaturan → Periode Akuntansi → *Ekspor backup (JSON)*. Lakukan rutin, misalnya setiap tutup bulan.
- Data dari versi yang dibuka di Claude **tidak ikut pindah** karena tersimpan di tempat lain. Isi ulang saldo awal di menu Rekonsiliasi.

---

## Dua jurnal dalam satu website
Tombol di bawah header:
- **💰 Jurnal Keuangan**: Dashboard, Input Transaksi (foto struk), Jurnal Umum, Buku Besar, Neraca Saldo, Rekonsiliasi, Anggaran, Laporan Keuangan, COA, Periode.
- **📔 Jurnal Harian**: **Hari Ini** (agenda, tagihan 7 hari, uang hari ini), **Kalender** (kalender sendiri seperti Google Calendar: bulanan/mingguan, acara berulang, jadwal mingguan, pengingat keuangan otomatis), **Jurnal Harian** (mood, kegiatan, satu hal baik, kata-kata hari ini, tag, riwayat mood 30 hari), **Catatan** (catatan bebas, checklist, koleksi kata-kata, warna, pin, tag, pencarian). Halaman Hari Ini juga menampilkan **💬 Kata-kata hari ini** yang berganti setiap hari.

Semua acara & jurnal disimpan di Supabase yang sama (per akun) — **tidak perlu Google Calendar / Google Cloud**.

**Notifikasi**: tekan *Aktifkan* di halaman Kalender/Hari Ini. Notifikasi muncul selama aplikasi terbuka (termasuk tab di belakang di laptop) + karakter ngintip. Jika aplikasi benar-benar ditutup di HP, notifikasi tidak bisa muncul (butuh server push terpisah).

**Dua bahasa**: tombol **EN / ID** di kanan atas (`i18n.js`).

## 🎯 Misi, achievement & koleksi stiker
- Tombol **🎯** di header (angka merah = hadiah siap diklaim) → **Misi & Achievement**.
- **Misi harian** (catat transaksi, tulis jurnal, tulis catatan, bonus semua selesai), **misi mingguan** (cek saldo real, jurnal 5 hari, 10 transaksi), dan **18 achievement** (rekening siap, buku = bank, tutup buku, streak jurnal 7/30 hari, koleksi stiker, dll.).
- Klaim → buka kartu → dapat **stiker karakter**. 45 stiker (15 karakter × 3 pose): **Biasa** (Pipi, Moci, Kodi, Cimi, Mumu), **Langka** (Bubu, Pandi, Kiki, Popo, Rubi), **Legendaris** (5 Vina — paling langka).
- **Album Stiker** menampilkan koleksi; 5 duplikat bisa ditukar jadi 1 tarikan. Stiker yang dimiliki muncul kecil-kecil di judul tiap halaman.

## Tampilan, karakter & tutorial
- **15 karakter, 15 tema warna**: Pipi 🐷, Moci 🐱, Kodi 🐸, Cimi 🐥, Mumu 🐮, Bubu 🐻, Pandi 🐼, Kiki 🐰, Popo 🐧, Rubi 🦊, Vina Kasual 🧢, Vina Kantor 👔, Vina Oranye 🧡, Vina Santai 🖤, Vina Komuter 🚆. Pilih di Dashboard → *Ganti teman* atau Bantuan → Panduan. Tersimpan per akun.
- **Mode Lucu ↔ Mode Pro** (gaya ERP polos): tombol di header kanan atas.
- **🎨 Opsi Tampilan** (tombol 🎨 di header, atau Bantuan → Opsi Tampilan):
  - **Tingkat lucu**: *Lucu penuh* (semua halaman ikut lucu, termasuk Input Transaksi, Jurnal Umum, Buku Besar, Neraca Saldo, Rekonsiliasi, Anggaran, Laporan, COA, Periode) atau *Lucu ringan*.
  - **Terang / gelap / ikut HP**, **pola latar** (polos, titik, hati, bintang, awan, kotak), **bentuk** (kotak, bulat, ekstra bulat), **huruf** (Nunito, Fredoka, Baloo, sistem), **ukuran teks** (kecil s.d. ekstra besar).
  - **Hiasan** yang bisa dinyalakan/matikan: teman di tiap halaman (kalimatnya menyesuaikan data, misal rekening yang belum cocok), ikon menu, hiasan melayang, animasi, dan perayaan konfeti saat jurnal diposting.
  - Pilihan disimpan per akun di dokumen `prefs` yang sudah ada, jadi ikut terbawa ke HP/laptop lain. **Tidak perlu mengubah apa pun di Supabase.**
- **Karakter ngintip**: muncul dari pinggir layar tiap 3 menit (atur di Panduan: mati/1/3/5/10/30 menit) membawa pengingat dari datamu. Ketuk untuk membuka menu terkait.
- **Tur interaktif** saat pertama login; ulangi dari Bantuan → Panduan & Tutorial.
- Panduan lengkap bergambar: **TUTORIAL.pdf**.

## Daftar file
| File | Fungsi | Tujuan |
|---|---|---|
| `index.html` | Aplikasi utama (pembukuan) | GitHub |
| `schedule.js` | Jurnal Harian: Hari Ini, Kalender, Jurnal, notifikasi | GitHub |
| `sw.js` | Notifikasi pengingat | GitHub |
| `fun.js` | Karakter, tema, tur, panduan, ngintip | GitHub |
| `quest.js` | Misi, achievement, album stiker | GitHub |
| `cute.js` | Opsi Tampilan + mode Lucu penuh di semua halaman | GitHub |
| `i18n.js` | Dua bahasa (ID/EN) | GitHub |
| `config.js` | Supabase URL & publishable key | GitHub |
| `manifest.webmanifest`, `icon.svg` | Add to Home screen | GitHub |
| `supabase/schema.sql` | Tabel & aturan keamanan | Supabase SQL Editor |
| `supabase/functions/read-receipt/index.ts` | Baca foto struk | Edge Function `read-receipt` |
