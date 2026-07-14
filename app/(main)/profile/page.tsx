"use client";
import { useEffect, useState } from "react";
import { Copy, Check, LogOut, Edit2, Bell, Moon, Globe, ChevronRight, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { getInitial } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LANGUAGES = [
  "Indonesia", "English", "Español", "Português", "Français", "Deutsch",
  "Italiano", "Nederlands", "Русский", "Українська", "Polski", "Svenska",
  "中文 (简体)", "中文 (繁體)", "日本語", "한국어", "ภาษาไทย", "Tiếng Việt",
  "Bahasa Melayu", "العربية", "עברית", "فارسی", "हिन्दी", "বাংলা",
  "Türkçe", "Ελληνικά", "Filipino", "Kiswahili",
];

export default function ProfilePage() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [language, setLanguage] = useState("Indonesia");
  const [langSearch, setLangSearch] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("chatting-aja-language");
    if (saved) setLanguage(saved);
  }, []);

  function selectLanguage(lang: string) {
    setLanguage(lang);
    localStorage.setItem("chatting-aja-language", lang);
    setShowLangModal(false);
    setLangSearch("");
  }

  const filteredLanguages = LANGUAGES.filter(l => l.toLowerCase().includes(langSearch.toLowerCase()));

  const copyTag = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.unique_tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSaveUsername = async () => {
    if (!profile || !newUsername.trim()) return;
    setSaving(true);
    await supabase.from("profiles").update({ username: newUsername.trim() }).eq("id", profile.id);
    setSaving(false);
    setEditingUsername(false);
    router.refresh();
  };

  if (!profile) return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c7c8a" }}>
      Memuat...
    </div>
  );

  const settingsItems = [
    { icon: <Bell size={15} />, label: "Notifikasi", value: "Aktif", onClick: undefined },
    { icon: <Moon size={15} />, label: "Tema", value: "Gelap", onClick: undefined },
    { icon: <Globe size={15} />, label: "Bahasa", value: language, onClick: () => setShowLangModal(true) },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#0a0a10", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "20px 16px" }}>
        <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "#f5f5f7", marginBottom: "24px" }}>Profil</h1>

        {/* Profile card */}
        <div style={{ background: "#111116", border: "1px solid #2a2a35", borderRadius: "18px", padding: "20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <Avatar letter={getInitial(profile.username)} colorClass={profile.avatar_color} size="lg" />
          </div>
          <div style={{ flex: 1 }}>
            {editingUsername ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  autoFocus
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveUsername(); if (e.key === "Escape") setEditingUsername(false); }}
                  style={{ background: "#17171f", border: "1px solid #a855f7", borderRadius: "8px", padding: "6px 10px", color: "#f5f5f7", fontFamily: "inherit", fontWeight: 600, fontSize: "15px", outline: "none", flex: 1 }}
                />
                <button onClick={handleSaveUsername} disabled={saving} style={{ padding: "6px 12px", borderRadius: "8px", background: "#a855f7", border: "none", color: "white", fontFamily: "inherit", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  {saving ? "..." : "Simpan"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "17px", color: "#f5f5f7" }}>{profile.username}</div>
                <button onClick={() => { setNewUsername(profile.username); setEditingUsername(true); }} style={{ background: "none", border: "none", color: "#7c7c8a", cursor: "pointer", display: "flex", padding: "2px" }}>
                  <Edit2 size={13} />
                </button>
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#7c7c8a", marginTop: "2px" }}>
              Bergabung {new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Unique Tag */}
        <div style={{ background: "#111116", border: "1px dashed rgba(168,85,247,0.45)", borderRadius: "18px", padding: "20px", marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "#7c7c8a", marginBottom: "10px" }}>UNIQUE TAG KAMU</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
            <span style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "28px", color: "#d8b4fe", letterSpacing: "-0.5px" }}>
              {profile.unique_tag}
            </span>
            <button onClick={copyTag} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", cursor: "pointer",
              background: copied ? "rgba(79,255,176,0.12)" : "#17171f",
              border: copied ? "1px solid rgba(79,255,176,0.4)" : "1px solid #2a2a35",
              color: copied ? "#22c55e" : "#7c7c8a",
              fontSize: "12px", fontFamily: "inherit", fontWeight: 600, flexShrink: 0,
            }}>
              {copied ? <><Check size={13} /> Disalin!</> : <><Copy size={13} /> Salin</>}
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#7c7c8a", lineHeight: "1.6" }}>
            Bagikan tag ini ke teman biar mereka bisa nemuin kamu. Tag bersifat permanen.
          </p>
        </div>

        {/* Settings */}
        <div style={{ background: "#111116", border: "1px solid #2a2a35", borderRadius: "18px", overflow: "hidden", marginBottom: "12px" }}>
          {settingsItems.map((item, i) => (
            <div key={item.label} onClick={item.onClick} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px",
              borderBottom: i < settingsItems.length - 1 ? "1px solid #2a2a35" : "none",
              cursor: item.onClick ? "pointer" : "default", transition: "background 0.15s",
            }}
              onMouseEnter={e => { if (item.onClick) e.currentTarget.style.background = "#17171f"; }}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "#17171f", border: "1px solid #2a2a35", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c7c8a" }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: "14px", color: "#f5f5f7" }}>{item.label}</span>
              <span style={{ fontSize: "13px", color: "#7c7c8a", marginRight: "6px" }}>{item.value}</span>
              <ChevronRight size={14} color="#7c7c8a" />
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "rgba(255,92,92,0.08)", border: "1px solid rgba(255,92,92,0.3)", color: "#ff5c5c", fontFamily: "inherit", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,92,92,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,92,92,0.08)"}>
          <LogOut size={16} /> Keluar
        </button>
      </div>

      {/* Language picker modal */}
      {showLangModal && (
        <div onClick={() => setShowLangModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#111116", border: "1px solid #2a2a35", borderRadius: "18px",
            width: "100%", maxWidth: "360px", maxHeight: "70vh", display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #2a2a35", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "15px", color: "#f5f5f7" }}>Pilih Bahasa</span>
              <button onClick={() => setShowLangModal(false)} style={{ background: "none", border: "none", color: "#7c7c8a", cursor: "pointer", display: "flex" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <input
                autoFocus
                placeholder="Cari bahasa..."
                value={langSearch}
                onChange={e => setLangSearch(e.target.value)}
                style={{ width: "100%", background: "#17171f", border: "1px solid #2a2a35", borderRadius: "10px", padding: "9px 12px", color: "#f5f5f7", fontFamily: "inherit", fontSize: "13px", outline: "none" }}
              />
            </div>
            <div style={{ overflowY: "auto", padding: "4px 8px 10px" }}>
              {filteredLanguages.map(lang => (
                <div key={lang} onClick={() => selectLanguage(lang)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px",
                  color: lang === language ? "#d8b4fe" : "#f5f5f7",
                  background: lang === language ? "rgba(168,85,247,0.1)" : "transparent",
                }}
                  onMouseEnter={e => { if (lang !== language) e.currentTarget.style.background = "#17171f"; }}
                  onMouseLeave={e => { if (lang !== language) e.currentTarget.style.background = "transparent"; }}>
                  {lang}
                  {lang === language && <Check size={14} color="#a855f7" />}
                </div>
              ))}
              {filteredLanguages.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#7c7c8a" }}>Tidak ditemukan</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
