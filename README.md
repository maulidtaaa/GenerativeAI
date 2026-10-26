# Generative AI | Galaxy Learning

Website modul pembelajaran interaktif berbahasa Indonesia dengan tema Galaxy Bima Sakti dan delapan planet Tata Surya. Dibuat menggunakan HTML5, CSS3, dan JavaScript vanilla sesuai PRD.


## Fitur
- Beranda bertema galaksi dan peta visual delapan planet.
- Enam modul pembelajaran dengan tujuan, materi, contoh prompt, aktivitas, rangkuman, dan kuis tiga soal per modul.
- Umpan balik jawaban, skor, dan pengulangan kuis.
- Pencarian modul dan filter status belajar.
- Progres modul, skor kuis, tema, dan checklist project akhir disimpan pada localStorage browser.
- Tema gelap dan terang.
- Panduan project akhir dengan delapan komponen wajib dan rubrik 100%.
- Responsif, navigasi keyboard dasar, fokus terlihat, dan dukungan `prefers-reduced-motion`.

## Struktur
- `index.html` : struktur halaman
- `css/styles.css` : gaya visual, tema, dan responsivitas
- `js/modules.js` : data enam modul dan kuis
- `js/app.js` : navigasi, pencarian, kuis, tema, serta progres lokal
- `assets/images/` : direktori aset lokal (ilustrasi Tata Surya dibuat dengan CSS)

## Batasan
- Tidak ada login, backend, sinkronisasi antarperangkat, atau panggilan API model AI.
- Progres tersimpan hanya pada browser/perangkat yang sama dan dapat hilang jika data browser dibersihkan.
- Area Uranus berfungsi sebagai pintasan eksplorasi tambahan; Neptunus membuka bagian project akhir.
- Pastikan materi dan produk akhir diperiksa manusia sebelum digunakan untuk pembelajaran.

## Checklist pengujian manual
- [ ] Beranda, navigasi, dan tombol Mulai Belajar berfungsi.
- [ ] Enam modul dapat dibuka dan dinavigasi.
- [ ] Kuis menolak pengiriman jawaban kosong, memberi pembahasan, menghitung skor, dan dapat diulang.
- [ ] Pencarian dan filter menampilkan hasil yang sesuai.
- [ ] Tema tersimpan setelah halaman dimuat ulang.
- [ ] Progres modul dan skor tersimpan, dan reset meminta konfirmasi.
- [ ] Checklist project akhir tersimpan secara lokal.
- [ ] Tampilan diuji pada lebar 360 px, tablet, dan desktop.
- [ ] Navigasi keyboard, kontras, serta preferensi reduced motion diperiksa.
