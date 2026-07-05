"use client";
import { useState, useEffect } from "react";
import ListEditor from "@/components/admin/ListEditor";
import { fetchContent, defaultContent } from "@/lib/admin/store";

export default function StatsEditorPage() {
  const [items, setItems] = useState(defaultContent.stats);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchContent().then(c => { setItems(c.stats); setLoading(false); }); }, []);
  if (loading) return <div style={{ padding: "32px", color: "#6b6b8a", fontFamily: "inherit" }}>Memuat...</div>;
  return (
    <ListEditor
      title="Stats Bar" sectionKey="stats" color="#06b6d4"
      description="Angka statistik di bawah hero section"
      fields={[{ key: "value", label: "Nilai", placeholder: "0ms" }, { key: "label", label: "Keterangan", placeholder: "Latensi rata-rata" }]}
      items={items} defaultItems={defaultContent.stats} maxItems={6}
      newItemTemplate={{ value: "", label: "" }}
      onSave={(v) => setItems(v as any)}
    />
  );
}
