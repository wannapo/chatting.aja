"use client";
import { useState, useEffect } from "react";
import SectionEditor from "@/components/admin/SectionEditor";
import { fetchContent, defaultContent } from "@/lib/admin/store";

export default function PrivacyEditorPage() {
  const [vals, setVals] = useState(defaultContent.privacy);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchContent().then(c => { setVals(c.privacy); setLoading(false); }); }, []);
  if (loading) return <div style={{ padding: "32px", color: "#6b6b8a", fontFamily: "inherit" }}>Memuat...</div>;
  return (
    <SectionEditor
      title="Privasi Section" sectionKey="privacy" color="#8b5cf6"
      description="Section privasi aplikasi"
      fields={[
        { key: "title", label: "Judul", type: "textarea" },
        { key: "description", label: "Deskripsi", type: "textarea" },
      ]}
      values={vals as any} defaultValues={defaultContent.privacy as any}
      onSave={(v) => setVals(v as any)}
    />
  );
}
