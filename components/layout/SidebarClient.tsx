"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Settings, X, Copy, Check } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useConversations } from "@/lib/hooks/useConversations";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { isOnline, getInitial } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile | null;
  onClose?: () => void;
}

export default function SidebarClient({ profile, onClose }: Props) {
  const { t } = useTranslation();
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
        setStartError(error.message || t("not_found"));
        return;
      }
      if (convId) {
        setSearch("");
        onClose?.();
        router.push(`/chat/${convId}`);
      } else {
        setStartError(t("not_found"));
      }
    } catch (err) {
      console.error("handleStartChat exception:", err);
      setStartError(err instanceof Error ? err.message : t("not_found"));
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

  if (!profile) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "inherit" }}>
      {/* Panel ID / cari */}
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>
            {t("sidebar_id_label")}
          </span>
          <button onClick={onClose} className="sidebar-close-btn"
            style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "16px", color: "var(--text)" }}>{profile.unique_tag}</span>
          <button onClick={copyTag} style={{ background: "none", border: "none", color: copied ? "var(--green)" : "var(--muted)", cursor: "pointer", display: "flex" }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "8px 12px" }}>
          <Search size={13} color="var(--muted)" />
          <input
            placeholder={t("sidebar_search_placeholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: "13px", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
        {(["all","online","unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, padding: "6px 4px", borderRadius: "8px",
            border: filter===f ? "1px solid var(--border)" : "1px solid transparent",
            background: filter===f ? "var(--surface2)" : "none",
            color: filter===f ? "var(--text)" : "var(--muted)",
            fontSize: "11px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}>
            {f==="all" ? t("filter_all") : f==="online" ? t("filter_online") : t("filter_unread")}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 14px 4px", fontSize: "11px", fontWeight: 600, color: "var(--muted)" }}>
        {t("section_conversations")}
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>{t("loading")}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "16px" }}>
            {!search ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>{t("empty_no_conversations")}</div>
                <Link href="/find" onClick={onClose} style={{ display: "inline-block", marginTop: "10px", fontSize: "12px", color: "var(--accent)", textDecoration: "none" }}>
                  {t("link_find_user")}
                </Link>
              </div>
            ) : remoteSearching ? (
              <div style={{ textAlign: "center", padding: "16px 0", fontSize: "13px", color: "var(--muted)" }}>{t("searching")}</div>
            ) : remoteResult && remoteResult !== "not-found" ? (
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "10px" }}>{t("user_found")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <Avatar letter={getInitial(remoteResult.username)} colorClass={remoteResult.avatar_color} size="md" online={isOnline(remoteResult.last_seen)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>{remoteResult.username}</div>
                    <div style={{ fontSize: "12px", color: "var(--accent)" }}>{remoteResult.unique_tag}</div>
                  </div>
                </div>
                <button onClick={() => handleStartChat(remoteResult)} disabled={starting} style={{
                  width: "100%", padding: "9px", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: "var(--bubble-mine)", color: "var(--bubble-mine-text)", fontWeight: 600, fontSize: "12px", fontFamily: "inherit",
                  opacity: starting ? 0.7 : 1,
                }}>
                  {starting ? t("btn_connecting") : t("btn_start_chat")}
                </button>
                {startError && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--red)", background: "color-mix(in srgb, var(--red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)", borderRadius: "8px", padding: "8px 10px" }}>
                    {startError}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>{t("not_found")}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{t("not_found_hint")}</div>
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
                background: active ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
                border: active ? "1px solid color-mix(in srgb, var(--accent) 35%, transparent)" : "1px solid transparent",
              }}>
                <Avatar letter={getInitial(conv.contact.username)} colorClass={conv.contact.avatar_color} size="md" online={online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "inherit", fontWeight: 600, fontSize: "13px", color: "var(--text)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.contact.username}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.last_message || t("last_message_placeholder")}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>{conv.last_time}</span>
                  {conv.unread > 0 && (
                    <span style={{ background: "var(--pink)", color: "white", fontSize: "10px", fontWeight: 700, borderRadius: "6px", padding: "2px 6px" }}>{conv.unread}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
        <Link href="/profile" onClick={onClose} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Avatar letter={getInitial(profile.username)} colorClass={profile.avatar_color} size="sm" />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "inherit", fontWeight: 600, fontSize: "13px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.username}
          </div>
          <div style={{ fontSize: "11px", color: "var(--accent)" }}>{profile.unique_tag}</div>
        </div>
        <Link href="/profile" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "8px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", textDecoration: "none" }}>
          <Settings size={13} />
        </Link>
      </div>

      <style>{`
        @media (min-width: 769px) { .sidebar-close-btn { display: none !important; } }
      `}</style>
    </div>
  );
}
