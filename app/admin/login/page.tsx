"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin/store";
import { Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const ok = adminLogin(email, password);
      if (ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Email atau password salah.");
        setLoading(false);
      }
    }, 600);
  };

  const inp: React.CSSProperties = {
    width:"100%", background:"#1a1a2e", border:"1px solid #2a2a4a",
    borderRadius:"12px", padding:"12px 16px", color:"#e8e8f0",
    fontSize:"14px", fontFamily:"inherit", outline:"none", display:"block",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily: "inherit", padding:"24px", position:"relative", overflow:"hidden" }}>
      {/* glow */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.15), transparent 60%)" }} />

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:"400px" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ fontFamily: "inherit", fontWeight:800, fontSize:"24px", color:"#e8e8f0", marginBottom:"6px" }}>Admin Panel</h1>
          <p style={{ fontSize:"13px", color:"#6b6b8a" }}>chatting.aja — Content Management</p>
        </div>

        <div style={{ background:"#161625", border:"1px solid #2a2a4a", borderRadius:"20px", padding:"32px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"11px", fontWeight:600, letterSpacing:"1px", color:"#6b6b8a", marginBottom:"8px" }}>EMAIL</label>
              <input style={inp} className="admin-inp" type="email" placeholder="admin@chatting.aja" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom:"20px" }}>
              <label style={{ display:"block", fontSize:"11px", fontWeight:600, letterSpacing:"1px", color:"#6b6b8a", marginBottom:"8px" }}>PASSWORD</label>
              <div style={{ position:"relative" }}>
                <input style={{ ...inp, paddingRight:"44px" }} className="admin-inp" type={showPass?"text":"password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#6b6b8a", cursor:"pointer", display:"flex" }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"10px", padding:"10px 14px", fontSize:"13px", color:"#f87171", marginBottom:"16px" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", borderRadius:"12px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", color:"white", fontFamily: "inherit", fontWeight:700, fontSize:"14px", cursor:"pointer", opacity: loading ? 0.7 : 1, transition:"all 0.2s" }}>
              {loading ? "Memverifikasi..." : "Masuk ke Admin →"}
            </button>
          </form>

          <div style={{ marginTop:"20px", padding:"12px 14px", background:"rgba(99,102,241,0.08)", borderRadius:"10px", border:"1px solid rgba(99,102,241,0.2)" }}>
            <div style={{ fontSize:"11px", color:"#6b6b8a", marginBottom:"4px" }}>Default credentials:</div>
            <div style={{ fontSize:"12px", color:"#a5a5c0", fontFamily:"monospace" }}>admin@chatting.aja / Admin@12345</div>
          </div>
        </div>
      </div>
      <style>{`.admin-inp:focus { border-color: #6366f1 !important; }`}</style>
    </div>
  );
}
