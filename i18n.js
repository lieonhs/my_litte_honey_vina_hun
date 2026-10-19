/* =====================================================================
   DUA BAHASA (Indonesia / English)
   Menerjemahkan teks antarmuka saat ditampilkan. Data yang kamu ketik
   sendiri (keterangan transaksi, judul acara) tidak diubah.
   ===================================================================== */
(function(){
let LANG=(()=>{try{return localStorage.getItem("bbp_lang")||"id"}catch(e){return "id"}})();
const MON={Januari:"January",Februari:"February",Maret:"March",April:"April",Mei:"May",Juni:"June",Juli:"July",Agustus:"August",September:"September",Oktober:"October",November:"November",Desember:"December"};
const MONS={Jan:"Jan",Feb:"Feb",Mar:"Mar",Apr:"Apr",Mei:"May",Jun:"Jun",Jul:"Jul",Agu:"Aug",Sep:"Sep",Okt:"Oct",Nov:"Nov",Des:"Dec"};
const DAY={Senin:"Monday",Selasa:"Tuesday",Rabu:"Wednesday",Kamis:"Thursday",Jumat:"Friday",Sabtu:"Saturday",Minggu:"Sunday"};
const MRE=Object.keys(MON).join("|"),DRE=Object.keys(DAY).join("|");
function M(s){return s.replace(new RegExp("\\b("+MRE+")\\b","g"),m=>MON[m]).replace(new RegExp("\\b("+DRE+")\\b","g"),m=>DAY[m])
  .replace(/(\d{1,2}) (Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\b/g,(_,d,m)=>d+" "+MONS[m]).replace(/\b(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\b(?= \(YTD\))/g,m=>MONS[m])}

/* ---------- kamus kalimat utuh ---------- */
const D={
// header, navigasi, umum
"RaVi":"RaVi","Keluar":"Log out","Pro":"Pro","Lucu":"Fun","Beranda":"Home","Dashboard":"Dashboard","Jadwal":"Schedule","Jadwal (Google Calendar)":"Schedule (Google Calendar)",
"Transaksi":"Transactions","Input Transaksi":"Add Transaction","Jurnal Umum":"General Journal","Buku Besar":"General Ledger","Inquiry Buku Besar":"Ledger Inquiry","Neraca Saldo":"Trial Balance",
"Rekonsiliasi Kas & Bank":"Cash & Bank Reconciliation","Perencanaan":"Planning","Anggaran":"Budget","Pelaporan":"Reporting","Laporan Keuangan":"Financial Statements","Pengaturan":"Settings",
"Bagan Akun (COA)":"Chart of Accounts (COA)","Periode Akuntansi":"Accounting Periods","Bantuan":"Help","Panduan & Tutorial":"Guide & Tutorial","Panduan":"Guide","Opsi Tampilan":"Display Options",
"Ganti ke mode profesional":"Switch to professional mode","Ganti ke mode lucu":"Switch to fun mode",
"Batal":"Cancel","Simpan":"Save","Hapus":"Delete","Edit":"Edit","Buka":"Open","Posting":"Post","Tutup":"Close","Lanjut":"Next","Kembali":"Back","Lewati":"Skip","Selesai":"Done","Lihat semua":"See all",
"Kode":"Code","Akun":"Account","Nama Akun":"Account Name","Nama akun":"Account name","Tipe":"Type","Saldo Normal":"Normal Balance","Saldo":"Balance","Debit":"Debit","Kredit":"Credit","Total":"Total","Status":"Status","Aksi":"Actions",
"Tanggal":"Date","Keterangan":"Description","No. Jurnal":"Entry No.","Lawan akun":"Contra account","Jumlah":"Amount","Uraian":"Description","Periode":"Period","Kelompok":"Group",
"Aset":"Asset","Liabilitas":"Liability","Ekuitas":"Equity","Pendapatan":"Income","Beban":"Expense","Seimbang":"Balanced","Diposting":"Posted","Penyesuaian":"Adjustment","Saldo awal":"Opening balance",
"Kosong":"Empty","Tidak ada jurnal.":"No journal entries.","Belum ada saldo.":"No balances yet.","Tidak ada mutasi.":"No movements.","Tidak ada arus kas pada periode ini.":"No cash flows in this period.",
"Jurnal diposting.":"Entry posted.","Penyimpanan belum siap.":"Storage not ready.","Menyambungkan ke Google Calendar…":"Connecting to Google Calendar…",
// login & status
"Masuk dengan akun yang kamu buat di Supabase.":"Sign in with the account you created in Supabase.","Email":"Email","Password":"Password","Masuk":"Sign in",
"Penyimpanan tidak tersedia (login ke claude.ai / aplikasi Claude).":"Storage unavailable.","Tidak bisa mengenali akun kamu.":"Could not identify your account.",
"config.js belum diisi (SUPABASE_URL & SUPABASE_ANON_KEY). Lihat README.":"config.js is not filled in (SUPABASE_URL & SUPABASE_ANON_KEY). See README.",
// dashboard
"+ Transaksi":"+ Transaction","Total kas & bank":"Total cash & bank","per buku besar":"per ledger","Kekayaan bersih":"Net worth","Surplus bulan ini":"Surplus this month",
"Posisi Kas & Bank":"Cash & Bank Position","Saldo Buku":"Book Balance","Saldo Real":"Real Balance","Selisih":"Difference","Belum dicek":"Not checked","Tidak cocok":"Mismatch","Cocok":"Matched","Jurnal Terakhir":"Recent Entries",
"Buka rekonsiliasi":"Open reconciliation","Buat anggaran":"Create budget","foto":"photo","Tur singkat":"Quick tour","Ganti teman":"Change buddy","Cek sekarang":"Check now","Lihat anggaran":"View budget",
"Isi saldo awal rekening":"Enter opening balances","Cocokkan saldo real":"Match real balances","Buat anggaran bulan ini":"Create this month's budget","Catat transaksi pertama (coba foto struk!)":"Record your first transaction (try a receipt photo!)",
"Hubungkan Google Calendar (opsional)":"Connect Google Calendar (optional)",
"Waduh, ada saldo yang nggak cocok!":"Uh-oh, a balance doesn't match!","Ada anggaran yang jebol nih":"A budget has been blown","Jangan lupa cocokkan saldo real minggu ini ya.":"Don't forget to match your real balances this week.",
"Semua saldo cocok dan anggaran aman. Mantap, pertahankan! 🎉":"All balances match and budgets are safe. Great, keep it up! 🎉",
"Aku bantu jaga keuanganmu. Selesaikan langkah awal di bawah, atau ikuti tur singkat dulu.":"I'll help look after your money. Finish the first steps below, or take the quick tour first.",
"Selamat pagi!":"Good morning!","Selamat siang!":"Good afternoon!","Selamat sore":"Good afternoon","Selamat sore!":"Good afternoon!","Selamat malam!":"Good evening!",
// input transaksi
"Dari bukti transaksi":"From a receipt","Foto struk, screenshot m-banking, atau riwayat OVO":"Receipt photo, m-banking screenshot, or OVO history","Kamera":"Camera","Pilih gambar":"Choose image","Isi manual":"Enter manually",
"AI membaca gambar dan memilih akun GL; kamu periksa sebelum posting.":"AI reads the image and picks the GL account; you review before posting.","Detail transaksi":"Transaction details","Jenis":"Type",
"Pengeluaran (beban)":"Spending (expense)","Penerimaan (pendapatan)":"Receipt (income)","Transfer antar akun sendiri":"Transfer between own accounts","Dibayar dari":"Paid from","Diterima di":"Received in","Dari akun":"From account","Ke akun":"To account",
"Akun GL":"GL account","Nominal (Rp)":"Amount (Rp)","Biaya admin (Rp)":"Admin fee (Rp)","Keterangan / merchant":"Description / merchant","Saldo akhir di bukti (opsional, untuk rekonsiliasi)":"Ending balance on receipt (optional, for reconciliation)",
"Pratinjau jurnal":"Journal preview","Posting jurnal":"Post entry","Lainnya (non-beban)":"Other (non-expense)","Lainnya (non-pendapatan)":"Other (non-income)","Membaca gambar…":"Reading image…",
"Terbaca. Periksa pratinjau jurnal lalu posting.":"Read successfully. Check the journal preview, then post.","Akun kas/bank tidak terlihat di bukti, pilih sendiri.":"The cash/bank account isn't visible on the receipt — pick it yourself.",
"Baca foto tidak aktif di tampilan ini. Isi manual.":"Photo reading isn't available here. Enter manually.","Izin baca foto ditolak. Isi manual.":"Photo reading permission denied. Enter manually.",
"Nominal belum diisi.":"Amount is empty.","Akun asal dan tujuan sama.":"Source and destination accounts are the same.",
// jurnal
"+ Jurnal manual":"+ Manual entry","Jurnal manual":"Manual entry","Reverse":"Reverse","Reklas":"Reclass","+ Baris":"+ Line","Alasan":"Reason","Tanggal pembalikan":"Reversal date",
"Untuk transaksi di luar kas biasa: pinjaman, PayLater, piutang teman, deposit kost, koreksi.":"For non-cash transactions: loans, PayLater, receivables from friends, rent deposits, corrections.",
"Jurnal yang sudah diposting tidak bisa dihapus. Salah nominal/tanggal →":"Posted entries can't be deleted. Wrong amount/date →","lalu posting ulang. Salah akun saja →":"then post again. Only the account is wrong →",
"Baris yang salah akun":"Line with the wrong account","Pindahkan ke akun":"Move to account","Nominal direklas":"Amount to reclass","Pratinjau":"Preview",
"Memindahkan nominal dari satu akun ke akun lain (mis. tercatat di 5203 Kopi padahal 5201 Makan Harian, atau dibayar dari Jago padahal OCBC).":"Moves an amount from one account to another (e.g. booked to 5203 Coffee instead of 5201 Daily Meals, or paid from Jago instead of OCBC).",
"mis. salah nominal / dobel input":"e.g. wrong amount / double entry","Nominal belum diisi.":"Amount is empty.","Akun tujuan sama dengan akun asal.":"Destination account equals the source account.",
// GL, TB
"Akun pendapatan & beban belum ditutup; selisihnya adalah surplus berjalan. Ketuk baris untuk buka buku besar.":"Income & expense accounts are not closed; the difference is the running surplus. Tap a row to open the ledger.",
// rekonsiliasi
"Status rekonsiliasi":"Reconciliation status","Saldo Awal":"Opening Balance","Tgl. cek":"Checked","Saldo real":"Real balance","Jurnal penyesuaian":"Adjusting entry",
"Isi saldo real dari aplikasi bank/e-wallet. Baris merah = buku besar tidak sama dengan kenyataan. Penyebab umum: transaksi belum dicatat, biaya admin bulanan, bunga, cashback, atau salah baca nominal.":"Enter real balances from your bank/e-wallet apps. Red row = ledger differs from reality. Common causes: unrecorded transactions, monthly admin fees, interest, cashback, or a misread amount.",
"\"Jurnal penyesuaian\" membukukan selisih ke 5999 Beban Lain-lain / 4299 Pendapatan Lain-lain. Pakai hanya setelah yakin selisihnya tidak bisa dilacak.":"\"Adjusting entry\" books the difference to 5999 Other Expenses / 4299 Other Income. Use only when the difference truly can't be traced.",
"Angka saldo di aplikasi saat ini.":"The balance shown in the app right now.","Saldo sebelum transaksi pertama yang kamu catat (dibukukan ke 3101 Ekuitas Saldo Awal).":"Balance before the first transaction you record (booked to 3101 Opening Balance Equity).",
// anggaran
"Ubah anggaran":"Edit budget","Simpan anggaran":"Save budget","Target tabungan (surplus)":"Savings target (surplus)","Anggaran pendapatan":"Income budget","Anggaran beban":"Expense budget","Belum dialokasikan":"Unallocated",
"pendapatan − beban − tabungan":"income − expenses − savings","Aktual":"Actual","Realisasi":"Progress","Aman":"Safe","Waspada":"Caution","Lewat":"Over","Tanpa anggaran":"No budget","Tercapai":"Achieved","PENDAPATAN":"INCOME","BEBAN":"EXPENSES",
"TOTAL PENDAPATAN":"TOTAL INCOME","TOTAL BEBAN":"TOTAL EXPENSES","SURPLUS / (DEFISIT)":"SURPLUS / (DEFICIT)",
"Selisih positif = menguntungkan (beban di bawah anggaran / pendapatan di atas anggaran). Angka dalam kurung = negatif.":"Positive variance = favourable (expenses under budget / income over budget). Numbers in brackets = negative.",
"Anggaran ini dikonversi otomatis dari rencana versi lama. Simpan ulang supaya rinci per akun.":"This budget was converted from the old plan. Save again for per-account detail.",
"Anggaran pendapatan belum diisi (mis. 4101 Gaji Pokok).":"Income budget is empty (e.g. 4101 Base Salary).",
// laporan
"Cetak / PDF":"Print / PDF","Laba Rugi":"Income Statement","Neraca":"Balance Sheet","Arus Kas":"Cash Flow","Pribadi · dalam Rupiah":"Personal · in Rupiah",
"LAPORAN LABA RUGI":"INCOME STATEMENT","NERACA (POSISI KEUANGAN)":"BALANCE SHEET (FINANCIAL POSITION)","LAPORAN ARUS KAS (METODE LANGSUNG)":"CASH FLOW STATEMENT (DIRECT METHOD)",
"Anggaran ":"Budget ","ASET":"ASSETS","LIABILITAS":"LIABILITIES","TOTAL ASET":"TOTAL ASSETS","TOTAL LIABILITAS":"TOTAL LIABILITIES","EKUITAS (KEKAYAAN BERSIH)":"EQUITY (NET WORTH)","TOTAL EKUITAS":"TOTAL EQUITY",
"TOTAL LIABILITAS & EKUITAS":"TOTAL LIABILITIES & EQUITY","Rasio tabungan bulan ini":"Savings rate this month","surplus ÷ pendapatan":"surplus ÷ income","Beban tempat tinggal ÷ pendapatan":"Housing costs ÷ income",
"kost, listrik, air, internet, dll.":"rent, electricity, water, internet, etc.","Penerimaan":"Receipts","Pengeluaran":"Payments","Arus kas bersih":"Net cash flow","Arus kas dari aktivitas rutin":"Cash flow from routine activities",
"Arus kas dari aset non-kas (piutang, deposit, barang)":"Cash flow from non-cash assets (receivables, deposits, items)","Arus kas dari pendanaan (utang & ekuitas)":"Cash flow from financing (debt & equity)",
"KENAIKAN / (PENURUNAN) KAS BERSIH":"NET INCREASE / (DECREASE) IN CASH","Kas & setara kas awal periode":"Cash & equivalents at start of period","KAS & SETARA KAS AKHIR PERIODE":"CASH & EQUIVALENTS AT END OF PERIOD",
"Transfer antar rekening sendiri saling meniadakan dan tidak muncul; biaya transfernya tetap tercatat sebagai beban.":"Transfers between your own accounts cancel out and don't appear; their fees are still recorded as expenses.",
// COA, periode
"+ Akun baru":"+ New account","Akun baru":"New account","mis. Cicilan Motor":"e.g. Motorbike Instalment","tambahan":"custom","Kelompok ini penuh.":"This group is full.",
"Ekspor backup (JSON)":"Export backup (JSON)","Jumlah jurnal":"Entries","Ditutup":"Closed","Terbuka":"Open","Tutup periode":"Close period","Buka kembali":"Reopen",
"Tutup periode setelah rekonsiliasi bulan itu cocok. Periode tertutup tidak bisa diberi jurnal baru; koreksi dibukukan di periode terbuka berikutnya, seperti closing di perusahaan.":"Close a period once that month reconciles. Closed periods accept no new entries; corrections go to the next open period, like a company close.",
// jadwal
"+ Acara":"+ Event","+ Jadwal mingguan":"+ Weekly schedule","Putuskan":"Disconnect","Kalender":"Calendar","Tampilan":"View","Bulanan":"Monthly","Mingguan":"Weekly","Hari ini":"Today","Muat ulang":"Reload",
"Hubungkan":"Connect","Hubungkan Google Calendar":"Connect Google Calendar","Seharian":"All day","berulang":"recurring","Ada notifikasi":"Has a reminder",
"Jadwal dibaca & ditulis langsung ke Google Calendar kamu. Cukup sekali — setelah itu tetap tersambung di semua perangkat sampai kamu klik Putuskan.":"Your schedule is read & written directly to your Google Calendar. Connect once — it stays connected on all devices until you click Disconnect.",
"🔔 Notifikasi dikirim oleh":"🔔 Notifications are sent by the","aplikasi Google Calendar":"Google Calendar app","di HP kamu (login akun Google yang sama, izinkan notifikasinya). Acara dari sini otomatis ikut.":"on your phone (same Google account, notifications allowed). Events from here are included automatically.",
"Acara baru":"New event","Edit acara":"Edit event","Judul":"Title","Kategori":"Category","Kuliah":"Class","Kerja":"Work","Pribadi":"Personal","Keuangan":"Finance","Lainnya":"Other","Mulai":"Start","Lokasi":"Location","Ulangi":"Repeat",
"Tidak":"No","Setiap hari":"Every day","Setiap minggu":"Every week","Setiap bulan":"Every month","Sampai tanggal":"Until","Pengingat":"Reminder","Default kalender":"Calendar default","Tanpa pengingat":"No reminder",
"10 menit sebelum":"10 minutes before","15 menit sebelum":"15 minutes before","30 menit sebelum":"30 minutes before","1 jam sebelum":"1 hour before","1 hari sebelum":"1 day before","Catatan":"Notes","Tanpa":"None",
"mis. Kuliah Manajemen Keuangan":"e.g. Financial Management class","Ini satu kejadian dari acara berulang. Perubahan hanya berlaku untuk tanggal ini.":"This is one occurrence of a recurring event. Changes apply to this date only.",
"Jam selesai harus setelah jam mulai.":"End time must be after start time.","Judul wajib diisi.":"Title is required.","Hapus acara berulang":"Delete recurring event","Hanya tanggal ini":"This date only","Semua kejadian (seluruh seri)":"All occurrences (entire series)",
"Jadwal mingguan (kuliah / shift kerja)":"Weekly schedule (classes / work shifts)","Isi sekali per semester. Setiap baris dibuat sebagai acara berulang mingguan di Google Calendar sampai tanggal selesai.":"Fill in once per semester. Each row becomes a weekly recurring event in Google Calendar until the end date.",
"Mulai berlaku":"Starts","Sampai":"Until","Hari":"Day","Lokasi / ruang":"Location / room","mis. Ekonometrika / Shift PTMI":"e.g. Econometrics / Work shift","Hapus baris":"Remove row","Buat di Google Calendar":"Create in Google Calendar",
"Periksa tanggal mulai dan selesai.":"Check the start and end dates.","Isi minimal satu judul.":"Fill in at least one title.",
"💸 Pengingat keuangan otomatis":"💸 Automatic money reminders","Atur sekarang":"Set up now","Ubah & sinkronkan":"Edit & sync","Pengingat keuangan":"Money reminders","+ Tagihan":"+ Bill","Nama tagihan":"Bill name","Nominal":"Amount","Jatuh tempo tgl":"Due day","Jam":"Time",
"Tanggal gajian":"Payday","Tidak usah":"None","Cek saldo real mingguan":"Weekly real-balance check","Pengingat tutup periode & backup tiap akhir bulan":"Month-end close & backup reminder","Simpan & sinkronkan":"Save & sync","Akhir bulan":"End of month",
"Setiap pengingat dibuat sebagai acara berulang bulanan dengan notifikasi H-1 dan 1 jam sebelumnya. Sinkron ulang akan mengganti pengingat lama (acara lain tidak tersentuh).":"Each reminder is a monthly recurring event with notifications 1 day and 1 hour before. Re-syncing replaces old reminders (other events are untouched).",
"Tagihan rutin (kost, listrik, internet, cicilan), tanggal gajian, cek saldo mingguan, dan tutup buku akhir bulan dibuat otomatis sebagai pengingat berulang di Google Calendar. Diambil dari anggaranmu.":"Recurring bills (rent, electricity, internet, instalments), payday, weekly balance checks and month-end close become recurring reminders in Google Calendar. Taken from your budget.",
"Tutup periode & backup · akhir bulan":"Close period & backup · end of month","Menghapus pengingat lama…":"Removing old reminders…","Selesai.":"Done.",
"Google Calendar belum terhubung.":"Google Calendar is not connected.","Izin Google habis. Klik Hubungkan lagi.":"Google permission expired. Click Connect again.","Library Google belum termuat, coba lagi sebentar.":"Google library not loaded yet, try again shortly.",
"GOOGLE_CLIENT_ID belum diisi di config.js. Lihat README bagian Google Calendar.":"GOOGLE_CLIENT_ID is not set in config.js. See the Google Calendar section of the README.",
"Google tidak mengirim izin jangka panjang. Buka myaccount.google.com/permissions → hapus akses aplikasi ini → Hubungkan lagi.":"Google didn't send long-term permission. Open myaccount.google.com/permissions → remove this app's access → Connect again.",
"Izin kalender tidak lengkap. Ulangi dan centang semua izin kalender.":"Calendar permissions incomplete. Retry and tick all calendar permissions.",
"Putuskan Google Calendar? Izin dicabut di semua perangkat. Acara di Calendar tidak terhapus.":"Disconnect Google Calendar? Permission is revoked on all devices. Events in Calendar are not deleted.",
"Google Calendar belum disiapkan. Isi":"Google Calendar isn't set up yet. Fill in","di config.js (lihat README bagian \"Google Calendar\").":"in config.js (see the \"Google Calendar\" README section).",
// karakter & mode
"Pilih teman kamu":"Pick your buddy","Setiap karakter punya warna tema sendiri.":"Every character has its own theme colour.",
"celengan babi":"piggy bank","kucing oranye":"orange cat","katak hijau":"green frog","anak ayam":"little chick","sapi perah":"dairy cow","topi denim & cardigan":"denim cap & cardigan","kemeja garis-garis":"striped shirt","kaos oranye":"orange tee","kaos gelap":"dark tee","kemeja putih, anak KRL":"white shirt, commuter",
"Rajin nabung, gampang panik kalau saldo nggak cocok.":"A keen saver who panics when balances don't match.","Santai tapi teliti, hafal semua tanggal jatuh tempo.":"Relaxed but careful, knows every due date.",
"Lompat dari satu anggaran ke anggaran lain, selalu hemat.":"Hops from budget to budget, always thrifty.","Ceria, suka ngingetin jadwal kuliah pagi-pagi.":"Cheerful, loves reminding you about early classes.",
"Kalem, sabar, jago bikin laporan keuangan rapi.":"Calm, patient, great at tidy financial statements.","Siap jalan-jalan, tapi tetap ingat budget jajan.":"Ready to go out, but never forgets the snack budget.",
"Rapi, teliti, laporan keuangan tutup tepat waktu.":"Neat and precise, closes the books on time.","Semangat! Pengeluaran boros langsung ketahuan.":"Full of energy! Overspending gets caught right away.",
"Kalem di sofa, tapi saldo tetap dicek tiap minggu.":"Chilling on the sofa, but still checks balances weekly.","Hafal jadwal kereta & jadwal kuliah, nggak pernah telat.":"Knows the train and class timetables by heart, never late.",
"El Rusa":"El Deer Tee","El Valuasi":"El Valuation","El Renang":"El Swim","El Kaget":"El Shocked","kaos hitam sablon rusa":"black deer-print tee","kaos hijau tua & buku valuasi":"dark green tee & valuation book","habis berenang, handuk di bahu":"fresh from a swim, towel on shoulders","kaos putih, lihat tagihan":"white tee, just saw the bill","Jempol dulu, cek saldo kemudian. Calon juragan ternak.":"Thumbs up first, balance check later. Future livestock boss.","Nilai wajar dulu, baru belanja. DCF jalan terus.":"Fair value first, then shopping. DCF all the way.","Seger habis renang. Iuran kolam sudah masuk anggaran.":"Fresh after a swim. Pool fee is already in the budget.","Kaget lihat tagihan PayLater. Untung sudah ada pengingat.":"Shocked by the PayLater bill. Good thing reminders exist.","Vina Kasual":"Vina Casual","Vina Kantor":"Vina Office","Vina Oranye":"Vina Orange","Vina Santai":"Vina Chill","Vina Komuter":"Vina Commuter",
// tur
"Ringkasan keuangan":"Money overview","Total kas & bank, kekayaan bersih, pendapatan, beban, dan surplus bulan ini. Kotak jadi merah kalau ada yang bahaya.":"Total cash & bank, net worth, income, expenses and this month's surplus. Tiles turn red when something is wrong.",
"Langkah pertama: saldo awal":"First step: opening balances","Isi Saldo awal tiap rekening sesuai aplikasi bank hari ini. Lalu rutin isi Saldo real tiap minggu. Kalau beda, barisnya MERAH — tanda ada transaksi yang kelewat.":"Enter each account's opening balance from your bank app today. Then enter the real balance every week. If they differ the row turns RED — something was missed.",
"Catat pakai foto 📸":"Record with a photo 📸","Foto struk atau screenshot m-banking/OVO. Aku baca otomatis, kamu cek pratinjau jurnalnya, lalu Posting. Bisa juga isi manual.":"Snap a receipt or an m-banking/OVO screenshot. I read it, you check the journal preview, then Post. Manual entry works too.",
"Salah input? Tenang":"Made a mistake? Relax","Jurnal nggak dihapus — pakai Reverse (batalkan lalu input ulang) atau Reklas (pindah akun). Semua ada jejaknya, seperti di perusahaan.":"Entries aren't deleted — use Reverse (cancel then re-enter) or Reclass (move account). Everything leaves a trail, just like a company.",
"Anggaran bulanan":"Monthly budget","Tekan Ubah anggaran, isi gaji dan rencana tiap pos (kost, listrik, makan…). Aku kasih peringatan kuning/merah kalau mulai jebol.":"Tap Edit budget, enter your salary and a plan per item (rent, electricity, food…). I'll warn in yellow/red when it starts to overflow.",
"Laporan keuangan":"Financial statements","Laba Rugi, Neraca, dan Arus Kas otomatis dari jurnalmu. Bisa dicetak / disimpan PDF.":"Income statement, balance sheet and cash flow, generated from your journal. Print or save as PDF.",
"Jadwal + Google Calendar":"Schedule + Google Calendar","Hubungkan Google Calendar, lalu isi jadwal kuliah/shift sekali per semester lewat Jadwal mingguan.":"Connect Google Calendar, then add your classes/shifts once per semester with Weekly schedule.",
"Siap mulai! 🎉":"Ready to go! 🎉","Ikuti daftar langkah awal di kartu ini. Rutinitas emas: foto tiap transaksi, cek saldo real tiap minggu, tutup periode + backup tiap akhir bulan.":"Follow the first-steps list on this card. Golden routine: photo every transaction, check real balances weekly, close the period + back up at month end.",
"Aku teman penjaga keuangan & jadwalmu. Pilih dulu siapa yang mau menemanimu — bisa diganti kapan saja di Bantuan.":"I'm your money & schedule buddy. Pick who you'd like as company — you can change it anytime under Help.",
// panduan
"Mulai tur interaktif":"Start interactive tour","Baca sekali, praktikkan seminggu. Kalau bingung, ulangi tur interaktif.":"Read once, practise for a week. If you get confused, replay the interactive tour.",
"🐾 Pilih teman & tema":"🐾 Pick a buddy & theme","👀 Karakter ngintip":"👀 Peeking buddy","Coba sekarang 👋":"Try it now 👋","Mati":"Off","1 menit":"1 minute","3 menit":"3 minutes","5 menit":"5 minutes","10 menit":"10 minutes","30 menit":"30 minutes",
"Temanmu muncul dari pinggir layar membawa pengingat (saldo beda, anggaran hampir habis, tagihan H-3, belum catat hari ini). Ketuk untuk langsung ke menunya.":"Your buddy pops in from the screen edge with reminders (balance mismatch, budget nearly used, bill due in 3 days, nothing recorded today). Tap to jump to that menu.",
"🚀 Mulai cepat (sekali di awal)":"🚀 Quick start (once)","🔁 Rutinitas":"🔁 Routine","📖 Istilah singkat":"📖 Quick glossary","❓ Pertanyaan umum":"❓ FAQ","🎨 Tampilan":"🎨 Appearance","Mode sekarang:":"Current mode:","Ganti ke Profesional":"Switch to Professional","Ganti ke Lucu":"Switch to Fun",
"Profesional":"Professional",
"Debit / Kredit":"Debit / Credit","Akun GL / COA":"GL account / COA","Rekonsiliasi":"Reconciliation","Surplus":"Surplus",
"Setiap transaksi dicatat di dua sisi yang jumlahnya sama. Beli makan Rp20.000 pakai Jago: Debit 5201 Makan, Kredit 1113 Jago.":"Every transaction is recorded on two equal sides. Buying a Rp20,000 meal with Jago: Debit 5201 Meals, Credit 1113 Jago.",
"Daftar \"laci\" uang: 1xxx aset, 2xxx utang, 3xxx ekuitas, 4xxx pendapatan, 5xxx beban.":"Your money \"drawers\": 1xxx assets, 2xxx liabilities, 3xxx equity, 4xxx income, 5xxx expenses.",
"Membatalkan jurnal dengan jurnal kebalikannya. Dipakai kalau nominal/tanggal salah, lalu input ulang yang benar.":"Cancels an entry with an opposite entry. Use it when the amount/date is wrong, then re-enter correctly.",
"Memindahkan nominal ke akun yang benar tanpa membatalkan semuanya (mis. salah kategori, salah rekening).":"Moves an amount to the right account without cancelling everything (e.g. wrong category or account).",
"Mencocokkan saldo di buku dengan saldo asli di bank. Harus sama.":"Matching the book balance with the actual bank balance. They must be equal.",
"Mengunci bulan yang sudah beres supaya laporan bulan itu tidak berubah lagi.":"Locks a finished month so its reports can't change.","Pendapatan dikurangi beban. Ini uang yang benar-benar bisa ditabung.":"Income minus expenses. This is money you can actually save.",
"Kartu saldo merah?":"Red balance card?","Buku ≠ bank. Cek transaksi terakhir yang belum dicatat. Kalau sudah yakin tidak bisa dilacak, pakai":"Book ≠ bank. Check recent unrecorded transactions. If it really can't be traced, use","di halaman Rekonsiliasi.":"on the Reconciliation page.",
"Foto salah baca?":"Photo misread?","Selalu cek pratinjau sebelum Posting. Struk toko tidak menunjukkan kartu yang dipakai — pilih rekeningnya sendiri.":"Always check the preview before posting. Shop receipts don't show which card was used — pick the account yourself.",
"Top-up OVO":"OVO top-up","= Transfer (bank → OVO). Pengeluarannya baru tercatat saat bayar Grab pakai OVO.":"= Transfer (bank → OVO). The expense is recorded when you pay Grab with OVO.",
"Bayar kost 3 bulan sekaligus?":"Paying 3 months' rent at once?","Catat ke 1302 Sewa Dibayar di Muka, lalu tiap bulan jurnal manual Debit 5101 / Kredit 1302.":"Book it to 1302 Prepaid Rent, then each month a manual entry Debit 5101 / Credit 1302.",
"Rekonsiliasi Kas & Bank":"Cash & Bank Reconciliation","→ isi":"→ enter","semua rekening (lihat angka di aplikasi bank hari ini). Isi juga":"for all accounts (use today's figures from the bank app). Also enter","dengan angka yang sama.":"with the same figures.",
"Punya utang PayLater, piutang teman, atau deposit kost? Catat lewat":"Have PayLater debt, money owed by friends, or a rent deposit? Record it via","Jurnal Umum → Jurnal manual":"General Journal → Manual entry",
"Anggaran → Ubah anggaran":"Budget → Edit budget",": isi 4101 Gaji, lalu kost, listrik, internet, pulsa, makan, transport, dan target tabungan.":": enter 4101 Salary, then rent, electricity, internet, phone credit, food, transport, and a savings target.",
": coba foto satu struk → cek →":": try photographing one receipt → check →","(Opsional)":"(Optional)",": hubungkan Google Calendar →":": connect Google Calendar →","untuk kuliah/shift.":"for classes/shifts.",
"Setiap transaksi":"Every transaction",": foto struk/screenshot → posting. Transfer antar rekening sendiri pilih jenis":": photo the receipt/screenshot → post. For transfers between your own accounts choose type",", bukan pengeluaran.":", not spending.",
"Setiap minggu":"Every week",": isi Saldo real semua rekening. Merah = cari yang kelewat (biaya admin, bunga, cashback, transaksi lupa dicatat).":": enter real balances for all accounts. Red = find what was missed (admin fees, interest, cashback, forgotten transactions).",
": semua hijau →":": all green →","Periode Akuntansi → Tutup periode":"Accounting Periods → Close period",
// peek & mood
"Ketuk untuk buka →":"Tap to open →","Psst… saldonya beda!":"Psst… a balance is off!","Anggaran jebol 😱":"Budget blown 😱","Hati-hati ya":"Careful now","Pos ini sudah habis":"This item is used up","Belum ada anggaran":"No budget yet",
"Bikin anggaran bulan ini yuk, biar aku bisa jagain.":"Let's make this month's budget so I can keep watch.","Udah jajan hari ini?":"Bought anything today?","Jangan lupa foto struknya biar langsung tercatat 📸":"Don't forget to snap the receipt so it's recorded 📸",
"Kangen dicatat 🥺":"Missing your entries 🥺","Hari Minggu = cek saldo":"Sunday = balance check","Cocokkan saldo real semua rekening, 5 menit aja.":"Match real balances for all accounts, just 5 minutes.","Waktunya tutup buku 📒":"Time to close the books 📒",
"Cek laporan, tutup periode, lalu ekspor backup.":"Check the reports, close the period, then export a backup.","Semua aman ✨":"All good ✨","Saldo cocok, anggaran terkendali. Keren!":"Balances match, budgets under control. Nice!",
"Cuma mau nyapa. Semangat hari ini ya 💪":"Just saying hi. Have a great day 💪","Tips hemat":"Saving tip","Bawa botol minum sendiri, hemat jajan minuman tiap hari.":"Bring your own water bottle and save on drinks every day.",
"Minum air dulu":"Drink some water",
"💰 Keuangan":"💰 Finance","📅 Jadwal":"📅 Schedule","Hari Ini":"Today","Kalender":"Calendar","Buka kalender":"Open calendar","Agenda, tagihan, dan uangmu hari ini":"Your agenda, bills and money today",
"Pengeluaran hari ini":"Spent today","dari jurnal hari ini":"from today's entries","Sisa anggaran bulan ini":"Budget left this month","belum ada anggaran":"no budget yet","📅 Hari ini":"📅 Today","Sedang berlangsung":"Happening now",
"Tidak ada acara":"No events","Memuat…":"Loading…","💸 Tagihan 7 hari ke depan":"💸 Bills in the next 7 days","Atur":"Set up","Tidak ada tagihan 7 hari ke depan":"No bills in the next 7 days",
"Belum ada pengingat keuangan. Atur di Kalender → Pengingat keuangan otomatis.":"No money reminders yet. Set them up in Calendar → Automatic money reminders.","💰 Catat pengeluaran":"💰 Record spending","Buka Keuangan":"Open Finance","Jadwal mingguan":"Weekly schedule","Misi":"Quests","Misi & Achievement":"Quests & Achievements","Album Stiker":"Sticker Album","🎯 Misi":"🎯 Quests","Misi & stiker":"Quests & stickers","Siap diklaim":"Ready to claim","klaim untuk dapat stiker":"claim to get stickers","selesaikan misi di bawah":"complete quests below",
"Koleksi":"Collection","Duplikat":"Duplicates","5 duplikat = 1 tarikan":"5 duplicates = 1 pull","Tukar 5 → 1 tarikan":"Trade 5 → 1 pull","☀️ Misi harian":"☀️ Daily quests","reset setiap hari":"resets daily","📅 Misi mingguan":"📅 Weekly quests","reset setiap Senin":"resets every Monday",
"🏅 Achievement":"🏅 Achievements","🎲 Peluang stiker":"🎲 Sticker odds","Hadiah":"Reward","Misi harian":"Daily quest","Misi mingguan":"Weekly quest","Achievement":"Achievement","Achievement besar":"Big achievement","Tukar duplikat":"Duplicate trade",
"Biasa":"Common","Langka":"Rare","Legendaris":"Legendary","Hewan sahabat":"Animal pals","Hewan langka":"Rare animals","Terkumpul":"Collected","Riwayat terakhir":"Recent history","🎁 Klaim":"🎁 Claim","✓ Diklaim":"✓ Claimed","Kerjakan":"Do it",
"Catat 1 transaksi hari ini":"Record 1 transaction today","Tulis jurnal harian hari ini":"Write today's daily journal","Tulis atau ubah 1 catatan":"Write or edit 1 note","Selesaikan semua misi harian":"Finish all daily quests",
"Cek saldo real minimal 1 rekening minggu ini":"Check the real balance of at least 1 account this week","Tulis jurnal 5 hari minggu ini":"Journal on 5 days this week","Catat 10 transaksi minggu ini":"Record 10 transactions this week",
"Transaksi pertama":"First transaction","Catat transaksi pertamamu":"Record your first transaction","Semua rekening siap":"All accounts ready","Isi saldo awal 7 rekening":"Enter opening balances for 7 accounts","Perencana":"Planner","Buat anggaran pertama":"Create your first budget",
"Buku = Bank":"Books = Bank","Minimal 3 rekening dicek & semuanya cocok":"At least 3 accounts checked & all match","Pencatat rajin":"Diligent recorder","Catat 50 transaksi":"Record 50 transactions","Akuntan sejati":"True accountant","Catat 200 transaksi":"Record 200 transactions",
"Tutup buku":"Books closed","Tutup satu periode akuntansi":"Close one accounting period","Auditor kecil":"Little auditor","Pakai Reverse atau Reklas sekali":"Use Reverse or Reclass once","Jadwal semester":"Semester schedule","Buat jadwal mingguan (acara berulang)":"Create a weekly schedule (recurring event)",
"Seminggu penuh":"Full week","Jurnal harian 7 hari berturut-turut":"Daily journal 7 days in a row","Sebulan konsisten":"Consistent month","Jurnal harian 30 hari berturut-turut":"Daily journal 30 days in a row","Kolektor catatan":"Note collector","Punya 10 catatan":"Have 10 notes",
"Anti telat bayar":"Never late","Atur pengingat keuangan otomatis":"Set up automatic money reminders","Mulai mengoleksi":"Collector begins","Kumpulkan 10 stiker berbeda":"Collect 10 different stickers","Sahabat hewan":"Animal friend","Lengkapi semua stiker Biasa":"Complete all Common stickers",
"Pemburu langka":"Rare hunter","Lengkapi semua stiker Langka":"Complete all Rare stickers","Ketemu Vina!":"Found Vina!","Dapatkan stiker Vina pertama":"Get your first Vina sticker","Ketemu El!":"Found El!","Dapatkan stiker El pertama":"Get your first El sticker","Geng El lengkap":"Full El squad","Lengkapi semua 12 stiker El":"Complete all 12 El stickers","Vina & El":"Vina & El","Mitos":"Mythic","Alat":"Tools","Keamanan":"Security","⭐ Sering dipakai":"⭐ Most used","Berdua":"Together","Mood Harian":"Daily Mood","Kapsul Waktu":"Time Capsule","Bucket List":"Bucket List","Kartu Obrolan":"Talk Cards","Kurs Mata Uang":"Currency Rates","Belajar Bahasa":"Learn Languages","Kata-kata Harian":"Daily Words","Fokus":"Focus","Patungan":"Split Bill","Semua Alat":"All tools","Momen Kita":"Our Moments","Celengan Impian":"Dream Savings","Kebiasaan":"Habits","Roda Pilihan":"Decision Wheel","Kalkulator":"Calculator","Main 1 game hari ini":"Play 1 game today","Kolektor koin":"Coin collector","Skor Rp50.000 di Tangkap Koin":"Score Rp50,000 in Coin Catch","Akuntan cilik":"Junior accountant","Nilai sempurna 10/10 di Kuis Debit-Kredit":"Perfect 10/10 in the Debit-Credit Quiz","Ingatan gajah":"Elephant memory","Selesaikan Memori Stiker maksimal 12 langkah":"Finish Sticker Memory in 12 moves or fewer","Gamer rajin":"Dedicated gamer","Main game 30 kali":"Play games 30 times","tema couple":"couple theme","Berdua jagain keuangan bareng. Satu jajan, satu ngingetin anggaran.":"Guarding the money together. One snacks, one reminds about the budget.","Couple Vina & El":"Vina & El couple","Momen langka":"Rare moment","Dapatkan stiker couple (Mitos) pertama":"Get your first couple (Mythic) sticker","Couple sejati":"True couple","Lengkapi semua 5 stiker couple":"Complete all 5 couple stickers","Mitos: 5 couple Vina & El":"Mythic: 5 Vina & El couples","Kencan Hemat":"Budget Date","Selfie Kaget":"Surprised Selfie","Tutup Buku Bareng":"Closing the Books Together","Pulang Bareng KRL":"Train Ride Home Together","Saldo Cocok!":"Balances Match!","Album sempurna":"Perfect album","Lengkapi semua 15 stiker Vina":"Complete all 15 Vina stickers",
"Ketuk kartu untuk membuka":"Tap a card to open it","Simpan ke album":"Save to album","✨ Baru!":"✨ New!","Misi selesai! 🎉":"Quest complete! 🎉","Ada hadiah stiker yang bisa diklaim. Ketuk untuk buka.":"There's a sticker reward to claim. Tap to open.",
"Butuh 5 stiker duplikat untuk ditukar.":"You need 5 duplicate stickers to trade.","Tukar 5 duplikat":"Trade 5 duplicates","🎯 Misi & koleksi stiker":"🎯 Quests & sticker collection",
"Selesaikan misi harian, mingguan, dan achievement untuk dapat stiker karakter. Legendaris: stiker Vina & El. Paling langka: 5 stiker couple (Mitos)! Tombol 🎯 di atas menandai hadiah yang siap diklaim.":"Finish daily, weekly and achievement quests to earn character stickers. Legendary: Vina & El stickers. Rarest: 5 couple stickers (Mythic)! The 🎯 button at the top shows rewards ready to claim.",
"Tidak bisa tersambung ke database.":"Can't connect to the database.","Muat ulang":"Reload","Senang":"Happy","Hore":"Yay","Bobo":"Sleepy","Catatan":"Notes","+ Catatan":"+ Note","+ Checklist":"+ Checklist","+ Kata-kata":"+ Quote","Cari":"Search","Cari judul, isi, tag…":"Search title, text, tags…","Semua":"All",
"Tidak ada catatan yang cocok.":"No matching notes.","Belum ada catatan. Tulis ide, daftar belanja, rencana, atau kata-kata favoritmu di sini.":"No notes yet. Write ideas, shopping lists, plans or favourite quotes here.",
"Catatan baru":"New note","Edit catatan":"Edit note","Judul":"Title","Sumber / judul (opsional)":"Source / title (optional)","Tulis catatanmu…":"Write your note…","Tulis kata-kata yang ingin kamu ingat…":"Write words you want to remember…",
"+ Item checklist":"+ Checklist item","Item…":"Item…","Warna":"Colour","Tag (pisahkan dengan koma)":"Tags (comma-separated)","mis. ide, belanja, kuliah":"e.g. ideas, shopping, class","📌 Sematkan di atas":"📌 Pin to top",
"💬 Masukkan ke rotasi \"Kata-kata hari ini\"":"💬 Include in \"Quote of the day\" rotation","Hapus catatan":"Delete note","Catatan masih kosong.":"The note is empty.","Hapus catatan ini?":"Delete this note?",
"📝 Simpan ke catatan":"📝 Save to notes","✍️ Tulis kata-kataku":"✍️ Write my own","Disimpan ke Catatan.":"Saved to Notes.","📝 Catatan disematkan":"📝 Pinned notes","Semua catatan":"All notes",
"Sematkan catatan penting (📌) supaya muncul di sini.":"Pin important notes (📌) to show them here.","💬 Kata-kata hari ini":"💬 Words of the day","Kalimat yang ingin kamu ingat dari hari ini (opsional)":"A line you want to remember from today (optional)",
"Kata-katamu ikut muncul di \"Kata-kata hari ini\" pada hari-hari berikutnya.":"Your words will appear in \"Words of the day\" on later days.","Kata-katamu hari ini":"Your words today","Koleksi kata-kata":"Quote collection",
"Catatan keuangan":"Money note","Semangat harian":"Daily motivation","Jurnal harian":"Daily journal","Peribahasa":"Indonesian proverb",
"Uang kecil yang dicatat lebih berharga daripada uang besar yang dilupakan.":"Small money recorded is worth more than big money forgotten.",
"Pelan-pelan asal konsisten. Sehari satu langkah, sebulan sudah jauh.":"Slow but steady. One step a day, and in a month you've come far.",
"Bukan soal berapa yang kamu dapat, tapi berapa yang kamu simpan.":"It's not about how much you earn, but how much you keep.",
"Istirahat itu bagian dari rencana, bukan tanda menyerah.":"Rest is part of the plan, not a sign of giving up.","Hari yang biasa-biasa saja tetap layak disyukuri.":"An ordinary day is still worth being grateful for.",
"Tulis tujuanmu, lalu cicil sedikit demi sedikit — seperti menabung.":"Write your goal down, then chip away at it — like saving.","Hemat bukan pelit; hemat itu memilih yang paling penting.":"Frugal isn't stingy; frugal is choosing what matters most.",
"Kalau hari ini berat, cukup selesaikan satu hal kecil.":"If today is heavy, just finish one small thing.","Anggaran itu bukan penjara, tapi peta.":"A budget isn't a prison, it's a map.",
"Jangan bandingkan bab satu hidupmu dengan bab sepuluh hidup orang lain.":"Don't compare your chapter one with someone else's chapter ten.","Sedikit demi sedikit, lama-lama menjadi bukit.":"Little by little, it becomes a hill.",
"Hemat pangkal kaya, rajin pangkal pandai.":"Thrift is the root of wealth, diligence the root of wisdom.","Berakit-rakit ke hulu, berenang-renang ke tepian; bersakit-sakit dahulu, bersenang-senang kemudian.":"Pain first, pleasure later — hard work now, rewards to come.",
"Di mana ada kemauan, di situ ada jalan.":"Where there's a will, there's a way.","Saldo yang cocok bikin tidur nyenyak.":"Balances that match make for sound sleep.","Satu hal baik hari ini tetap satu hal baik.":"One good thing today is still one good thing.",
"Gaji datang, tabungan dulu — baru jajan.":"Payday: savings first, treats later.","Progres kecil tetap progres.":"Small progress is still progress.","Kamu tidak harus produktif setiap jam untuk jadi berharga.":"You don't have to be productive every hour to be worth something.",
"Ingat kenapa kamu mulai.":"Remember why you started.","Pengeluaran kecil yang rutin bisa jadi lubang besar. Cek, catat, rem.":"Small routine spending can become a big hole. Check, record, brake.",
"Hari ini adalah halaman baru. Isi dengan yang kamu mau.":"Today is a new page. Fill it with what you want.","Air beriak tanda tak dalam.":"Rippling water isn't deep — the loudest know the least.",
"Rencana tanpa catatan cuma angan-angan.":"A plan without notes is just a daydream.","Tidak apa-apa pelan, asal tidak berhenti.":"It's fine to go slow, as long as you don't stop.",
"Terima kasih, diriku, sudah bertahan sampai hari ini.":"Thank you, me, for making it to today.","Jangan menunggu kaya untuk menabung; menabunglah supaya cukup.":"Don't wait to be rich to save; save so you'll have enough.",
"Belajar sedikit tiap hari lebih kuat daripada banyak sekali-sekali.":"A little learning every day beats a lot once in a while.","Malu bertanya sesat di jalan.":"Too shy to ask, and you'll lose your way.","Pilih bahagia yang sederhana hari ini.":"Choose a simple happiness today.","💰 Jurnal Keuangan":"💰 Money Journal","📔 Jurnal Harian":"📔 Daily Journal","Harian":"Daily","Jurnal Harian":"Daily Journal","📔 Jurnal harian":"📔 Daily journal","📔 Tulis jurnal":"📔 Write journal","Tulis sekarang":"Write now",
"Agenda, tagihan, jurnal, dan uangmu hari ini":"Your agenda, bills, journal and money today","dari jurnal keuangan":"from money entries","otomatis":"auto","Saat acara mulai":"When it starts","Simpan jadwal":"Save schedule",
"Belum menulis jurnal hari ini. Cukup 2 menit: mood, kegiatan, dan satu hal baik hari ini.":"No journal yet today. Just 2 minutes: mood, activities, and one good thing.",
"Belum ada pengingat keuangan. Klik Atur.":"No money reminders yet. Click Set up.","Ubah":"Edit","Muncul otomatis di kalender setiap bulan, dengan pengingat H-1.":"Appears in the calendar every month, with a reminder 1 day before.",
"Tagihan rutin, tanggal gajian, cek saldo mingguan, dan tutup buku akhir bulan langsung muncul di kalender dengan pengingat. Diambil dari anggaranmu.":"Recurring bills, payday, weekly balance checks and month-end close appear right in the calendar with reminders. Taken from your budget.",
"Isi sekali per semester. Setiap baris jadi acara berulang mingguan sampai tanggal selesai.":"Fill in once per semester. Each row becomes a weekly recurring event until the end date.","mis. Ekonometrika / Shift kerja":"e.g. Econometrics / Work shift",
"Perubahan hanya berlaku untuk tanggal ini.":"Changes apply to this date only.","Edit acara berulang":"Edit recurring event","Simpan jurnal":"Save journal","Tersimpan ✓":"Saved ✓",
"Bagaimana perasaanmu?":"How do you feel?","Senang":"Happy","Baik":"Good","Biasa":"Okay","Sedih":"Sad","Capek":"Tired","Apa saja yang kamu lakukan hari ini?":"What did you do today?",
"Pagi kuliah, siang kerja kelompok di perpus, malam futsal…":"Class in the morning, group work at the library, futsal at night…","✨ Satu hal baik hari ini":"✨ One good thing today","mis. presentasi lancar, makan enak bareng teman":"e.g. presentation went well, nice dinner with friends",
"Tag kegiatan":"Activity tags","Belajar":"Study","Olahraga":"Sports","Keluarga":"Family","Teman":"Friends","Pacar":"Partner","Ibadah":"Worship","Hobi":"Hobby","Istirahat":"Rest","Jalan-jalan":"Outing","Sakit":"Sick",
"Otomatis dari hari ini":"Automatically from today","📅 Acara:":"📅 Events:","💰 Pengeluaran:":"💰 Spending:","tidak ada":"none","Tambahkan acara ke catatan":"Add events to notes","Mood 30 hari terakhir":"Mood, last 30 days","Catatan terakhir":"Recent entries","Belum ada catatan.":"No entries yet.",
"Hapus jurnal tanggal ini":"Delete this day's journal","Pilih mood atau tulis sesuatu dulu.":"Pick a mood or write something first.","Catatan belum disimpan. Pindah tanggal tanpa menyimpan?":"Your entry isn't saved. Switch date without saving?",
"Tulis jurnal harian pertama (opsional)":"Write your first daily journal (optional)","Udah nulis jurnal hari ini?":"Journaled today?","Ceritain harimu: mood, kegiatan, satu hal baik. 2 menit aja ✍️":"Tell me about your day: mood, activities, one good thing. Just 2 minutes ✍️",
"📔 Jurnal Harian & Kalender":"📔 Daily Journal & Calendar","Tombol 📔 Jurnal Harian di atas membuka sisi harian: agenda Hari Ini, Kalender (isi jadwal kuliah/shift sekali per semester), dan jurnal mood & kegiatanmu.":"The 📔 Daily Journal button at the top opens the daily side: Today's agenda, the Calendar (add classes/shifts once per semester), and your mood & activity journal.",
"🔔 Aktifkan notifikasi supaya pengingat acara muncul.":"🔔 Turn on notifications so event reminders appear.","Aktifkan":"Turn on","🔕 Notifikasi diblokir browser. Izinkan lewat ikon gembok di address bar → Notifikasi → Izinkan. Pengingat tetap muncul lewat karakter ngintip.":"🔕 Notifications are blocked. Allow them via the lock icon in the address bar → Notifications → Allow. Reminders still appear via the peeking buddy.",
"Acara":"Event","sekarang":"now","besok":"tomorrow","Ada pengingat":"Has a reminder","Setelah bayar, foto buktinya dan posting jurnal.":"After paying, photograph the receipt and post the entry.","Catat gaji (4101) dan sisihkan target tabungan.":"Record salary (4101) and set aside your savings target.",
"Cocokkan saldo, cek laporan, tutup periode, ekspor backup.":"Match balances, check reports, close the period, export a backup.","Isi saldo real semua rekening di Rekonsiliasi.":"Enter real balances for all accounts in Reconciliation.",
"beruang madu":"honey bear","panda":"panda","kelinci putih":"white bunny","penguin":"penguin","rubah oranye":"orange fox",
"Suka ngemil, tapi selalu ingat sisa anggaran makan.":"Loves snacks, but always minds the food budget.","Kalem kayak bambu, rajin cek saldo tiap Minggu.":"Calm as bamboo, checks balances every Sunday.",
"Lincah, hafal semua jadwal dan nggak pernah telat.":"Nimble, knows every schedule and is never late.","Tenang di cuaca apa pun, termasuk akhir bulan.":"Calm in any weather — even at month end.","Cerdik cari promo, tapi tetap sesuai anggaran.":"Clever at finding deals, but stays on budget.","⚙️ Google Client ID":"⚙️ Google Client ID","Google Client ID":"Google Client ID","Simpan Client ID":"Save Client ID","Ganti Google Client ID":"Change Google Client ID",
"Google Calendar belum disiapkan. Isi Google Client ID di bawah (sekali saja).":"Google Calendar isn't set up yet. Enter the Google Client ID below (once).",
"Google Calendar belum disiapkan. Buka":"Google Calendar isn't set up yet. Open","lalu isi Google Client ID (sekali saja).":"then enter the Google Client ID (once).",
"Client ID memang publik, aman disimpan. Tersimpan di akunmu & ikut ke semua perangkat.":"A Client ID is public and safe to store. It's saved to your account and syncs to all devices.",
"Client ID diambil dari config.js. Untuk menggantinya di sini, kosongkan GOOGLE_CLIENT_ID di config.js.":"The Client ID comes from config.js. To change it here, empty GOOGLE_CLIENT_ID in config.js.",
"Format Client ID tidak cocok. Harus berakhiran .apps.googleusercontent.com (bukan Client secret / API key).":"Client ID format doesn't match. It must end with .apps.googleusercontent.com (not a Client secret / API key).",
"Hapus Client ID?":"Delete Client ID?","Google Client ID belum diisi. Buka menu Jadwal → isi Client ID.":"Google Client ID is empty. Open Schedule → enter the Client ID.","Pengingat keuangan otomatis":"Automatic money reminders",
"Agenda hari ini diambil dari Google Calendar kamu.":"Today's agenda comes from your Google Calendar.","💰 Gajian":"💰 Payday","(tanpa judul)":"(untitled)","Kerja & kuliah butuh tenaga. Istirahat sebentar yuk.":"Work and classes need energy. Take a short break.","Jangan sampai telat ya.":"Don't be late."
};
// nama akun & kelompok COA
Object.assign(D,{"Kas Tunai":"Cash on Hand","Bank OCBC – Rek. Gaji (GPN)":"OCBC Bank – Salary Acct (GPN)","Bank OCBC – Debit Mastercard":"OCBC Bank – Mastercard Debit","Bank Jago":"Bank Jago","SeaBank":"SeaBank","Bank BCA":"Bank BCA","E-Wallet OVO":"OVO E-Wallet",
"Piutang Teman/Keluarga":"Receivable – Friends/Family","Piutang Reimburse Kantor":"Receivable – Office Reimbursement","Deposit Kost":"Rent Deposit","Sewa Kost Dibayar di Muka":"Prepaid Rent","Laptop & Elektronik":"Laptop & Electronics","Kendaraan":"Vehicle",
"Utang PayLater":"PayLater Payable","Utang Kartu Kredit":"Credit Card Payable","Utang ke Teman/Keluarga":"Payable to Friends/Family","Ekuitas Saldo Awal":"Opening Balance Equity",
"Gaji Pokok":"Base Salary","Lembur & Tunjangan":"Overtime & Allowances","Bonus / THR":"Bonus / Holiday Allowance","Bunga Bank":"Bank Interest","Cashback & Promo":"Cashback & Promos","Freelance / Usaha Sampingan":"Freelance / Side Business","Hadiah / Pemberian":"Gifts Received","Pendapatan Lain-lain":"Other Income",
"Sewa Kost / Tempat Tinggal":"Rent / Housing","Listrik (Token PLN)":"Electricity (PLN Token)","Air":"Water","Internet / WiFi":"Internet / WiFi","Laundry":"Laundry","Iuran Kebersihan & Keamanan":"Cleaning & Security Fees","Gas / Galon":"Gas / Water Gallons","Perlengkapan & Perbaikan Kamar":"Room Supplies & Repairs",
"Makan Harian":"Daily Meals","Belanja Bahan Makanan":"Groceries","Kopi & Jajan":"Coffee & Snacks","Makan di Luar / Nongkrong":"Eating Out / Hangouts","Ojek & Taksi Online (Grab/Gojek)":"Ride-hailing (Grab/Gojek)","Bensin":"Fuel","Parkir & Tol":"Parking & Tolls",
"Transportasi Umum (KRL/Bus)":"Public Transport (KRL/Bus)","Servis & Pajak Kendaraan":"Vehicle Service & Tax","Tiket Pulang Kampung / Perjalanan":"Home Trips / Travel","Pulsa & Paket Data":"Phone Credit & Data","Langganan Digital":"Digital Subscriptions",
"Biaya Kuliah":"Tuition","Buku & ATK":"Books & Stationery","Kursus & Sertifikasi":"Courses & Certifications","Obat & Dokter":"Medicine & Doctor","BPJS / Asuransi":"BPJS / Insurance","Pakaian & Sepatu":"Clothing & Shoes","Perawatan Diri & Potong Rambut":"Personal Care & Haircuts",
"Hiburan & Hobi":"Entertainment & Hobbies","Olahraga":"Sports","Elektronik & Gadget Kecil":"Small Electronics & Gadgets","Donasi & Zakat":"Donations & Zakat","Kondangan & Hadiah":"Weddings & Gifts","Kiriman untuk Keluarga":"Money Sent to Family","Traktir Teman":"Treating Friends",
"Biaya Admin Bank Bulanan":"Monthly Bank Admin Fees","Biaya Transfer & Top-up":"Transfer & Top-up Fees","Pajak Bunga":"Interest Tax","Bunga & Denda PayLater/Kartu Kredit":"PayLater/Credit Card Interest & Penalties","Beban Lain-lain":"Other Expenses",
"Kas & Setara Kas":"Cash & Cash Equivalents","Piutang":"Receivables","Uang Muka & Deposit":"Prepayments & Deposits","Aset Tetap Pribadi":"Personal Fixed Assets","Utang Jangka Pendek":"Short-term Liabilities","Pendapatan Kerja":"Employment Income","Pendapatan Lain":"Other Income",
"Beban Tempat Tinggal":"Housing Expenses","Beban Makan & Minum":"Food & Drink Expenses","Beban Transportasi":"Transport Expenses","Beban Komunikasi & Langganan":"Communication & Subscription Expenses","Beban Pendidikan":"Education Expenses","Beban Kesehatan":"Health Expenses",
"Beban Pribadi & Gaya Hidup":"Personal & Lifestyle Expenses","Beban Sosial & Keluarga":"Social & Family Expenses","Beban Keuangan & Lain-lain":"Financial & Other Expenses"});
const SHORT={"Sen":"Mon","Sel":"Tue","Rab":"Wed","Kam":"Thu","Jum":"Fri","Sab":"Sat","Min":"Sun"};
Object.assign(D,SHORT);

/* ---------- pola kalimat dinamis ---------- */
const t=s=>tr(s);
const P=[
[/^(\d{4}) – (.+)$/,(m,c,n)=>c+" – "+t(n)],
[/^(\d{4}) (.+) – ([DK]) ([\d.]+)$/,(m,c,n,s,v)=>c+" "+t(n)+" – "+(s==="D"?"Dr":"Cr")+" "+v],
[/^(\d\dxx) (.+)$/,(m,c,n)=>c+" "+t(n)],
[/^Subtotal (.+)$/,(m,n)=>"Subtotal "+t(n)],[/^Jumlah (.+)$/,(m,n)=>"Total "+t(n)],
[/^Saldo awal – (.+)$/,(m,n)=>"Opening balance – "+t(n)],[/^Saldo real – (.+)$/,(m,n)=>"Real balance – "+t(n)],
[/^Saldo awal (.+)$/,(m,n)=>"Opening balance "+M(n)],[/^Saldo akhir (.+)$/,(m,n)=>"Closing balance "+n],
[/^Saldo normal: (Debit|Kredit)$/,(m,n)=>"Normal balance: "+(n==="Debit"?"Debit":"Credit")],
[/^Anggaran vs Aktual – (.+)$/,(m,n)=>"Budget vs Actual – "+M(n)],[/^Jurnal ((?:\w+) \d{4})$/,(m,n)=>"Entries – "+M(n)],
[/^Surplus akumulasi s\.d\. (.+)$/,(m,n)=>"Accumulated surplus to "+n],[/^Surplus (\w+ \d{4})$/,(m,n)=>"Surplus – "+M(n)],
[/^Per (\d{4}-\d\d-\d\d)$/,(m,n)=>"As of "+n],[/^Untuk periode (.+) s\.d\. (.+)$/,(m,a,b)=>"For the period "+a+" to "+b],[/^Untuk periode yang berakhir (.+)$/,(m,n)=>"For the period ended "+n],
[new RegExp("^(Pendapatan|Beban) ("+MRE+")$"),(m,k,mo)=>MON[mo]+(k==="Pendapatan"?" income":" expenses")],
[new RegExp("^Salin dari ("+MRE+")$"),(m,mo)=>"Copy from "+MON[mo]],
[/^(\d+) jurnal$/,(m,n)=>n+" entries"],[/^(\d+) akun$/,(m,n)=>n+" accounts"],[/^\+(\d+) lagi$/,(m,n)=>"+"+n+" more"],
[/^aktual (\S+) · (\d+)% bulan berjalan$/,(m,a,p)=>"actual "+a+" · "+p+"% of month elapsed"],[/^aktual (\S+)$/,(m,a)=>"actual "+a],[/^anggaran (\S+)$/,(m,a)=>"budget "+a],
[/^target tabung (\S+)$/,(m,a)=>"savings target "+a],[/^aset (\S+) − utang (\S+)$/,(m,a,b)=>"assets "+a+" − liabilities "+b],
[/^Terakhir disinkronkan: (.+)$/,(m,n)=>"Last synced: "+(n==="belum"?"never":n)],
[/^(.+) – (Rp[\d.]+) · tiap tgl (\d+)$/,(m,n,a,d)=>t(n)+" – "+a+" · day "+d],[/^(.+) · tiap tgl akhir bulan$/,(m,n)=>t(n)+" · end of month"],[/^(.+) · tiap tgl (\d+)$/,(m,n,d)=>(n==="Gajian"?"Payday":t(n))+" · day "+d],
[/^Gajian · tiap tgl (\d+)$/,(m,d)=>"Payday · day "+d],[/^Cek saldo real · tiap (\w+)$/,(m,d)=>"Check real balances · every "+(DAY[d]||d)],
[/^Tidak seimbang (.+)$/,(m,n)=>"Unbalanced "+n],[/^Reklasifikasi (JE-.+)$/,(m,n)=>"Reclassify "+n],[/^Dibalik (JE-.+)$/,(m,n)=>"Reversed by "+n],[/^Pembalik (JE-.*)$/,(m,n)=>"Reversal of "+n],[/^Reklas (JE-[\d-]+)$/,(m,n)=>"Reclass of "+n],
[/^Membuat jurnal pembalik \(debit ↔ kredit\) sehingga efek (\S+) menjadi nol\. Jurnal asli tetap ada sebagai jejak audit\. Setelah itu posting ulang jurnal yang benar\.$/,(m,n)=>"Creates a reversing entry (debit ↔ credit) so the effect of "+n+" becomes zero. The original stays as an audit trail. Then post the correct entry."],
[/^Halo, aku (.+)! (.+)$/,(m,n,e)=>"Hi, I'm "+t(n)+"! "+e],[/^Panduan dari (.+) (\S+)$/,(m,n,e)=>"Guide from "+t(n)+" "+e],
[/^Selamat (pagi|siang|sore|malam)! Aku (.+) (\S+)$/,(m,g,n,e)=>({pagi:"Good morning",siang:"Good afternoon",sore:"Good afternoon",malam:"Good evening"})[g]+"! I'm "+t(n)+" "+e],
[/^Hai, aku (.+)!$/,(m,n)=>"Hi, I'm "+t(n)+"!"],[/^((?:Vina|El) \w+) (\S+)$/,(m,n,e)=>t(n)+" "+e],[/^(\S+) ((?:Vina|El) \w+)$/,(m,e,n)=>e+" "+t(n)],
[/^Saldo tidak cocok dengan saldo real: (.+)\. ?$/,(m,n)=>"Balances don't match real balances: "+n.replace(/ selisih /g," difference ").replace(/(.+?)(?= difference)/g,x=>t(x.replace(/^ · /,"")).replace(/^/,x.startsWith(" · ")?" · ":""))+". "],
[/^(.+) beda dengan saldo real\. Yuk cek transaksi yang kelewat atau biaya admin\.$/,(m,n)=>n.split(", ").map(t).join(", ")+" differs from the real balance. Check for missed transactions or admin fees."],
[/^Lewat anggaran: (.+)\. Rem dikit ya!$/,(m,n)=>"Over budget: "+n.replace(/…$/,"").split(", ").map(t).join(", ")+(n.endsWith("…")?"…":"")+". Ease off a little!"],
[/^Lewat anggaran: (.+?)\. (?:Beban tanpa anggaran: (.+)\.)?$/,(m,a,b)=>"Over budget: "+a+"."+(b?" Unbudgeted expenses: "+b+".":"")],
[/^Beban tanpa anggaran: (.+)\.$/,(m,b)=>"Unbudgeted expenses: "+b+"."],
[/^Belum ada anggaran untuk (.+)\. $/,(m,n)=>"No budget yet for "+M(n)+". "],
[/^(.+) nggak cocok sama saldo real\. Yuk cek\.$/,(m,n)=>t(n)+" doesn't match the real balance. Let's check."],
[/^(.+) sudah (\d+)% dari anggaran \(lewat (\S+)\)\.$/,(m,n,p,a)=>t(n)+" is at "+p+"% of budget (over by "+a+")."],
[/^Anggaran (.+) terpakai penuh\. Tahan dulu ya sampai bulan depan\.$/,(m,n)=>"The "+t(n)+" budget is fully used. Hold off until next month."],
[/^(.+) tinggal (\S+) lagi bulan ini\.$/,(m,n,a)=>"Only "+a+" left for "+t(n)+" this month."],
[/^Transaksi terakhir tanggal (\S+)\. Ada yang kelewat\?$/,(m,d)=>"Last transaction was on "+d+". Missed anything?"],
[/^H-(\d+) bayar (.+)$/,(m,d,n)=>n+" due in "+d+" day"+(d==="1"?"":"s")],[/^Hari ini bayar (.+)!$/,(m,n)=>n+" is due today!"],[/^Siapkan (\S+) ya\.$/,(m,a)=>"Have "+a+" ready."],
[/^Anggaran tidak seimbang: beban (\S+) \+ target tabungan (\S+) = (\S+) > pendapatan (\S+) \(kurang (\S+)\)\.(.*)$/,(m,a,b,c,d,e,rest)=>"Budget doesn't balance: expenses "+a+" + savings target "+b+" = "+c+" > income "+d+" (short by "+e+")."+(rest?tr(rest.trim()).replace(/^/," "):"")],
[/^Target tabungan (\S+) tidak tercapai; surplus aktual (\S+)\.$/,(m,a,b)=>"Savings target "+a+" not reached; actual surplus "+b+"."],
[/^Neraca saldo tidak seimbang \((.+)\)\. Periksa jurnal manual\.$/,(m,n)=>"Trial balance is out of balance ("+n+"). Check manual entries."],
[/^Neraca tidak seimbang sebesar (.+)\.$/,(m,n)=>"Balance sheet is out of balance by "+n+"."],[/^Selisih rekonsiliasi kas (.+)\.$/,(m,n)=>"Cash reconciliation difference "+n+"."],
[/^Surplus akumulasi s\.d\. (.+)$/,(m,n)=>"Accumulated surplus to "+n],
[/^Periode (.+) sudah ditutup\. Buka dulu di menu Periode Akuntansi, atau pakai tanggal di periode yang masih terbuka\.$/,(m,n)=>"Period "+M(n)+" is closed. Reopen it in Accounting Periods, or use a date in an open period."],
[/^Masih ada akun yang tidak cocok dengan saldo real \((.+)\)\. Tetap tutup (.+)\?$/,(m,a,b)=>"Some accounts still don't match real balances ("+a.split(", ").map(t).join(", ")+"). Close "+M(b)+" anyway?"],
[/^Buka kembali (.+)\? Laporan bulan itu bisa berubah\.$/,(m,n)=>"Reopen "+M(n)+"? That month's reports may change."],[/^Timpa anggaran (.+)\?$/,(m,n)=>"Overwrite the "+M(n)+" budget?"],
[/^Bukukan selisih (\S+) pada (.+) sebagai (beban|pendapatan) lain-lain\?$/,(m,a,n,k)=>"Book the "+a+" difference on "+t(n)+" as other "+(k==="beban"?"expense":"income")+"?"],
[/^Hapus "(.*)" dari Google Calendar\?$/,(m,n)=>"Delete \""+n+"\" from Google Calendar?"],[/^"(.*)" adalah acara berulang\.$/,(m,n)=>"\""+n+"\" is a recurring event."],
[/^(\d+) jadwal dibuat\. Gagal:([\s\S]*)$/,(m,n,r)=>n+" schedules created. Failed:"+r],[/^Membuat pengingat (\d+)\/(\d+)…$/,(m,a,b)=>"Creating reminder "+a+"/"+b+"…"],[/^Membuat (\d+)\/(\d+)…$/,(m,a,b)=>"Creating "+a+"/"+b+"…"],
[/^Keyakinan (\w+), cek angka & akun GL\.(.*)$/,(m,c,r)=>"Confidence "+({low:"low",medium:"medium",high:"high"}[c]||c)+", check the amount & GL account."+r],
[/^Gagal (masuk|posting|hapus|simpan|simpan rencana|menyimpan izin|menghapus|sinkron|ekspor|memuat data|menyimpan ke Google Calendar): ?(.*)$/,(m,k,r)=>({masuk:"Sign-in failed",posting:"Posting failed",hapus:"Delete failed",simpan:"Save failed","simpan rencana":"Saving budget failed","menyimpan izin":"Saving permission failed",menghapus:"Delete failed",sinkron:"Sync failed",ekspor:"Export failed","memuat data":"Failed to load data","menyimpan ke Google Calendar":"Failed to save to Google Calendar"})[k]+": "+r],
[/^Gagal membaca gambar \((.*)\)\. Isi manual\.$/,(m,r)=>"Couldn't read the image ("+r+"). Enter manually."],
[/^Izin Google sudah tidak berlaku \((.*)\)\. Hubungkan lagi\.$/,(m,r)=>"Google permission is no longer valid ("+r+"). Connect again."],[/^Izin Google ditolak\/gagal: (.*)$/,(m,r)=>"Google permission denied/failed: "+r],
[/^💸 Bayar (.+?)( – Rp[\d.]+)?$/,(m,n,a)=>"💸 Pay "+t(n)+(a||"")],[/^💰 Gajian$/,()=>"💰 Payday"],[/^📒 Tutup buku bulanan$/,()=>"📒 Monthly close"],[/^🔎 Cek saldo real$/,()=>"🔎 Check real balances"],
[/^Pengingat dari RaVi\. Setelah bayar, foto buktinya dan posting jurnal\.$/,()=>"Reminder from RaVi. After paying, photograph the receipt and post the entry."],
[/^Cek gaji masuk ke rekening gaji, lalu catat jurnal 4101 Gaji Pokok\. Sisihkan target tabungan dulu\.$/,()=>"Check your salary arrived, then record entry 4101 Base Salary. Set aside your savings target first."],
[/^1\) Cocokkan saldo real semua rekening  2\) Cek Laporan Keuangan  3\) Tutup periode  4\) Ekspor backup JSON\.$/,()=>"1) Match real balances for all accounts  2) Check the financial statements  3) Close the period  4) Export a JSON backup."],
[/^Buka Rekonsiliasi Kas & Bank, isi saldo real tiap rekening\. Merah = ada transaksi yang kelewat\.$/,()=>"Open Cash & Bank Reconciliation and enter each account's real balance. Red = a transaction was missed."],
[/^(\d+) \/ (\d+)$/,(m,a,b)=>a+" / "+b],
[/^(\d+) menit lagi$/,(m,n)=>"in "+n+" minutes"],[/^(\d+) jam lagi$/,(m,n)=>"in "+n+" hours"],[/^Hapus "(.*)"\?$/,(m,n)=>"Delete \""+n+"\"?"],[/^Hapus jurnal (.+)\?$/,(m,n)=>"Delete the journal for "+M(n)+"?"],
[/^Kata-katamu · (.+)$/,(m,n)=>"Your words · "+M(n)],[/^(\d+)\/(\d+) selesai$/,(m,a,b)=>a+"/"+b+" done"],[/^· (\d+)\/(\d+) selesai$/,(m,a,b)=>"· "+a+"/"+b+" done"],
[/^📒 Album stiker \((\d+)\/(\d+)\)$/,(m,a,b)=>"📒 Sticker album ("+a+"/"+b+")"],[/^(\d+)\/(\d+) Legendaris \(Vina & El\)$/,(m,a,b)=>a+"/"+b+" Legendary (Vina & El)"],
[/^(\d+)\/(\d+) · hadiah: (.+)$/,(m,a,b,r)=>a+"/"+b+" · reward: "+({"1 stiker":"1 sticker","1 stiker (peluang Langka ↑)":"1 sticker (Rare odds ↑)","2 stiker":"2 stickers","3 stiker (peluang Legendaris tinggi)":"3 stickers (high Legendary odds)"}[r]||r)],
[/^Biasa: Pipi.*$/,()=>"Common: Pipi, Moci, Kodi, Cimi, Mumu · Rare: Bubu, Pandi, Kiki, Popo, Rubi · "],[/^Legendaris: 5 Vina \+ 4 El$/,()=>"Legendary: 5 Vinas + 4 Els"],[/^\. Tiap karakter punya 3 pose\.$/,()=>". Each character has 3 poses."],
[/^(.+) (Senang|Hore|Bobo)$/,(m,n,p)=>tr(n)+" "+({Senang:"Happy",Hore:"Yay",Bobo:"Sleepy"})[p]],
[/^≈ (\S+) per hari$/,(m,a)=>"≈ "+a+" per day"],[/^Besok · (.+)$/,(m,n)=>"Tomorrow · "+M(n)]
];

