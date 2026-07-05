"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Settings } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { dummyUser, dummyContacts, dummyConversations } from "@/lib/dummy-data";

export default function Sidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"online"|"unread">("all");

  const filtered = dummyConversations.filter(conv => {
    const contact = dummyContacts.find(c => c.id === conv.contactId)!;
    const matchSearch = contact.username.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "online") return contact.online;
    if (filter === "unread") return conv.unread > 0;
    return true;
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ padding:"18px 16px 12px", borderBottom:"1px solid #2a2a35" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
          <span style={{ fontFamily: "inherit", fontWeight:800, fontSize:"20px", color:"#a855f7" }}>chatting.aja</span>
        </div>
        {/* Search */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#17171f", border:"1px solid #2a2a35", borderRadius:"12px", padding:"8px 12px" }}>
          <Search size={13} color="#7c7c8a" />
          <input
            placeholder="Cari percakapan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex:1, background:"none", border:"none", outline:"none", color:"#f5f5f7", fontSize:"13px", fontFamily:"inherit" }}
          />
        </div>
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:"4px", padding:"10px 12px", borderBottom:"1px solid #2a2a35" }}>
        {(["all","online","unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex:1, padding:"6px 4px", borderRadius:"8px", border: filter===f ? "1px solid #2a2a35" : "1px solid transparent",
            background: filter===f ? "#17171f" : "none", color: filter===f ? "#f5f5f7" : "#7c7c8a",
            fontSize:"11px", fontWeight:500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s"
          }}>
            {f==="all"?"Semua":f==="online"?"Online":"Belum dibaca"}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:"auto", padding:"8px" }}>
        {filtered.map(conv => {
          const contact = dummyContacts.find(c => c.id === conv.contactId)!;
          const isActive = pathname === `/chat/${conv.id}`;
          return (
            <Link key={conv.id} href={`/chat/${conv.id}`} style={{ textDecoration:"none" }}>
              <div style={{
                display:"flex", alignItems:"center", gap:"10px", padding:"10px 10px",
                borderRadius:"14px", marginBottom:"2px", cursor:"pointer", transition:"all 0.15s",
                background: isActive ? "#17171f" : "transparent",
                border: isActive ? "1px solid #2a2a35" : "1px solid transparent",
              }}>
                <Avatar letter={contact.avatar} colorClass={contact.avatarColor} size="md" online={contact.online} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily: "inherit", fontWeight:600, fontSize:"13px", color:"#f5f5f7", marginBottom:"2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {contact.username}
                  </div>
                  <div style={{ fontSize:"12px", color:"#7c7c8a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {conv.lastMessage}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px", flexShrink:0 }}>
                  <span style={{ fontSize:"11px", color:"#7c7c8a" }}>{conv.lastTime}</span>
                  {conv.unread > 0 && (
                    <span style={{ background:"#a855f7", color:"white", fontSize:"10px", fontWeight:700, borderRadius:"6px", padding:"2px 6px", minWidth:"18px", textAlign:"center" }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:"12px 14px", borderTop:"1px solid #2a2a35", display:"flex", alignItems:"center", gap:"10px" }}>
        <Link href="/profile" style={{ textDecoration:"none", flexShrink:0 }}>
          <Avatar letter={dummyUser.avatar} colorClass={dummyUser.avatarColor} size="sm" />
        </Link>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily: "inherit", fontWeight:600, fontSize:"13px", color:"#f5f5f7", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{dummyUser.username}</div>
          <div style={{ fontSize:"11px", color:"#a855f7" }}>{dummyUser.unique_tag}</div>
        </div>
        <Link href="/profile" style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"30px", height:"30px", borderRadius:"8px", background:"#17171f", border:"1px solid #2a2a35", color:"#7c7c8a", textDecoration:"none" }}>
          <Settings size={13} />
        </Link>
      </div>
    </div>
  );
}
