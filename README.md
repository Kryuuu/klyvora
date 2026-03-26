# KlyVora (V2) - AI Workflow Automation SaaS

KlyVora adalah aplikasi **SaaS AI** yang berfokus penuh sebagai **Generator Workflow dan Otomatisasi Tugas** (Text-to-Workflow). Daripada pengguna menyusun urutan tugas *(Tasks)* secara manual, KlyVora memungkinkan pengguna untuk cukup mendeskripsikan tujuan akhir *(Goals)* mereka, lalu Model AI cerdas akan merancangkan dan memecahnya ke dalam instruksi terukur yang disimpan ke dalam *database*.

Aplikasi ini menggunakan teknologi yang sangat kencang dan kekinian *(End-to-End Server-Side Rendering)* untuk menjaga skalabilitas operasional tingkat tinggi.

---

## 💎 Fitur Utama (Core Features)

1. **AI Workflow Generator (`/generate`) - [FITUR INTI]**
   - Menggunakan model **Google Gemini 2.5 Flash** asli melalui _API Integration_.
   - Mampu menerjemahkan 1 *prompt* buatan pengguna menjadi kerangka kerja terstruktur penuh dengan susunan *Tasks* siap dieksekusi.
   - Menyimpan hasil AI ke bentuk relasional Database (Supabase) dengan sekali klik.

2. **Dashboard Overview (`/dashboard`)**
   - Menghitung statistik aktivitas: jumlah *Workflow* aktif yang berhasil di-_generate_, dan jumlah *Task* yang tertunda. 
   - Dirancang sebersih mungkin tanpa kerumitan memancing fokus ke 1 rute *Call-to-Action*: **"Generate Workflow"**.

3. **Workflows Manager (`/workflows`)**
   - Membaca urutan hasil data AI langsung dari layar.
   - Pengguna bisa mengeklik tiap *Workflow* untuk melihat turunan tugas *(Tasks)* spesifik dari Workflow terkait.

4. **Task Approver & Accordian (`/tasks`)**
   - Semua elemen *task* dibungkus rapi dalam kelompok *Workflow* (menggunakan antarmuka bergaya laci/*Accordion*).
   - Mudah mengubah riwayat antara *Todo* dan *Done*.
   - Fitur hapus dan sunting yang real-time disusupi ke *Supabase Client*.
   
5. **Mobile-First UX Navigation**
   - Desktop Mode: Terdapat Panel *Sidebar* mewah di kiri.
   - Mobile Mode: *Sidebar* hilang seketika dan berganti ke fitur *Bottom Navigation* bergaya aplikasi _Native_ (seperti di Android/iOS) yang menempel lekat pada batas aman layar ponsel (PWA Ready).

---

## 🛠 Tech Stack

| Lapisan | Teknologi | Deskripsi |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Menggunakan rute dinamis (*server & client layout* otomatis). Kecepatan maksimal dengan Turbopack. |
| **Styling** | Tailwind CSS v4 & Veni UI | Desain gelap *(Glassmorphism)* minimalis memikat mata untuk target audiens *SaaS Profesional*. |
| **Database & Auth** | Supabase | Manajemen otentikasi (Auth) dan tabel relasional murni via SQL Storage. |
| **Pergerakan Otak AI** | Google Gemini (REST) | Memakai *v1beta/gemini-2.5-flash* Server-To-Server untuk keamanan _Key_. |

---

## 🚦 Status Module: SUBSCRIPTION & LIMITATIONS
*(Penting dibaca bagi Developer selanjutnya yang ingin melakukan Fixing)*

Sistem batasan gratis *(Free Tier Constraint)* **SUDAH TERPASANG** dan berfungsi sebagai validasi logikal, namun infrastruktur aslinya (Tabel Pembayaran) **BELUM** terhubung *(Mock/Soft Check)*.

**Cara Kerja Pembatasan Sekarang:**
- Ketika pengguna menekan tabel halaman `/generate`, modul `useEffect` mengeksekusi `supabase.from('workflows').select(count)` milik `user.id` yang bersangkutan.
- **Limit:** Jika perhitungan *count* menemukan pengguna sudah menciptakan $\ge 3$ *workflows*, sistem UI akan mengunci input teks dan memaksa (*Guard*) pesan "Free Plan Limit Reached".
- Pengguna hanya akan disuruh mengeklik tombol "Upgrade To Pro" yang saat ini diarahkan ke `/subscription`.

**🔧 PR (Pekerjaan Rumah) Fixing Langganan untuk Developer:**
1. Anda perlu membuat kolom tabel `subscriptions` (misalnya memuat *tier*, *billing_id*, *status*).
2. Ubah pengecekan di dalam `/generate/page.jsx`: alih-alih hanya mengecek jumlah *limit=3*, gabungkan verifikasinya untuk membaca apakah profil Pengguna berstatus "PRO" di tabel sekunder sebelum membolongi pengecekan.
3. Hubungkan *Payment Gateway* (seperti *Stripe/Midtrans/Paddle*) di halaman `/subscription` untuk secara otomatis memperbarui tabel *PRO status* tadi. 

---

## 📦 Skema Database (Kondisi Saat Ini)

*(Sistem ini telah dimodifikasi agar secara permanen beradaptasi pada gaya pengejaan tabel asli dari pemilik kodenya)*:

- **Tabel `profiles`**
  - `id` (PK, Auth uuid)
  - `full_name` (Text)
  
- **Tabel `workflows`**
  - `id` (PK)
  - `user_id` (FK -> profiles.id)
  - `tittle` *(Perhatikan: Ejaan orisinal)*
  - `category`
  - `created_at`
  
- **Tabel `tasks`**
  - `id` (PK)
  - `workflow_id` (FK -> workflows.id)
  - `tittle` *(Tidak memiliki kolom `user_id`, inner join difilter berdasarkan kemilikan Workflow induk).*
  - `status` ('todo', 'done')
  - `created_at`

Semua intervensi AI dikalibrasi secara ketat untuk mencerna format tabel `tittle` di atas. Tidak perlu melakukan SQL *Rename Schema* tambahan.

---
> 💡 *Dikurasi oleh Antigravity (Google) - "Membangun AI tanpa ribet infrastruktur dari nol."*
