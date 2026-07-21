"use client";
import { useState } from "react";
import { Copy, Check, LogOut, Edit2, Bell, Moon, Sun, Globe, ChevronRight, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { useTranslation, LANGUAGES } from "@/lib/i18n";
import { getInitial } from "@/lib/types";
import { removeFcmTokenOnLogout } from "@/lib/hooks/useFcmToken";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const supabase = createClient();
  const router = useRouter();

  function selectLanguage(code: string) {
    setLang(code);
    setShowLangModal(false);
    setLangSearch("");
  }

  const currentLanguageName = LANGUAGES.find(l => l.code === lang)?.name || "Indonesia";
  const filteredLanguages = LANGUAGES.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase()));

  const copyTag = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.unique_tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await removeFcmTokenOnLogout(); // hapus token FCM dulu SEBELUM signOut
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
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
      {t("loading")}
    </div>
  );

  const settingsItems = [
    { icon: <Bell size={15} />, label: t("settings_notifications"), value: t("settings_notifications_value"), onClick: undefined },
    { icon: <Moon size={15} />, label: t("settings_theme"), value: theme === "light" ? t("settings_theme_light") : t("settings_theme_dark"), onClick: () => setShowThemeModal(true) },
    { icon: <Globe size={15} />, label: t("settings_language"), value: currentLanguageName, onClick: () => setShowLangModal(true) },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg)", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "20px 16px" }}>
        <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "var(--text)", marginBottom: "24px" }}>{t("page_title_profile")}</h1>

        {/* Profile card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "18px", padding: "20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "14px" }}>
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
                  style={{ background: "var(--surface2)", border: "1px solid var(--accent)", borderRadius: "8px", padding: "6px 10px", color: "var(--text)", fontFamily: "inherit", fontWeight: 600, fontSize: "15px", outline: "none", flex: 1 }}
                />
                <button onClick={handleSaveUsername} disabled={saving} style={{ padding: "6px 12px", borderRadius: "8px", background: "var(--accent)", border: "none", color: "white", fontFamily: "inherit", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  {saving ? "..." : t("btn_save")}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "17px", color: "var(--text)" }}>{profile.username}</div>
                <button onClick={() => { setNewUsername(profile.username); setEditingUsername(true); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", padding: "2px" }}>
                  <Edit2 size={13} />
                </button>
              </div>
            )}
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
              {t("joined_prefix")} {new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Unique Tag */}
        <div style={{ background: "var(--surface)", border: "1px dashed color-mix(in srgb, var(--accent) 45%, transparent)", borderRadius: "18px", padding: "20px", marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--muted)", marginBottom: "10px" }}>{t("unique_tag_label")}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
            <span style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "28px", color: "var(--accent)", letterSpacing: "-0.5px" }}>
              {profile.unique_tag}
            </span>
            <button onClick={copyTag} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", cursor: "pointer",
              background: copied ? "color-mix(in srgb, var(--green) 12%, transparent)" : "var(--surface2)",
              border: copied ? "1px solid color-mix(in srgb, var(--green) 40%, transparent)" : "1px solid var(--border)",
              color: copied ? "var(--green)" : "var(--muted)",
              fontSize: "12px", fontFamily: "inherit", fontWeight: 600, flexShrink: 0,
            }}>
              {copied ? <><Check size={13} /> {t("btn_copied")}</> : <><Copy size={13} /> {t("btn_copy")}</>}
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.6" }}>
            {t("unique_tag_desc")}
          </p>
        </div>

        {/* Settings */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "18px", overflow: "hidden", marginBottom: "12px" }}>
          {settingsItems.map((item, i) => (
            <div key={item.label} onClick={item.onClick} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px",
              borderBottom: i < settingsItems.length - 1 ? "1px solid var(--border)" : "none",
              cursor: item.onClick ? "pointer" : "default", transition: "background 0.15s",
            }}
              onMouseEnter={e => { if (item.onClick) e.currentTarget.style.background = "var(--surface2)"; }}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: "14px", color: "var(--text)" }}>{item.label}</span>
              <span style={{ fontSize: "13px", color: "var(--muted)", marginRight: "6px" }}>{item.value}</span>
              <ChevronRight size={14} color="var(--muted)" />
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "color-mix(in srgb, var(--red) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)", color: "var(--red)", fontFamily: "inherit", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--red) 15%, transparent)"}
          onMouseLeave={e => e.currentTarget.style.background = "color-mix(in srgb, var(--red) 8%, transparent)"}>
          <LogOut size={16} /> {t("btn_logout")}
        </button>
      </div>

      {/* Language picker modal */}
      {showLangModal && (
        <div onClick={() => setShowLangModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "18px",
            width: "100%", maxWidth: "360px", maxHeight: "70vh", display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>{t("modal_choose_language")}</span>
              <button onClick={() => setShowLangModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <input
                autoFocus
                placeholder={t("search_language_placeholder")}
                value={langSearch}
                onChange={e => setLangSearch(e.target.value)}
                style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "9px 12px", color: "var(--text)", fontFamily: "inherit", fontSize: "13px", outline: "none" }}
              />
            </div>
            <div style={{ overflowY: "auto", padding: "4px 8px 10px" }}>
              {filteredLanguages.map(l => (
                <div key={l.code} onClick={() => selectLanguage(l.code)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px",
                  color: l.code === lang ? "var(--accent)" : "var(--text)",
                  background: l.code === lang ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                }}
                  onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = "var(--surface2)"; }}
                  onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}>
                  {l.name}
                  {l.code === lang && <Check size={14} color="var(--accent)" />}
                </div>
              ))}
              {filteredLanguages.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>{t("lang_not_found")}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theme picker modal */}
      {showThemeModal && (
        <div onClick={() => setShowThemeModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "18px",
            width: "100%", maxWidth: "340px", overflow: "hidden",
          }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>{t("modal_choose_theme")}</span>
              <button onClick={() => setShowThemeModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "8px" }}>
              {([
                { key: "dark" as const, label: t("settings_theme_dark"), desc: t("theme_dark_desc"), icon: <Moon size={16} /> },
                { key: "light" as const, label: t("settings_theme_light"), desc: t("theme_light_desc"), icon: <Sun size={16} /> },
              ]).map(opt => (
                <div key={opt.key} onClick={() => { setTheme(opt.key); setShowThemeModal(false); }} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px", borderRadius: "12px", cursor: "pointer", marginBottom: "4px",
                  color: theme === opt.key ? "var(--accent)" : "var(--text)",
                  background: theme === opt.key ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                }}
                  onMouseEnter={e => { if (theme !== opt.key) e.currentTarget.style.background = "var(--surface2)"; }}
                  onMouseLeave={e => { if (theme !== opt.key) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {opt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{opt.label}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{opt.desc}</div>
                  </div>
                  {theme === opt.key && <Check size={16} color="var(--accent)" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
