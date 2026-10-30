# Deploy SeChiro Studio to GitHub Pages 🚀

Website ini sudah dikonfigurasi penuh untuk di-host di **GitHub Pages** (100% Gratis).

## Keunggulan di GitHub Pages:
- **Tanpa Server / Database Tambahan**: Semua data karya, antrian komisi VGen, buku tamu, dan pengaturan About Me dikelola secara dinamis di browser (`localStorage`).
- **Secret Admin Panel di `/secret-studio-panel-x9`**: Tetap berfungsi untuk mengunggah artwork, mengelola status komisi, mengedit bio About Me, dan mengatur antrian.
- **Otomatisasi via GitHub Actions**: Setiap kali Anda melakukan `git push` ke GitHub, website akan ter-build dan ter-deploy secara otomatis.

---

## Cara Mengaktifkan GitHub Pages (Sekali Setup):

1. **Push Kode ke Repository GitHub Anda**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **Buka Repository di GitHub Browser**:
   - Buka tab **Settings** → **Pages** (di menu sebelah kiri).
   - Pada bagian **Build and deployment** -> **Source**, pilih **GitHub Actions**.

3. **Selesai!** 
   - Buka tab **Actions** di repository Anda untuk melihat proses build dan deploy yang berjalan otomatis.
   - Setelah selesai (sekitar 1-2 menit), GitHub akan memberikan link publik website Anda (contoh: `https://username.github.io/repository-name/`).

---

## Catatan Custom Domain (Opsional):
Jika Anda ingin menggunakan domain sendiri (misal: `sechiro.art`):
1. Buka **Settings** -> **Pages** -> isi bidang **Custom domain**.
2. Atur DNS CNAME / A Record di penyedia domain Anda mengarah ke GitHub Pages.