function tr(s){
  if(LANG!=="en"||!s)return s;
  const lead=s.match(/^\s*/)[0],trail=s.match(/\s*$/)[0],k=s.trim();
  if(!k)return s;
  if(Object.prototype.hasOwnProperty.call(D,k))return lead+D[k]+trail;
  for(const [re,fn] of P){if(re.test(k))return lead+k.replace(re,fn)+trail}
  const m=M(k);return lead+m+trail}
window.i18nT=tr;

/* ---------- penerapan ke DOM ---------- */
const SKIP=new Set(["SCRIPT","STYLE","TEXTAREA","CODE"]);
const ATTRS=["placeholder","title","aria-label","label"];
function doText(n){if(n.__busy)return;const p=n.parentElement;if(!p||SKIP.has(p.tagName)||p.closest("[data-noi18n]"))return;
  const cur=n.nodeValue;if(n.__tr!==undefined&&cur===n.__tr)return;
  const orig=cur,out=tr(orig);
  if(out!==orig){n.__orig=orig;n.__tr=out;n.__busy=1;n.nodeValue=out;n.__busy=0}}
function doAttrs(el){for(const a of ATTRS){const v=el.getAttribute&&el.getAttribute(a);if(!v)continue;el.__oa=el.__oa||{};
  if(el.__ta&&el.__ta[a]===v)continue;const o=tr(v);if(o!==v){el.__oa[a]=v;el.__ta=el.__ta||{};el.__ta[a]=o;el.setAttribute(a,o)}}}
