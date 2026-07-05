"use client";
import { useState } from "react";
import { Save, RotateCcw, Check, Plus, Trash2, AlertCircle } from "lucide-react";
import { saveSectionToSupabase } from "@/lib/admin/store";

interface Item { [key: string]: string }
interface Props {
  title: string; description?: string; sectionKey: string;
  items: Item[]; defaultItems: Item[];
  fields: { key: string; label: string; type?: "text" | "textarea"; placeholder?: string }[];
  onSave: (items: Item[]) => void;
  color?: string; maxItems?: number; newItemTemplate: Item;
}

export default function ListEditor({ title, description, sectionKey, items, defaultItems, fields, onSave, color = "#6366f1", maxItems = 6, newItemTemplate }: Props) {
  const [local, setLocal] = useState<Item[]>(items)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const handleSave = async () => {
    setStatus("saving")
    const ok = await saveSectionToSupabase(sectionKey, local)
    if (ok) { onSave(local); setStatus("saved"); setTimeout(() => setStatus("idle"), 2500) }
    else { setStatus("error"); setTimeout(() => setStatus("idle"), 3000) }
  }

  const handleReset = async () => {
    setStatus("saving")
    const ok = await saveSectionToSupabase(sectionKey, defaultItems)
    if (ok) { setLocal(defaultItems); onSave(defaultItems); setStatus("saved"); setTimeout(() => setStatus("idle"), 2500) }
    else { setStatus("error"); setTimeout(() => setStatus("idle"), 3000) }
  }

  const updateItem = (i: number, key: string, val: string) =>
    setLocal(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item))
  const removeItem = (i: number) => setLocal(prev => prev.filter((_, idx) => idx !== i))
  const addItem = () => { if (local.length < maxItems) setLocal(prev => [...prev, { ...newItemTemplate }]) }

  const inp: React.CSSProperties = { width: "100%", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: "10px", padding: "10px 14px", color: "#e8e8f0", fontSize: "13px", fontFamily: "inherit", outline: "none" }

  return (
    <div style={{ padding: "32px", maxWidth: "720px", fontFamily: "inherit" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "4px", height: "22px", borderRadius: "2px", background: `linear-gradient(${color},${color}99)` }} />
          <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "#e8e8f0" }}>{title}</h1>
        </div>
        {description && <p style={{ fontSize: "13px", color: "#6b6b8a", marginLeft: "14px" }}>{description}</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {local.map((item, i) => (
          <div key={i} style={{ background: "#161625", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontFamily: "inherit", fontWeight: 600, fontSize: "13px", color }}>Item {i + 1}</span>
              <button onClick={() => removeItem(i)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "5px 8px", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                <Trash2 size={12} /> Hapus
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {fields.map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "#6b6b8a", marginBottom: "6px" }}>{f.label.toUpperCase()}</label>
                  {f.type === "textarea"
                    ? <textarea value={item[f.key] ?? ""} onChange={e => updateItem(i, f.key, e.target.value)} placeholder={f.placeholder} rows={3} style={{ ...inp, resize: "vertical", lineHeight: "1.6" }} className="list-field" />
                    : <input type="text" value={item[f.key] ?? ""} onChange={e => updateItem(i, f.key, e.target.value)} placeholder={f.placeholder} style={inp} className="list-field" />
                  }
                </div>
              ))}
            </div>
          </div>
        ))}

        {local.length < maxItems && (
          <button onClick={addItem} style={{ padding: "14px", borderRadius: "14px", background: "transparent", border: `1px dashed ${color}44`, color, fontFamily: "inherit", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            onMouseEnter={e => e.currentTarget.style.background = `${color}0f`}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Plus size={15} /> Tambah Item
          </button>
        )}
      </div>

      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", marginBottom: "14px", color: "#f87171", fontSize: "13px" }}>
          <AlertCircle size={14} /> Gagal menyimpan. Cek koneksi dan coba lagi.
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={handleSave} disabled={status === "saving"} style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "11px 24px", borderRadius: "12px",
          background: status === "saved" ? "rgba(16,185,129,0.15)" : `linear-gradient(135deg,${color},${color}cc)`,
          border: status === "saved" ? "1px solid rgba(16,185,129,0.4)" : "none",
          color: status === "saved" ? "#34d399" : "white",
          fontFamily: "inherit", fontWeight: 700, fontSize: "14px",
          cursor: status === "saving" ? "wait" : "pointer", opacity: status === "saving" ? 0.7 : 1,
          boxShadow: status === "saved" ? "none" : `0 4px 16px ${color}44`,
        }}>
          {status === "saving" ? "Menyimpan..." : status === "saved" ? <><Check size={15} /> Tersimpan!</> : <><Save size={15} /> Simpan</>}
        </button>
        <button onClick={handleReset} disabled={status === "saving"} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 20px", borderRadius: "12px", background: "#1e1e35", border: "1px solid #2a2a4a", color: "#6b6b8a", fontFamily: "inherit", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
          <RotateCcw size={14} /> Reset Default
        </button>
      </div>
      <style>{`.list-field:focus { border-color: ${color} !important; }`}</style>
    </div>
  )
}
