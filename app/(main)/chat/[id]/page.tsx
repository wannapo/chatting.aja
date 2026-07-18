"use client";
import { useState, useRef, useEffect, use } from "react";
import { Send, Smile, ArrowLeft, Search } from "lucide-react"; // Import 'Search', 'MoreVertical' dihapus
import Avatar from "@/components/ui/Avatar";
import { useMessages } from "@/lib/hooks/useMessages";
import { createClient } from "@/lib/supabase/client";
import { isOnline, formatLastSeen, getInitial } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [contact, setContact] = useState<Profile | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const { messages, loading, sendMessage } = useMessages(id);

  // --- STATUS BARU ---
  const [isSearching, setIsSearching] = useState(false); // Mengontrol tampilan pencarian di header
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Mengontrol tampilan pemilih emoji
  // -------------------

  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      setLoadingContact(true);
      setNotFound(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setLoadingContact(false); return; }
      const { data: myProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (cancelled) return;
      setCurrentUser(myProfile);
      const { data: members, error: membersError } = await supabase
        .from("conversation_members").select("user_id").eq("conversation_id", id).neq("user_id", user.id).limit(1);
      if (cancelled) return;
      if (membersError || !members || members.length === 0) {
        setNotFound(true);
        setLoadingContact(false);
        return;
      }
      const { data: contactProfile } = await supabase.from("profiles").select("*").eq("id", members[0].user_id).single();
      if (cancelled) return;
      if (contactProfile) setContact(contactProfile); else setNotFound(true);
      setLoadingContact(false);
    }
    loadUsers();
    return () => { cancelled = true; };
  }, [id, supabase]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;
    const ok = await sendMessage(input, currentUser.id);
    if (ok) setInput("");
  };

  // Sisipkan emoji ke input dan tutup pemilih emoji
  const onEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (loadingContact || !currentUser) return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "inherit" }}>
      {t("loading")}
    </div>
  );

  if (!contact || notFound) return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "inherit" }}>
      {t("not_found")}
    </div>
  );

  const online = isOnline(contact.last_seen);

  return (
    <>
      <style>{`
        .chat-room {
          height: 100%;
          display: flex;
          flex-direction: column;
          
          overflow: hidden;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--bg);
          min-height: 0;
        }
        .chat-input-area {
          padding: 10px 14px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          flex-shrink: 0;
          position: relative; /* Diperlukan untuk penempatan pemilih emoji */
        }
        @media (max-width: 768px) {
          .chat-messages { padding: 12px 14px; }
          .chat-input-area { padding: 8px 12px; }
          .chat-header-title { font-size: 14px !important; }
          .chat-header-status { font-size: 11px !important; }
          .back-btn { display: flex !important; }
          /* Tombol search diheader diaktifkan untuk ponsel */
          .search-btn { display: flex !important; } 
        }
        @media (min-width: 769px) { .back-btn { display: none !important; } }
      `}</style>

      <div className="chat-room">
        {/* Header - Berubah untuk menampilkan pencarian */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, background: "var(--surface)" }}>
          {isSearching ? (
            <>
              <button
                onClick={() => setIsSearching(false)} // Tutup mode pencarian
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px" }}
              >
                <ArrowLeft size={18} />
              </button>
              <input
                type="text"
                placeholder={t("search_in_chat_placeholder")}
                style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 10px", color: "var(--text)", fontSize: "14px", outline: "none" }}
              />
            </>
          ) : (
            <>
              <button className="back-btn" onClick={() => router.push("/chat")}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px", display: "none", alignItems: "center" }}>
                <ArrowLeft size={18} />
              </button>
              <Avatar letter={getInitial(contact.username)} colorClass={contact.avatar_color} size="md" online={online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="chat-header-title" style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "15px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contact.username}</div>
                <div className="chat-header-status" style={{ fontSize: "10px", display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
                  {online
                    ? <><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", display: "inline-block" }} /><span style={{ color: "var(--green)", fontSize: "11px" }}>{t("status_online")}</span></>
                    : <span style={{ color: "var(--muted)", fontSize: "11px" }}>{t("status_active_prefix")} {formatLastSeen(contact.last_seen)}</span>}
                </div>
              </div>
              {/* Tombol Search yang fungsional di header */}
              <button
                className="search-btn"
                onClick={() => setIsSearching(true)} // Buka mode pencarian
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                <Search size={15} />
              </button>
              {/* Tombol MoreVertical statis telah dihapus */}
            </>
          )}
        </div>

        {/* Area Pesan (Tidak berubah) */}
        <div className="chat-messages">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0 14px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--muted)", padding: "3px 10px", background: "var(--surface)", borderRadius: "20px", border: "1px solid var(--border)", whiteSpace: "nowrap" }}>
              {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "13px", marginTop: "20px" }}>{t("loading")}</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>👋</div>
              <div style={{ fontSize: "14px", color: "var(--muted)" }}>{t("start_chat_with")} <strong style={{ color: "var(--text)" }}>{contact.username}</strong></div>
            </div>
          ) : messages.map((msg, i) => {
            const isMine = msg.sender_id === currentUser.id;
            const prevSame = i > 0 && messages[i-1].sender_id === msg.sender_id;
            const nextSame = i < messages.length-1 && messages[i+1].sender_id === msg.sender_id;
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", gap: "6px", marginBottom: nextSame ? "2px" : "10px", marginTop: prevSame ? "0" : "4px" }}>
                {!isMine && (
                  <div style={{ width: "28px", flexShrink: 0 }}>
                    {!prevSame && <Avatar letter={getInitial(contact.username)} colorClass={contact.avatar_color} size="sm" />}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "72%", alignItems: isMine ? "flex-end" : "flex-start" }}>
                  <div style={{ padding: "9px 13px", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: "14px", lineHeight: "1.55", wordBreak: "break-word", background: isMine ? "var(--bubble-mine)" : "var(--bubble-other)", border: isMine ? "1px solid transparent" : "1px solid var(--border)", color: isMine ? "var(--bubble-mine-text)" : "var(--bubble-other-text)" }}>
                    {msg.content}
                  </div>
                  {!nextSame && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "0 4px" }}>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                        {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isMine && <span style={{ fontSize: "11px", color: msg.is_read ? "var(--pink)" : "var(--muted)" }}>✓✓</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input - Tombol Emoji Fungsional dan Pemilih Emoji Sederhana */}
        <div className="chat-input-area">
          {/* Panel Pemilih Emoji Sederhana (kondisional) */}
          {showEmojiPicker && (
            <div style={{
              position: "absolute",
              bottom: "100%", // Tampilkan di atas area input
              left: "14px", // Sejajar tombol emoji
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "10px",
              display: "flex",
              gap: "8px",
              fontSize: "20px",
              zIndex: 10,
              boxShadow: "0 -4px 10px rgba(0,0,0,0.15)"
            }}>
              {["😀", "😂", "🥰", "👍", "🔥", "🙏", "👀"].map(emoji => (
                <span
                  key={emoji}
                  onClick={() => onEmojiClick(emoji)} // Sisipkan emoji saat diklik
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
          {/* Tombol Emoji dengan handler klik */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} // Buka/tutup pemilih emoji
            style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px", display: "flex", flexShrink: 0 }}
          >
            <Smile size={18} />
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "9px 12px", minWidth: 0 }}>
            <input
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: "14px", fontFamily: "inherit", minWidth: 0 }}
              placeholder={t("msg_input_placeholder")}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
          </div>
          <button onClick={handleSend}
            style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--bubble-mine)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}