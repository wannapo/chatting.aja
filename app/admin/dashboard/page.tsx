"use client";
import { useEffect, useState } from "react";
import { fetchContent } from "@/lib/admin/store";
import Link from "next/link";
import { Type, BarChart2, List, Zap, Tag, Lock, Megaphone, ChevronRight, Eye } from "lucide-react";

const sections = [
  { href:"/admin/dashboard/hero", label:"Hero Section", desc:"Judul, tagline, deskripsi, tombol CTA utama", icon:<Type size={18}/>, color:"#6366f1" },
  { href:"/admin/dashboard/stats", label:"Stats Bar", desc:"4 angka statistik di bawah hero", icon:<BarChart2 size={18}/>, color:"#06b6d4" },
  { href:"/admin/dashboard/steps", label:"Cara Kerja", desc:"3 langkah cara kerja aplikasi", icon:<List size={18}/>, color:"#10b981" },
  { href:"/admin/dashboard/features", label:"Fitur", desc:"4 kartu fitur utama", icon:<Zap size={18}/>, color:"#f59e0b" },
  { href:"/admin/dashboard/uid", label:"Unique Tag Section", desc:"Penjelasan sistem Unique Tag", icon:<Tag size={18}/>, color:"#ec4899" },
  { href:"/admin/dashboard/privacy", label:"Privasi", desc:"Section privasi dan perbandingan", icon:<Lock size={18}/>, color:"#8b5cf6" },
  { href:"/admin/dashboard/cta", label:"CTA Section", desc:"Ajakan daftar di bagian bawah", icon:<Megaphone size={18}/>, color:"#a855f7" },
];

export default function AdminOverviewPage() {
  const [content, setContent] = useState<any>(null);
  useEffect(() => { setContent(fetchContent()); }, []);

  return (
    <div style={{ padding:"32px", maxWidth:"900px" }}>
      {/* Header */}
      <div style={{ marginBottom:"32px" }}>
        <h1 style={{ fontFamily: "inherit", fontWeight:800, fontSize:"26px", color:"#e8e8f0", marginBottom:"6px" }}>Overview</h1>
        <p style={{ fontSize:"14px", color:"#6b6b8a" }}>Kelola semua konten landing page chatting.aja dari sini.</p>
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"32px" }}>
        {[
          { label:"Total Section", value:"7", color:"#6366f1" },
          { label:"Konten Aktif", value:"7", color:"#10b981" },
          { label:"Last Updated", value:"Baru saja", color:"#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background:"#161625", border:"1px solid #2a2a4a", borderRadius:"16px", padding:"18px 20px" }}>
            <div style={{ fontFamily: "inherit", fontWeight:800, fontSize:"22px", color:s.color, marginBottom:"4px" }}>{s.value}</div>
            <div style={{ fontSize:"12px", color:"#6b6b8a" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div style={{ marginBottom:"16px" }}>
        <h2 style={{ fontFamily: "inherit", fontWeight:700, fontSize:"15px", color:"#a5a5c0", marginBottom:"14px", letterSpacing:"0.5px" }}>SECTION LANDING PAGE</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          {sections.map(sec => (
            <Link key={sec.href} href={sec.href} style={{ textDecoration:"none" }}>
              <div style={{ background:"#161625", border:"1px solid #2a2a4a", borderRadius:"16px", padding:"18px 20px", display:"flex", alignItems:"center", gap:"14px", transition:"all 0.15s", cursor:"pointer" }}
                onMouseEnter={e => { e.currentTarget.style.border=`1px solid ${sec.color}44`; e.currentTarget.style.background="#1e1e35"; }}
                onMouseLeave={e => { e.currentTarget.style.border="1px solid #2a2a4a"; e.currentTarget.style.background="#161625"; }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:`${sec.color}18`, border:`1px solid ${sec.color}33`, display:"flex", alignItems:"center", justifyContent:"center", color:sec.color, flexShrink:0 }}>
                  {sec.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily: "inherit", fontWeight:600, fontSize:"14px", color:"#e8e8f0", marginBottom:"3px" }}>{sec.label}</div>
                  <div style={{ fontSize:"12px", color:"#6b6b8a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sec.desc}</div>
                </div>
                <ChevronRight size={15} color="#6b6b8a" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Preview link */}
      <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:"14px", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily: "inherit", fontWeight:600, fontSize:"14px", color:"#a5b4fc", marginBottom:"3px" }}>Preview Landing Page</div>
          <div style={{ fontSize:"12px", color:"#6b6b8a" }}>Lihat hasil perubahan konten secara langsung</div>
        </div>
        <Link href="/landing.html" target="_blank" style={{ textDecoration:"none" }}>
          <button style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 18px", borderRadius:"10px", background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#a5b4fc", fontFamily: "inherit", fontWeight:600, fontSize:"13px", cursor:"pointer" }}>
            <Eye size={14}/> Buka Preview
          </button>
        </Link>
      </div>
    </div>
  );
}
