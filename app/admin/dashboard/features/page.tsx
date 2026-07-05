"use client";
import { useState, useEffect } from "react";
import ListEditor from "@/components/admin/ListEditor";
import { fetchContent, defaultContent } from "@/lib/admin/store";

export default function FeaturesEditorPage() {
  const [items, setItems] = useState(defaultContent.features);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchContent().then(c => { setItems(c.features); setLoading(false); }); }, []);
  if (loading) return <div style={{ padding: "32px", color: "#6b6b8a", fontFamily: "inherit" }}>Memuat...</div>;
  return (
    <ListEditor
      title="Fitur" sectionKey="features" color="#f59e0b"
      description="Kartu fitur utama (maks. 6)"
      fields={[{ key: "icon", label: "Emoji Icon", placeholder: "⚡" }, { key: "title", label: "Judul Fitur" }, { key: "description", label: "Deskripsi", type: "textarea" }]}
      items={items} defaultItems={defaultContent.features} maxItems={6}
      newItemTemplate={{ icon: "", title: "", description: "" }}
      onSave={(v) => setItems(v as any)}
    />
  );
}