function walk(root){if(LANG!=="en")return;if(root.nodeType===3){doText(root);return}if(root.nodeType!==1)return;
  doAttrs(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
  while(n=w.nextNode()){if(n.nodeType===3)doText(n);else doAttrs(n)}}
function restore(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
  while(n=w.nextNode()){if(n.nodeType===3&&n.__orig!==undefined&&n.nodeValue===n.__tr){n.nodeValue=n.__orig;delete n.__tr;delete n.__orig}
    else if(n.nodeType===1&&n.__oa){for(const [a,v] of Object.entries(n.__oa))n.setAttribute(a,v);n.__oa=null;n.__ta=null}}}
const mo=new MutationObserver(list=>{if(LANG!=="en")return;for(const m of list){
  if(m.type==="childList")m.addedNodes.forEach(walk);else if(m.type==="characterData")doText(m.target);else if(m.type==="attributes")doAttrs(m.target)}});
mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});

/* dialog bawaan browser */
const _a=window.alert.bind(window),_c=window.confirm.bind(window);
window.alert=m=>_a(tr(String(m)));window.confirm=m=>_c(tr(String(m)));

/* tombol bahasa di header */
const css=document.createElement("style");css.textContent=`
#langBtn{background:none;color:var(--hdrInk);border-color:rgba(255,255,255,.35);font-weight:700;letter-spacing:.02em}
header .acts-r{margin-left:auto;display:flex;gap:6px;align-items:center;flex:none}
@media (max-width:600px){header .acts-r{gap:4px}}`;document.head.appendChild(css);
function ensureBtn(){const hdr=document.querySelector("header");if(!hdr)return;
  let box=hdr.querySelector(".acts-r");
  if(!box){box=document.createElement("div");box.className="acts-r";hdr.appendChild(box)}
  let b=document.getElementById("langBtn");
  if(!b){b=document.createElement("button");b.id="langBtn";b.className="sm";b.onclick=()=>setLang(LANG==="en"?"id":"en")}
  b.textContent=LANG==="en"?"ID":"EN";b.title=LANG==="en"?"Ganti ke Bahasa Indonesia":"Switch to English";
  // urutan di kanan: [EN] [Pro] [Keluar]
  const theme=document.getElementById("themeBtn"),out=document.getElementById("logout");
  [b,theme,out].forEach(x=>{if(x&&x.parentElement!==box)box.appendChild(x)});
  if(theme&&b.nextSibling!==theme)box.insertBefore(b,theme)}
function setLang(l){LANG=l;try{localStorage.setItem("bbp_lang",l)}catch(e){}
  document.documentElement.lang=l==="en"?"en":"id";
  if(l==="id")restore();
  try{render()}catch(e){}
  ensureBtn();if(l==="en")walk(document.body)}
window.setLang=setLang;
if(typeof render==="function"){const _r=render;render=function(){_r();ensureBtn()}}
/* AI pembaca struk: catatan dalam bahasa yang dipilih */
try{if(typeof receiptReader!=="undefined"){const _j=receiptReader.json;receiptReader.json=(p,o)=>_j(LANG==="en"?p.replace("bahasa Indonesia","English"):p,o)}}catch(e){}
document.documentElement.lang=LANG==="en"?"en":"id";
addEventListener("load",()=>{ensureBtn();if(LANG==="en")walk(document.body)});
ensureBtn();if(LANG==="en")walk(document.body);
})();
