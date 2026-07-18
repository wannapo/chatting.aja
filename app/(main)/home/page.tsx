"use client";
import Link from "next/link";
import { MessageSquare, Users, BellDot, Hash } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConversations } from "@/lib/hooks/useConversations";
import { isOnline, getInitial } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { conversations, loading } = useConversations(profile?.id || "");


  const totalChats = conversations.length;
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const onlineFriends = conversations.filter(c => isOnline(c.contact.last_seen));
  const recentChats = [...conversations].slice(0, 5);

  const stats = [
    { icon: <MessageSquare size={16} />, label: t("stat_total_chat"), value: totalChats },
    { icon: <Users size={16} />, label: t("stat_online_friends"), value: onlineFriends.length },
    { icon: <BellDot size={16} />, label: t("stat_unread"), value: totalUnread },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg)", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "var(--text)", marginBottom: "4px" }}>
          {t("greeting_hello")}, {profile?.username || "..."} 👋
        </h1>
        <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "24px" }}>
          ID: {profile?.unique_tag || "..."}
        </p>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent)", marginBottom: "10px" }}>
                {s.icon}
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)" }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "26px", color: "var(--text)" }}>
                {loading ? "—" : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          <Link href="/find" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 18px", borderRadius: "12px", background: "var(--bubble-mine)", color: "white", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
            <Hash size={14} /> {t("action_find_friend")}
          </Link>
          <Link href="/chat" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 18px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
            <MessageSquare size={14} /> {t("action_open_chats")}
          </Link>
        </div>

        {/* Recent chats */}
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", marginBottom: "10px" }}>
          {t("section_recent")}
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>{t("loading")}</div>
          ) : recentChats.length === 0 ? (
            <div style={{ padding: "28px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "10px" }}>{t("empty_conversations_home")}</div>
              <Link href="/find" style={{ fontSize: "12px", color: "var(--accent)", textDecoration: "none" }}>{t("link_find_tag")}</Link>
            </div>
          ) : recentChats.map((c, i) => (
            <Link key={c.id} href={`/chat/${c.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                borderBottom: i < recentChats.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <Avatar letter={getInitial(c.contact.username)} colorClass={c.contact.avatar_color} size="sm" online={isOnline(c.contact.last_seen)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>{c.contact.username}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.last_message || t("last_message_placeholder")}</div>
                </div>
                {c.unread > 0 && (
                  <span style={{ background: "var(--pink)", color: "white", fontSize: "10px", fontWeight: 700, borderRadius: "6px", padding: "2px 6px", flexShrink: 0 }}>{c.unread}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
