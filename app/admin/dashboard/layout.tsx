"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminLoggedIn, adminLogout } from "@/lib/admin/store";
import Link from "next/link";
import { LayoutDashboard, Type, BarChart2, List, Zap, Tag, Lock, Megaphone, LogOut, ExternalLink, ChevronRight } from "lucide-react";

const navItems = [
  { href:"/admin/dashboard", label:"Overview", icon:<LayoutDashboard size={15}/>, exact:true },
  { href:"/admin/dashboard/hero", label:"Hero Section", icon:<Type size={15}/> },
  { href:"/admin/dashboard/stats", label:"Stats Bar", icon:<BarChart2 size={15}/> },
  { href:"/admin/dashboard/steps", label:"Cara Kerja", icon:<List size={15}/> },
  { href:"/admin/dashboard/features", label:"Fitur", icon:<Zap size={15}/> },
  { href:"/admin/dashboard/uid", label:"Unique Tag Section", icon:<Tag size={15}/> },
  { href:"/admin/dashboard/privacy", label:"Privasi", icon:<Lock size={15}/> },
  { href:"/admin/dashboard/cta", label:"CTA Section", icon:<Megaphone size={15}/> },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) router.replace("/admin/login");
    else setChecked(true);
  }, []);

  if (!checked) return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#6b6b8a", fontFamily: "inherit" }}>Loading...</div>
    </div>
  );

  const handleLogout = () => { adminLogout(); router.push("/admin/login"); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"#0f0f1a", fontFamily: "inherit" }}>
      {/* Sidebar */}
      <aside style={{ width:"240px", flexShrink:0, background:"#161625", borderRight:"1px solid #2a2a4a", display:"flex", flexDirection:"column", position:"fixed", top:0, bottom:0, left:0 }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px", borderBottom:"1px solid #2a2a4a" }}>
          <div style={{ fontFamily: "inherit", fontWeight:800, fontSize:"14px", color:"#6366f1", marginBottom:"2px" }}>chatting.aja</div>
          <div style={{ fontSize:"11px", color:"#6b6b8a" }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/admin/dashboard";
            const activeExact = item.exact && pathname === item.href;
            const active = isActive || activeExact;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration:"none" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"10px", marginBottom:"2px",
                  background: active ? "rgba(99,102,241,0.15)" : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                  color: active ? "#a5b4fc" : "#6b6b8a",
                  transition:"all 0.15s", cursor:"pointer",
                }}>
                  {item.icon}
                  <span style={{ fontSize:"13px", fontWeight: active ? 600 : 400 }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding:"12px 8px", borderTop:"1px solid #2a2a4a", display:"flex", flexDirection:"column", gap:"4px" }}>
          <Link href="/landing.html" target="_blank" style={{ textDecoration:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"10px", color:"#6b6b8a", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#1e1e35"; e.currentTarget.style.color="#e8e8f0"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b6b8a"; }}>
              <ExternalLink size={15}/><span style={{ fontSize:"13px" }}>Lihat Landing Page</span>
            </div>
          </Link>
          <div onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"10px", color:"#f87171", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <LogOut size={15}/><span style={{ fontSize:"13px" }}>Keluar</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, marginLeft:"240px", minHeight:"100vh", overflowY:"auto" }}>
        {children}
      </main>
    </div>
  );
}
