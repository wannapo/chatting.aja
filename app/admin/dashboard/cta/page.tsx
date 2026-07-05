"use client";
import { useState, useEffect } from "react";
import SectionEditor from "@/components/admin/SectionEditor";
import { fetchContent, defaultContent } from "@/lib/admin/store";

export default function CtaEditorPage() {
  const [vals, setVals] = useState(defaultContent.cta);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchContent().then(c => { setVals(c.cta); setLoading(false); }); }, []);
  if (loading) return <div style={{ padding: "32px", color: "#6b6b8a", fontFamily: "inherit" }}>Memuat...</div>;
  return (
    <SectionEditor
      title="CTA Section" sectionKey="cta" color="#a855f7"
      description="Ajakan bertindak di bagian bawah landing page"
      fields={[
        { key: "title", label: "Judul" },
        { key: "titleItalic", label: "Judul Italic" },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "btnPrimary", label: "Teks Tombol Utama" },
        { key: "btnSecondary", label: "Teks Tombol Kedua" },
      ]}
      values={vals as any} defaultValues={defaultContent.cta as any}
      onSave={(v) => setVals(v as any)}
    />
  );
}
