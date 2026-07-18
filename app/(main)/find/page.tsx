"use client";
import { useState } from "react";
import { Search, UserPlus, UserCheck, Hash } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { isOnline, getInitial } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";

export default function FindPage() {
  const { t } = useTranslation();
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
      alert(t("not_found"));
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
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg)", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "var(--text)", marginBottom: "6px" }}>{t("find_title")}</h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px" }}>{t("find_desc")}</p>

        {/* Search bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "12px 16px" }}>
            <Hash size={15} color="var(--accent)" />
            <input
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontFamily: "inherit", fontWeight: 600, fontSize: "15px" }}
              placeholder={t("find_placeholder")}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} disabled={searching || !query.trim()} style={{ padding: "12px 20px", borderRadius: "14px", background: "var(--bubble-mine)", border: "none", color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent)", flexShrink: 0, opacity: searching ? 0.7 : 1 }}>
            {searching ? "..." : t("find_btn_search")}
          </button>
        </div>

        {/* Not found */}
        {result === "not-found" && (
          <div style={{ textAlign: "center", padding: "32px 20px", background: "var(--surface)", borderRadius: "18px", border: "1px solid var(--border)", marginBottom: "20px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🤔</div>
            <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "15px", color: "var(--text)", marginBottom: "6px" }}>{t("find_not_found_title")}</div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>{t("find_not_found_desc")}</div>
          </div>
        )}

        {/* Result */}
        {result && result !== "not-found" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "18px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            <Avatar letter={getInitial(result.username)} colorClass={result.avatar_color} size="lg" online={isOnline(result.last_seen)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "16px", color: "var(--text)" }}>{result.username}</div>
              <div style={{ fontSize: "12px", color: "var(--accent)", marginTop: "2px" }}>{result.unique_tag}</div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                {isOnline(result.last_seen) ? t("find_online") : t("find_offline")}
              </div>
            </div>
            <button onClick={handleStartChat} disabled={starting || result.id === profile?.id} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "12px",
              background: result.id === profile?.id ? "var(--surface2)" : "var(--bubble-mine)",
              border: result.id === profile?.id ? "1px solid var(--border)" : "none",
              color: result.id === profile?.id ? "var(--muted)" : "white",
              fontFamily: "inherit", fontWeight: 700, fontSize: "13px", cursor: result.id === profile?.id ? "not-allowed" : "pointer", flexShrink: 0,
              opacity: starting ? 0.7 : 1,
            }}>
              {result.id === profile?.id ? t("find_this_is_you") : starting ? "..." : <><UserPlus size={14} /> {t("find_btn_chat")}</>}
            </button>
          </div>
        )}

        {/* My tag */}
        {profile && (
          <div style={{ background: "var(--surface)", border: "1px dashed color-mix(in srgb, var(--accent) 40%, transparent)", borderRadius: "18px", padding: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--muted)", marginBottom: "10px" }}>{t("find_my_tag_label")}</div>
            <div style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "26px", color: "var(--accent)", marginBottom: "6px" }}>{profile.unique_tag}</div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px", lineHeight: "1.6" }}>{t("find_my_tag_desc")}</p>
            <button onClick={copyTag} style={{ padding: "8px 18px", borderRadius: "10px", background: copied ? "color-mix(in srgb, var(--green) 12%, transparent)" : "var(--surface2)", border: copied ? "1px solid color-mix(in srgb, var(--green) 40%, transparent)" : "1px solid var(--border)", color: copied ? "var(--green)" : "var(--muted)", fontFamily: "inherit", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
              {copied ? t("find_btn_copied") : t("find_btn_copy_tag")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// mobile responsive already handled via inline styles
