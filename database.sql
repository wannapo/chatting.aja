-- ============================================================
--  chatting.aja — Database Schema
--  Platform : Supabase (PostgreSQL)
--  Dibuat   : 2025
--  Cara pakai:
--    1. Buka Supabase Dashboard → SQL Editor
--    2. Paste seluruh isi file ini
--    3. Klik "Run"
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Drop tables jika sudah ada (untuk fresh install) ────────
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS landing_content CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================
--  TABLE: profiles
--  Menyimpan data user yang terhubung ke Supabase Auth
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL,
  unique_tag    TEXT NOT NULL UNIQUE,
  avatar_color  TEXT NOT NULL DEFAULT 'from-red-600 to-red-400',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Data profil user, terhubung ke auth.users';
COMMENT ON COLUMN profiles.unique_tag IS 'Format: username#4digit, contoh: budi#4291';
COMMENT ON COLUMN profiles.avatar_color IS 'Tailwind gradient class untuk avatar';

-- ============================================================
--  TABLE: conversations
--  Menyimpan percakapan (1-on-1 chat)
-- ============================================================
CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE conversations IS 'Setiap percakapan antara dua user';

-- ============================================================
--  TABLE: conversation_members
--  Relasi many-to-many antara user dan conversation
-- ============================================================
CREATE TABLE conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

COMMENT ON TABLE conversation_members IS 'Member dari setiap percakapan';

-- ============================================================
--  TABLE: messages
--  Menyimpan semua pesan
-- ============================================================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Semua pesan dalam percakapan';

-- ============================================================
--  TABLE: friend_requests
--  Permintaan pertemanan antar user
-- ============================================================
CREATE TABLE friend_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_user_id, to_user_id)
);

COMMENT ON TABLE friend_requests IS 'Permintaan add teman';

-- ============================================================
--  TABLE: landing_content
--  Konten landing page yang bisa diedit dari admin panel
-- ============================================================
CREATE TABLE landing_content (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section    TEXT NOT NULL UNIQUE,
  content    JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE landing_content IS 'Konten landing page per section';

-- ============================================================
--  INDEXES — untuk performa query
-- ============================================================
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX idx_profiles_unique_tag ON profiles(unique_tag);
CREATE INDEX idx_friend_requests_to ON friend_requests(to_user_id);
CREATE INDEX idx_friend_requests_from ON friend_requests(from_user_id);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
--  Penting! Tanpa ini semua data bisa diakses siapa saja
-- ============================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;

-- profiles: siapa saja bisa read, hanya diri sendiri bisa update
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- conversations: hanya member yang bisa lihat
CREATE POLICY "conversations_select" ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );
CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- conversation_members: hanya member yang bisa lihat
CREATE POLICY "conv_members_select" ON conversation_members FOR SELECT
  USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_members cm2
      WHERE cm2.conversation_id = conversation_members.conversation_id
      AND cm2.user_id = auth.uid()
    )
  );
CREATE POLICY "conv_members_insert" ON conversation_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- messages: hanya member conversation yang bisa baca & kirim
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "messages_update" ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- friend_requests
CREATE POLICY "friend_req_select" ON friend_requests FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "friend_req_insert" ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "friend_req_update" ON friend_requests FOR UPDATE
  USING (to_user_id = auth.uid());

-- landing_content: semua bisa baca, hanya service role yang bisa write
CREATE POLICY "landing_select" ON landing_content FOR SELECT USING (true);

-- ============================================================
--  FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile saat user baru register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, unique_tag, avatar_color)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'unique_tag',
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', 'from-red-600 to-red-400')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.last_seen = NOW();
  RETURN NEW;
END;
$$;

-- Auto-update landing_content updated_at
CREATE OR REPLACE FUNCTION update_landing_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER landing_content_updated_at
  BEFORE UPDATE ON landing_content
  FOR EACH ROW EXECUTE FUNCTION update_landing_updated_at();

