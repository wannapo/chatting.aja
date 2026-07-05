"use client";
import { useState, useEffect } from "react";
import SectionEditor from "@/components/admin/SectionEditor";
import { fetchContent, defaultContent } from "@/lib/admin/store";

export default function UidEditorPage() {
  const [vals, setVals] = useState(defaultContent.uid);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchContent().then(c => { setVals(c.uid); setLoading(false); }); }, []);
  if (loading) return <div style={{ padding: "32px", color: "#6b6b8a", fontFamily: "inherit" }}>Memuat...</div>;
  return (
    <SectionEditor
      title="Unique Tag Section" sectionKey="uid" color="#ec4899"
      description="Section yang menjelaskan sistem Unique Tag"
      fields={[
        { key: "title", label: "Judul", type: "textarea", placeholder: "Satu tag,\ncukup buat" },
        { key: "titleItalic", label: "Judul Italic", placeholder: "ditemukan." },
        { key: "description", label: "Deskripsi", type: "textarea" },
      ]}
      values={vals as any} defaultValues={defaultContent.uid as any}
      onSave={(v) => setVals(v as any)}
    />
  );
}
