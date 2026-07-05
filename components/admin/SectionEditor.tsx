"use client";
import { useState } from "react";
import { Save, RotateCcw, Check, AlertCircle } from "lucide-react";
import { saveSectionToSupabase } from "@/lib/admin/store";

interface Field { key: string; label: string; type?: "text" | "textarea"; placeholder?: string }
interface Props {
  title: string; description?: string; sectionKey: string;
  fields: Field[]; values: Record<string, string>;
  onSave: (vals: Record<string, string>) => void;
  defaultValues: Record<string, string>;
  color?: string;
}

export default function SectionEditor({ title, description, sectionKey, fields, values, onSave, defaultValues, color = "#6366f1" }: Props) {
  const [local, setLocal] = useState<Record<string, string>>(values)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const handleSave = async () => {
    setStatus("saving")
    const ok = await saveSectionToSupabase(sectionKey, local)
    if (ok) {
      onSave(local)
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 2500)
    } else {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  const handleReset = async () => {
    setStatus("saving")
    const ok = await saveSectionToSupabase(sectionKey, defaultValues)
    if (ok) {
      setLocal(defaultValues as any)
      onSave(defaultValues as any)
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 2500)
    } else {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "#0f0f1a", border: "1px solid #2a2a4a",
    borderRadius: "10px", padding: "11px 14px", color: "#e8e8f0",
    fontSize: "14px", fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s",
  }

  return (
    <div style={{ padding: "32px", maxWidth: "720px", fontFamily: "inherit" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "4px", height: "22px", borderRadius: "2px", background: `linear-gradient(${color}, ${color}99)` }} />
          <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "22px", color: "#e8e8f0" }}>{title}</h1>
        </div>
        {description && <p style={{ fontSize: "13px", color: "#6b6b8a", marginLeft: "14px" }}>{description}</p>}
      </div>

      <div style={{ background: "#161625", border: "1px solid #2a2a4a", borderRadius: "18px", padding: "24px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: "#6b6b8a", marginBottom: "8px" }}>{f.label.toUpperCase()}</label>
            {f.type === "textarea" ? (
              <textarea value={local[f.key] ?? ""} onChange={e => setLocal(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={4}
                style={{ ...inp, resize: "vertical", lineHeight: "1.6" }} className="admin-field" />
            ) : (
              <input type="text" value={local[f.key] ?? ""} onChange={e => setLocal(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                style={inp} className="admin-field" />
            )}
          </div>
        ))}
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
          cursor: status === "saving" ? "wait" : "pointer",
          opacity: status === "saving" ? 0.7 : 1,
          boxShadow: status === "saved" ? "none" : `0 4px 16px ${color}44`,
        }}>
          {status === "saving" ? "Menyimpan..." : status === "saved" ? <><Check size={15} /> Tersimpan!</> : <><Save size={15} /> Simpan Perubahan</>}
        </button>
        <button onClick={handleReset} disabled={status === "saving"} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 20px", borderRadius: "12px", background: "#1e1e35", border: "1px solid #2a2a4a", color: "#6b6b8a", fontFamily: "inherit", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
          <RotateCcw size={14} /> Reset Default
        </button>
      </div>

      <style>{`.admin-field:focus { border-color: ${color} !important; }`}</style>
    </div>
  )
}
