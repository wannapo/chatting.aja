"use client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function ChatDefaultPage() {
  const { t } = useTranslation();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "var(--bg)", fontFamily: "inherit", padding: "24px" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageSquare size={26} color="var(--muted)" />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "16px", color: "var(--text)", marginBottom: "6px" }}>{t("chat_select_title")}</h2>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>{t("chat_select_desc")}</p>
      </div>
      <Link href="/find" style={{ marginTop: "8px", padding: "10px 24px", borderRadius: "12px", background: "var(--bubble-mine)", color: "var(--bubble-mine-text)", fontFamily: "inherit", fontWeight: 700, fontSize: "13px", textDecoration: "none", boxShadow: "0 4px 16px rgba(168,85,247,0.25)" }}>
        {t("btn_find_user_cta")}
      </Link>
    </div>
  );
}
