"use client";
import { useState, useEffect } from "react";
import SectionEditor from "@/components/admin/SectionEditor";
import { fetchContent, defaultContent } from "@/lib/admin/store";

export default function HeroEditorPage() {
  const [vals, setVals] = useState(defaultContent.hero);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchContent().then(c => { setVals(c.hero); setLoading(false); }); }, []);
  if (loading) return <div style={{ padding: "32px", color: "#6b6b8a", fontFamily: "inherit" }}>Memuat...</div>;
  return (
    <SectionEditor
      title="Hero Section" sectionKey="hero" color="#6366f1"
      description="Bagian utama yang pertama dilihat pengunjung landing page"
      fields={[
        { key: "badge", label: "Badge Text", placeholder: "MVP V1.0 — Sekarang tersedia" },
        { key: "title", label: "Judul Utama", placeholder: "Chat cepat," },
        { key: "titleItalic", label: "Judul Italic (lanjutan)", type: "textarea", placeholder: "privasi rapat,\ntanpa ribet." },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "btnPrimary", label: "Teks Tombol Utama" },
        { key: "btnSecondary", label: "Teks Tombol Kedua" },
      ]}
      values={vals as any}
      defaultValues={defaultContent.hero as any}
      onSave={(v) => setVals(v as any)}
    />
  );
}
