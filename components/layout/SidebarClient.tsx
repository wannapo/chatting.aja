"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Settings, X, Copy, Check } from "lucide-react";
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
            placeholder="Scan Unique Tags / Channels"
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
          <div style={{ padding: "24px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
            <div style={{ fontSize: "13px", color: "#7c7c8a" }}>{search ? "Tidak ditemukan" : "Belum ada percakapan"}</div>
            {!search && (
              <Link href="/find" onClick={onClose} style={{ display: "inline-block", marginTop: "10px", fontSize: "12px", color: "#a855f7", textDecoration: "none" }}>
                + Cari pengguna
              </Link>
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
