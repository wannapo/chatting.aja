"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Settings, X, Copy, Check, Hash } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useConversations } from "@/lib/hooks/useConversations";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { isOnline, getInitial } from "@/lib/types";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile | null;
  onClose?: () => void;
}

export default function SidebarClient({ profile, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"online"|"unread">("all");
  const [copied, setCopied] = useState(false);
  const [remoteResult, setRemoteResult] = useState<Profile | null | "not-found">(null);
  const [remoteSearching, setRemoteSearching] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const supabase = createClient();
  const { conversations, loading } = useConversations(profile?.id || "");
  useOnlineStatus(profile?.id);

  const filtered = conversations.filter(conv => {
    const matchSearch =
      conv.contact.username.toLowerCase().includes(search.toLowerCase()) ||
      conv.contact.unique_tag.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "online") return isOnline(conv.contact.last_seen);
    if (filter === "unread") return conv.unread > 0;
    return true;
  });

  // Kalau gak ketemu di percakapan yang ada, coba cari user baru lewat tag (mis. "budi#1234")
  useEffect(() => {
    const q = search.trim();
    if (!q || filtered.length > 0) { setRemoteResult(null); return; }

    const timer = setTimeout(async () => {
      setRemoteSearching(true);
      const { data } = await supabase.rpc("find_user_by_tag", { tag: q });
      if (data && data.length > 0 && data[0].id !== profile?.id) {
        setRemoteResult(data[0] as Profile);
      } else {
        setRemoteResult("not-found");
      }
      setRemoteSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, filtered.length, profile?.id]);

  async function handleStartChat(otherUser: Profile) {
    setStarting(true);
    setStartError(null);
    try {
      const { data: convId, error } = await supabase
        .rpc("get_or_create_conversation", { other_user_id: otherUser.id });
      if (error) {
        console.error("get_or_create_conversation error:", error);
        setStartError(error.message || "Gagal memulai chat.");
        return;
      }
      if (convId) {
        setSearch("");
        onClose?.();
        router.push(`/chat/${convId}`);
      } else {
        setStartError("Server tidak mengembalikan ID percakapan.");
      }
    } catch (err) {
      console.error("handleStartChat exception:", err);
      setStartError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.");
    } finally {
      setStarting(false);
    }
  }

  function copyTag() {
    if (!profile) return;
    navigator.clipboard.writeText(profile.unique_tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!profile) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "inherit" }}>
      {/* NODE_ID panel */}
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #2a2a35" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span className="mono" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "1px", color: "#55555f" }}>NODE_ID</span>
          <button onClick={onClose} className="sidebar-close-btn"
            style={{ background: "none", border: "none", color: "#7c7c8a", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "16px", color: "#f5f5f7" }}>{profile.unique_tag}</span>
          <button onClick={copyTag} style={{ background: "none", border: "none", color: copied ? "#22c55e" : "#7c7c8a", cursor: "pointer", display: "flex" }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#17171f", border: "1px solid #2a2a35", borderRadius: "12px", padding: "8px 12px" }}>
          <Search size={13} color="#7c7c8a" />
          <input
            placeholder="Cari chat atau Unique Tag (mis. budi#1234)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f5f5f7", fontSize: "13px", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "10px 12px", borderBottom: "1px solid #2a2a35" }}>
        {(["all","online","unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, padding: "6px 4px", borderRadius: "8px",
            border: filter===f ? "1px solid #2a2a35" : "1px solid transparent",
            background: filter===f ? "#17171f" : "none",
            color: filter===f ? "#f5f5f7" : "#7c7c8a",
            fontSize: "11px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}>
            {f==="all" ? "Semua" : f==="online" ? "Online" : "Belum dibaca"}
          </button>
        ))}
      </div>

      <div className="mono" style={{ padding: "12px 14px 4px", fontSize: "10px", fontWeight: 600, letterSpacing: "1px", color: "#55555f" }}>
        ACTIVE_PIPELINES
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#7c7c8a" }}>Memuat...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "16px" }}>
            {!search ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
                <div style={{ fontSize: "13px", color: "#7c7c8a" }}>Belum ada percakapan</div>
                <Link href="/find" onClick={onClose} style={{ display: "inline-block", marginTop: "10px", fontSize: "12px", color: "#a855f7", textDecoration: "none" }}>
                  + Cari pengguna
                </Link>
              </div>
            ) : remoteSearching ? (
              <div style={{ textAlign: "center", padding: "16px 0", fontSize: "13px", color: "#7c7c8a" }}>Mencari...</div>
            ) : remoteResult && remoteResult !== "not-found" ? (
              <div style={{ background: "#17171f", border: "1px solid rgba(168,85,247,0.35)", borderRadius: "14px", padding: "12px" }}>
                <div className="mono" style={{ fontSize: "10px", color: "#55555f", letterSpacing: "0.5px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Hash size={11} /> NODE_FOUND
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <Avatar letter={getInitial(remoteResult.username)} colorClass={remoteResult.avatar_color} size="md" online={isOnline(remoteResult.last_seen)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#f5f5f7" }}>{remoteResult.username}</div>
                    <div style={{ fontSize: "12px", color: "#a855f7" }}>{remoteResult.unique_tag}</div>
                  </div>
                </div>
                <button onClick={() => handleStartChat(remoteResult)} disabled={starting} style={{
                  width: "100%", padding: "9px", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#a855f7,#d946ef)", color: "white", fontWeight: 600, fontSize: "12px", fontFamily: "inherit",
                  opacity: starting ? 0.7 : 1,
                }}>
                  {starting ? "Menghubungkan..." : "Mulai Chat"}
                </button>
                {startError && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#ff5c5c", background: "rgba(255,92,92,0.08)", border: "1px solid rgba(255,92,92,0.3)", borderRadius: "8px", padding: "8px 10px" }}>
                    {startError}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "13px", color: "#7c7c8a" }}>Tidak ditemukan</div>
                <div style={{ fontSize: "11px", color: "#55555f", marginTop: "4px" }}>Pastikan Unique Tag lengkap, mis. budi#1234</div>
              </div>
            )}
          </div>
        ) : filtered.map(conv => {
          const active = pathname === `/chat/${conv.id}`;
          const online = isOnline(conv.contact.last_seen);
          return (
            <Link key={conv.id} href={`/chat/${conv.id}`} onClick={onClose} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "10px",
                borderRadius: "14px", marginBottom: "2px", cursor: "pointer",
                background: active ? "rgba(168,85,247,0.08)" : "transparent",
                border: active ? "1px solid rgba(168,85,247,0.35)" : "1px solid transparent",
              }}>
                <Avatar letter={getInitial(conv.contact.username)} colorClass={conv.contact.avatar_color} size="md" online={online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "inherit", fontWeight: 600, fontSize: "13px", color: "#f5f5f7", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.contact.username}
                  </div>
                  <div style={{ fontSize: "12px", color: "#7c7c8a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.last_message || "Uplink established..."}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: "10px", color: "#55555f" }}>{conv.last_time}</span>
                  {conv.unread > 0 && (
                    <span style={{ background: "#ec4899", color: "white", fontSize: "10px", fontWeight: 700, borderRadius: "6px", padding: "2px 6px" }}>{conv.unread}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid #2a2a35", display: "flex", alignItems: "center", gap: "10px" }}>
        <Link href="/profile" onClick={onClose} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Avatar letter={getInitial(profile.username)} colorClass={profile.avatar_color} size="sm" />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "inherit", fontWeight: 600, fontSize: "13px", color: "#f5f5f7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.username}
          </div>
          <div className="mono" style={{ fontSize: "10px", color: "#a855f7" }}>{profile.unique_tag}</div>
        </div>
        <Link href="/profile" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "8px", background: "#17171f", border: "1px solid #2a2a35", color: "#7c7c8a", textDecoration: "none" }}>
          <Settings size={13} />
        </Link>
      </div>

      <style>{`
        @media (min-width: 769px) { .sidebar-close-btn { display: none !important; } }
      `}</style>
    </div>
  );
}
