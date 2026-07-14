"use client";
import Link from "next/link";
import { MessageSquare, Users, BellDot, Hash } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConversations } from "@/lib/hooks/useConversations";
import { isOnline, getInitial } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";

export default function HomePage() {
  const { profile } = useAuth();
  const { conversations, loading } = useConversations(profile?.id || "");

  const totalChats = conversations.length;
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const onlineFriends = conversations.filter(c => isOnline(c.contact.last_seen));
  const recentChats = [...conversations].slice(0, 5);

  const stats = [
    { icon: <MessageSquare size={16} />, label: "TOTAL_PIPELINES", value: totalChats },
    { icon: <Users size={16} />, label: "NODES_ONLINE", value: onlineFriends.length },
    { icon: <BellDot size={16} />, label: "UNREAD_PACKETS", value: totalUnread },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#0a0a10", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "#f5f5f7", marginBottom: "4px" }}>
          Halo, {profile?.username || "..."} 👋
        </h1>
        <p className="mono" style={{ fontSize: "11px", color: "#55555f", letterSpacing: "0.5px", marginBottom: "24px" }}>
          NODE_ID: {profile?.unique_tag || "..."}
        </p>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "#111116", border: "1px solid #2a2a35", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a855f7", marginBottom: "10px" }}>
                {s.icon}
                <span className="mono" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", color: "#7c7c8a" }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "26px", color: "#f5f5f7" }}>
                {loading ? "—" : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          <Link href="/find" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 18px", borderRadius: "12px", background: "linear-gradient(135deg,#a855f7,#d946ef)", color: "white", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
            <Hash size={14} /> Cari teman baru
          </Link>
          <Link href="/chat" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 18px", borderRadius: "12px", background: "#111116", border: "1px solid #2a2a35", color: "#f5f5f7", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
            <MessageSquare size={14} /> Buka semua chat
          </Link>
        </div>

        {/* Recent chats */}
        <div className="mono" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "1px", color: "#55555f", marginBottom: "10px" }}>
          RECENT_ACTIVITY
        </div>
        <div style={{ background: "#111116", border: "1px solid #2a2a35", borderRadius: "16px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#7c7c8a", fontSize: "13px" }}>Memuat...</div>
          ) : recentChats.length === 0 ? (
            <div style={{ padding: "28px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: "#7c7c8a", marginBottom: "10px" }}>Belum ada percakapan.</div>
              <Link href="/find" style={{ fontSize: "12px", color: "#a855f7", textDecoration: "none" }}>+ Cari teman lewat Unique Tag</Link>
            </div>
          ) : recentChats.map((c, i) => (
            <Link key={c.id} href={`/chat/${c.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                borderBottom: i < recentChats.length - 1 ? "1px solid #2a2a35" : "none",
              }}>
                <Avatar letter={getInitial(c.contact.username)} colorClass={c.contact.avatar_color} size="sm" online={isOnline(c.contact.last_seen)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#f5f5f7" }}>{c.contact.username}</div>
                  <div style={{ fontSize: "12px", color: "#7c7c8a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.last_message || "Uplink established..."}</div>
                </div>
                {c.unread > 0 && (
                  <span style={{ background: "#ec4899", color: "white", fontSize: "10px", fontWeight: 700, borderRadius: "6px", padding: "2px 6px", flexShrink: 0 }}>{c.unread}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
