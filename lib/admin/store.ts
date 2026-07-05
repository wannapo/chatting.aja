export interface LandingContent {
  hero: { badge: string; title: string; titleItalic: string; description: string; btnPrimary: string; btnSecondary: string }
  stats: Array<{ value: string; label: string }>
  steps: Array<{ icon: string; title: string; description: string }>
  features: Array<{ icon: string; title: string; description: string }>
  uid: { title: string; titleItalic: string; description: string }
  privacy: { title: string; description: string }
  cta: { title: string; titleItalic: string; description: string; btnPrimary: string; btnSecondary: string }
}

export const defaultContent: LandingContent = {
  hero: { badge: "MVP V1.0 — Sekarang tersedia", title: "Chat cepat,", titleItalic: "privasi rapat,\ntanpa ribet.", description: "Temukan teman lewat Unique User Tag, bukan nomor telepon atau email.", btnPrimary: "Mulai Chat", btnSecondary: "Lihat Demo" },
  stats: [{ value: "0ms", label: "Latensi rata-rata" }, { value: "100%", label: "Tanpa nomor telepon" }, { value: "Gratis", label: "Selamanya untuk pengguna" }, { value: "1 Tag", label: "Cukup untuk ditemukan" }],
  steps: [
    { icon: "✉️", title: "Daftar pakai email", description: "Cukup email dan password. Tidak perlu nomor telepon." },
    { icon: "🏷️", title: "Dapat Unique Tag otomatis", description: "Sistem langsung generate tag unik buat identitas kamu." },
    { icon: "💬", title: "Cari & mulai chat", description: "Masukkan Unique Tag teman, add, dan langsung chat." },
  ],
  features: [
    { icon: "⚡", title: "Real-time tanpa delay", description: "Pesan terkirim dan diterima secara instan lewat WebSocket." },
    { icon: "🟢", title: "Status online & last seen", description: "Tau kapan teman kamu online atau terakhir aktif." },
    { icon: "✓✓", title: "Read receipt", description: "Tanda centang dua yang berubah warna saat pesan dibaca." },
    { icon: "🔍", title: "Cari percakapan", description: "Cari pesan atau kontak dengan cepat." },
  ],
  uid: { title: "Satu tag,\ncukup buat", titleItalic: "ditemukan.", description: "Tidak perlu kasih nomor HP atau email ke orang yang baru kenal." },
  privacy: { title: "Privasi bukan\nfitur tambahan.", description: "Di sini, privasi adalah default." },
  cta: { title: "Udah siap chat", titleItalic: "tanpa ribet?", description: "Daftar gratis, dapat Unique Tag, langsung chat.", btnPrimary: "Buat Akun Sekarang →", btnSecondary: "Pelajari lebih lanjut" },
}

export const ADMIN_CREDENTIALS = {
  email: "admin@chatting.aja",
  password: "Admin@12345",
}

// ── Fetch content dari Supabase via API ────────────────────
export async function fetchContent(): Promise<LandingContent> {
  try {
    const res = await fetch('/api/admin/content', { cache: 'no-store' })
    if (!res.ok) return defaultContent
    const data = await res.json()
    return { ...defaultContent, ...data }
  } catch {
    return defaultContent
  }
}

// ── Save satu section ke Supabase ──────────────────────────
export async function saveSectionToSupabase(section: string, content: any): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, content }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ── Admin auth (tetap pakai localStorage, bukan Supabase Auth) ──
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('admin_auth') === 'true'
}

export function adminLogin(email: string, password: string): boolean {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem('admin_auth', 'true')
    return true
  }
  return false
}

export function adminLogout(): void {
  localStorage.removeItem('admin_auth')
}
