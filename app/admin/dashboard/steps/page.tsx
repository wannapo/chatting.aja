"use client";
import { useState, useEffect } from "react";
import ListEditor from "@/components/admin/ListEditor";
import { fetchContent, defaultContent } from "@/lib/admin/store";

export default function StepsEditorPage() {
  const [items, setItems] = useState(defaultContent.steps);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchContent().then(c => { setItems(c.steps); setLoading(false); }); }, []);
  if (loading) return <div style={{ padding: "32px", color: "#6b6b8a", fontFamily: "inherit" }}>Memuat...</div>;
  return (
    <ListEditor
      title="Cara Kerja" sectionKey="steps" color="#10b981"
      description="Langkah cara kerja aplikasi (maks. 4)"
      fields={[{ key: "icon", label: "Emoji Icon", placeholder: "✉️" }, { key: "title", label: "Judul" }, { key: "description", label: "Deskripsi", type: "textarea" }]}
      items={items} defaultItems={defaultContent.steps} maxItems={4}
      newItemTemplate={{ icon: "", title: "", description: "" }}
      onSave={(v) => setItems(v as any)}
    />
  );
}
