"use client";
import { useState } from "react";
import { Search, UserPlus, UserCheck, Hash } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { isOnline, getInitial } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";

export default function FindPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Profile | null | "not-found">(null);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { profile } = useAuth();

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResult(null);

    const { data } = await supabase.rpc("find_user_by_tag", { tag: q });
    if (data && data.length > 0) setResult(data[0] as Profile);
    else setResult("not-found");
    setSearching(false);
  };

  const handleStartChat = async () => {
    if (!result || result === "not-found") return;
    setStarting(true);

    try {
      // Pastikan user sudah login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Coba via RPC dulu
      const { data: convId, error: rpcError } = await supabase
        .rpc("get_or_create_conversation", { other_user_id: result.id });

      if (!rpcError && convId) {
        router.push(`/chat/${convId}`);
        return;
      }

      // Fallback: manual create conversation jika RPC gagal
      // 1. Cek apakah conversation sudah ada
      const { data: existingMembers } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (existingMembers && existingMembers.length > 0) {
        const convIds = existingMembers.map(m => m.conversation_id);
        const { data: shared } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", result.id)
          .in("conversation_id", convIds)
          .limit(1);

        if (shared && shared.length > 0) {
          router.push(`/chat/${shared[0].conversation_id}`);
          return;
        }
      }

      // 2. Buat conversation baru
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select("id")
        .single();

      if (convError || !newConv) throw new Error("Gagal membuat percakapan");

      // 3. Tambahkan kedua user sebagai member
      const { error: memberError } = await supabase
        .from("conversation_members")
        .insert([
          { conversation_id: newConv.id, user_id: user.id },
          { conversation_id: newConv.id, user_id: result.id },
        ]);

      if (memberError) throw new Error("Gagal menambahkan member");

      router.push(`/chat/${newConv.id}`);

    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Gagal memulai percakapan. Coba lagi.");
    } finally {
      setStarting(false);
    }
  };

  const copyTag = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.unique_tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#0a0a10", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "#f5f5f7", marginBottom: "6px" }}>Temukan Pengguna</h1>
        <p style={{ fontSize: "13px", color: "#7c7c8a", marginBottom: "24px" }}>Masukkan Unique Tag teman kamu untuk mulai chat</p>

        {/* Search bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "#111116", border: "1px solid #2a2a35", borderRadius: "14px", padding: "12px 16px" }}>
            <Hash size={15} color="#a855f7" />
            <input
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f5f5f7", fontFamily: "inherit", fontWeight: 600, fontSize: "15px" }}
              placeholder="contoh: budi#4291"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} disabled={searching || !query.trim()} style={{ padding: "12px 20px", borderRadius: "14px", background: "linear-gradient(135deg,#a855f7,#d946ef)", border: "none", color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px rgba(168,85,247,0.4)", flexShrink: 0, opacity: searching ? 0.7 : 1 }}>
            {searching ? "..." : "Cari"}
          </button>
        </div>

        {/* Not found */}
        {result === "not-found" && (
          <div style={{ textAlign: "center", padding: "32px 20px", background: "#111116", borderRadius: "18px", border: "1px solid #2a2a35", marginBottom: "20px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🤔</div>
            <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "15px", color: "#f5f5f7", marginBottom: "6px" }}>Pengguna tidak ditemukan</div>
            <div style={{ fontSize: "13px", color: "#7c7c8a" }}>Pastikan Unique Tag yang dimasukkan benar</div>
          </div>
        )}

        {/* Result */}
        {result && result !== "not-found" && (
          <div style={{ background: "#111116", border: "1px solid #2a2a35", borderRadius: "18px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            <Avatar letter={getInitial(result.username)} colorClass={result.avatar_color} size="lg" online={isOnline(result.last_seen)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "16px", color: "#f5f5f7" }}>{result.username}</div>
              <div style={{ fontSize: "12px", color: "#a855f7", marginTop: "2px" }}>{result.unique_tag}</div>
              <div style={{ fontSize: "11px", color: "#7c7c8a", marginTop: "2px" }}>
                {isOnline(result.last_seen) ? "Sedang online" : "Offline"}
              </div>
            </div>
            <button onClick={handleStartChat} disabled={starting || result.id === profile?.id} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "12px",
              background: result.id === profile?.id ? "#17171f" : "linear-gradient(135deg,#a855f7,#d946ef)",
              border: result.id === profile?.id ? "1px solid #2a2a35" : "none",
              color: result.id === profile?.id ? "#7c7c8a" : "white",
              fontFamily: "inherit", fontWeight: 700, fontSize: "13px", cursor: result.id === profile?.id ? "not-allowed" : "pointer", flexShrink: 0,
              opacity: starting ? 0.7 : 1,
            }}>
              {result.id === profile?.id ? "Ini kamu" : starting ? "..." : <><UserPlus size={14} /> Chat</>}
            </button>
          </div>
        )}

        {/* My tag */}
        {profile && (
          <div style={{ background: "#111116", border: "1px dashed rgba(168,85,247,0.4)", borderRadius: "18px", padding: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "#7c7c8a", marginBottom: "10px" }}>UNIQUE TAG KAMU</div>
            <div style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "26px", color: "#d8b4fe", marginBottom: "6px" }}>{profile.unique_tag}</div>
            <p style={{ fontSize: "12px", color: "#7c7c8a", marginBottom: "14px", lineHeight: "1.6" }}>Bagikan tag ini ke teman biar mereka bisa nemuin kamu</p>
            <button onClick={copyTag} style={{ padding: "8px 18px", borderRadius: "10px", background: copied ? "rgba(79,255,176,0.12)" : "#17171f", border: copied ? "1px solid rgba(79,255,176,0.4)" : "1px solid #2a2a35", color: copied ? "#22c55e" : "#7c7c8a", fontFamily: "inherit", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
              {copied ? "✓ Disalin!" : "Salin Tag"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// mobile responsive already handled via inline styles