-- Function: cari user by unique_tag
CREATE OR REPLACE FUNCTION find_user_by_tag(tag TEXT)
RETURNS TABLE (
  id UUID, username TEXT, unique_tag TEXT,
  avatar_color TEXT, last_seen TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.unique_tag, p.avatar_color, p.last_seen
  FROM profiles p
  WHERE LOWER(p.unique_tag) = LOWER(tag)
  LIMIT 1;
END;
$$;

-- Function: get or create conversation antara dua user
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  conv_id UUID;
  current_user_id UUID := auth.uid();
BEGIN
  -- Cari conversation yang sudah ada
  SELECT cm1.conversation_id INTO conv_id
  FROM conversation_members cm1
  JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
  WHERE cm1.user_id = current_user_id
    AND cm2.user_id = other_user_id
  LIMIT 1;

  -- Kalau belum ada, buat baru
  IF conv_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conv_id;
    INSERT INTO conversation_members (conversation_id, user_id) VALUES (conv_id, current_user_id);
    INSERT INTO conversation_members (conversation_id, user_id) VALUES (conv_id, other_user_id);
  END IF;

  RETURN conv_id;
END;
$$;

-- Function: mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(p_conversation_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE messages
  SET is_read = TRUE
  WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND is_read = FALSE;
END;
$$;

-- ============================================================
--  REALTIME — enable untuk tabel yang butuh live update
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;

-- ============================================================
--  SEED DATA — konten default landing page
-- ============================================================
INSERT INTO landing_content (section, content) VALUES
('hero', '{
  "badge": "MVP V1.0 — Sekarang tersedia",
  "title": "Chat cepat,",
  "titleItalic": "privasi rapat,\ntanpa ribet.",
  "description": "Temukan teman lewat Unique User Tag, bukan nomor telepon atau email. Chat real-time, status online, dan histori percakapan tersimpan aman.",
  "btnPrimary": "Mulai Chat",
  "btnSecondary": "Lihat Demo"
}'::jsonb),
('stats', '[
  {"value": "0ms", "label": "Latensi rata-rata"},
  {"value": "100%", "label": "Tanpa nomor telepon"},
  {"value": "Gratis", "label": "Selamanya untuk pengguna"},
  {"value": "1 Tag", "label": "Cukup untuk ditemukan"}
]'::jsonb),
('steps', '[
  {"icon": "✉️", "title": "Daftar pakai email", "description": "Cukup email dan password. Tidak perlu nomor telepon, tidak perlu verifikasi ribet."},
  {"icon": "🏷️", "title": "Dapat Unique Tag otomatis", "description": "Sistem langsung generate tag unik. Bagikan ke siapapun yang mau lo ajak chat."},
  {"icon": "💬", "title": "Cari & mulai chat", "description": "Masukkan Unique Tag teman, add, dan langsung chat real-time."}
]'::jsonb),
('features', '[
  {"icon": "⚡", "title": "Real-time tanpa delay", "description": "Pesan terkirim dan diterima secara instan lewat WebSocket."},
  {"icon": "🟢", "title": "Status online & last seen", "description": "Tau kapan teman kamu online atau terakhir aktif."},
  {"icon": "✓✓", "title": "Read receipt", "description": "Tanda centang dua yang berubah warna saat pesan sudah dibaca."},
  {"icon": "🔍", "title": "Cari percakapan", "description": "Cari pesan atau kontak dengan cepat."}
]'::jsonb),
('uid', '{
  "title": "Satu tag,\ncukup buat",
  "titleItalic": "ditemukan.",
  "description": "Tidak perlu kasih nomor HP atau email ke orang yang baru kenal."
}'::jsonb),
('privacy', '{
  "title": "Privasi bukan\nfitur tambahan.",
  "description": "Di sini, privasi adalah default. Lo tidak perlu ngapa-ngapain untuk terlindungi."
}'::jsonb),
('cta', '{
  "title": "Udah siap chat",
  "titleItalic": "tanpa ribet?",
  "description": "Daftar gratis, dapat Unique Tag, langsung chat.",
  "btnPrimary": "Buat Akun Sekarang →",
  "btnSecondary": "Pelajari lebih lanjut"
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- ============================================================
--  SELESAI
--  Jalankan file ini di: Supabase Dashboard → SQL Editor → Run
-- ============================================================
