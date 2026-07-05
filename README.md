# chatting.aja

> **Chat cepat, privasi rapat, tanpa ribet.**

Aplikasi chat berbasis web yang memungkinkan kamu berkomunikasi secara real-time tanpa perlu nomor telepon. Cukup daftar dengan email, dapat **Unique Tag** otomatis, dan langsung chat.

---

## ✨ Fitur

- 🔐 **Auth tanpa nomor HP** — daftar & login hanya dengan email + password
- 🏷️ **Unique Tag System** — identitas berbentuk `username#4digit`, bukan nomor atau email
- ⚡ **Chat Real-time** — pesan muncul instan via Supabase Realtime (WebSocket)
- ✓✓ **Read Receipt** — tanda centang berubah warna saat pesan dibaca
- 🟢 **Status Online** — indikator online & last seen otomatis
- 📋 **Admin Panel** — kelola semua konten landing page tanpa coding
- 📱 **Responsive** — tampilan nyaman di mobile maupun desktop

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Backend & Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (WebSocket) |
| Deployment | Vercel |

---

## 🗂️ Struktur Proyek

```
chatting-aja/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Halaman login
│   │   └── register/       # Halaman register
│   ├── (main)/
│   │   ├── chat/
│   │   │   └── [id]/       # Ruang chat
│   │   ├── find/           # Cari pengguna by Unique Tag
│   │   └── profile/        # Halaman profil
│   ├── admin/
│   │   ├── login/          # Login admin panel
│   │   └── dashboard/      # CMS landing page (hero, stats, fitur, dll)
│   ├── api/
│   │   ├── admin/content/  # API kelola konten (service role)
│   │   └── landing/        # API konten publik landing page
│   └── page.tsx            # Splash page
├── components/
│   ├── admin/              # SectionEditor, ListEditor
│   ├── layout/             # Sidebar (server + client)
│   └── ui/                 # Avatar, dll
├── lib/
│   ├── hooks/              # useAuth, useMessages, useConversations, useOnlineStatus
│   ├── supabase/           # client, server, admin client
│   ├── admin/              # store & API helpers
│   └── types.ts            # Shared types & utilities
├── public/
│   └── landing.html        # Landing page marketing
├── middleware.ts            # Proteksi route (auth guard)
└── database.sql            # Schema lengkap PostgreSQL
```

---

## 🚀 Setup & Instalasi

### 1. Clone repo

```bash
git clone https://github.com/username/chatting-aja.git
cd chatting-aja
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** di dashboard Supabase
3. Paste dan jalankan seluruh isi file [`database.sql`](./database.sql)
4. Pastikan **Authentication → Email provider** sudah enabled

### 4. Setup environment variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

> Credentials bisa ditemukan di **Supabase Dashboard → Settings → API**

### 5. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Skema Database

| Tabel | Fungsi |
|---|---|
| `profiles` | Data user (username, unique_tag, avatar, last_seen) |
| `conversations` | Percakapan antar user |
| `conversation_members` | Relasi user ↔ conversation |
| `messages` | Semua pesan + status baca |
| `friend_requests` | Permintaan pertemanan |
| `landing_content` | Konten landing page (dikelola via admin panel) |

RLS (Row Level Security) aktif di semua tabel — user hanya bisa mengakses data miliknya sendiri.

---

## 🔗 URL Penting

| URL | Keterangan |
|---|---|
| `/` | Splash page |
| `/landing.html` | Landing page marketing |
| `/register` | Daftar akun baru |
| `/login` | Masuk |
| `/chat` | Daftar percakapan |
| `/chat/[id]` | Ruang chat |
| `/find` | Cari pengguna by Unique Tag |
| `/profile` | Profil & Unique Tag |
| `/admin/login` | Login admin panel |
| `/admin/dashboard` | CMS landing page |

---

## 🛡️ Admin Panel

Admin panel tersedia di `/admin/login` untuk mengelola konten landing page secara dinamis.

**Default credentials:**
```
Email    : admin@chatting.aja
Password : Admin@12345
```

> ⚠️ Ganti credentials di `lib/admin/store.ts` → `ADMIN_CREDENTIALS` sebelum deploy ke production.

Section yang bisa diedit: Hero, Stats Bar, Cara Kerja, Fitur, Unique Tag Section, Privasi, CTA.

---

## ☁️ Deploy ke Vercel

1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → import repo
3. Tambahkan environment variables yang sama seperti `.env.local`
4. Klik **Deploy**

---

## 📋 Roadmap

- [x] Landing page responsif
- [x] Auth (register / login / logout)
- [x] Unique Tag system
- [x] Chat real-time (WebSocket)
- [x] Read receipt & status online
- [x] Admin panel (CMS)
- [ ] Deploy production
- [ ] Group chat
- [ ] Notifikasi push
- [ ] Enkripsi end-to-end

---

## 📄 Lisensi

Copyright (c) 2026 Rifqi. All rights reserved.

Commercialization, distribution, modification, or copying of this source code, 
via any medium, is strictly prohibited without the express written permission 
of the copyright owner.

The software is provided "as is", without warranty of any kind.

---

<p align="center">
  Dibuat dengan ☕ dan Next.js
</p>
