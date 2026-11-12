MAISON DIMS — FRONTEND UPGRADE

FILE UTAMA
- index.html: halaman awal/campaign
- products.html: katalog 9 slot produk + filter
- product-detail.html: detail produk dinamis berdasarkan ?product=id
- cart.html: keranjang demo
- account.html: akun demo lokal
- about.html, lookbook.html, archives.html: halaman navigasi terpisah
- products-data.js: data nama, harga, dan tiga foto setiap produk
- script.js: menu, foto, favorit, keranjang, mata uang, ulasan, akun demo
- style.css: tampilan responsif desktop/tablet/HP

PENTING
1. Unggah seluruh isi folder MAISON-DIMS ke root repository GitHub Pages (jangan hanya file HTML).
2. Delapan produk memiliki tiga foto yang dipetakan dari nama file yang tersedia. Produk kesembilan masih placeholder karena file foto depan, belakang, dan labelnya belum ada di arsip ini. Tambahkan ketiga foto dan ubah produk archive-piece-09 di products-data.js untuk mengaktifkannya.
3. Keranjang, favorit, ulasan, dan akun adalah demo localStorage pada browser/perangkat yang sama. Ini bukan backend, bukan akun aman, dan bukan pembayaran sungguhan. Jangan memasukkan password asli.
4. Mata uang USD/EUR menggunakan angka konversi perkiraan statis untuk demo, bukan kurs real-time.
5. Rating awal adalah tampilan desain; ulasan dan rating yang dikirim dari browser disimpan lokal dan tidak menjadi ulasan publik.
