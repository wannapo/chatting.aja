"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateUniqueTag, randomAvatarColor } from "@/lib/types";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (username.length >= 3) setTag(generateUniqueTag(username));
    else setTag("");
  }, [username]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    setLoading(true);
    setError("");

    const avatarColor = randomAvatarColor();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          unique_tag: tag,
          avatar_color: avatarColor,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/chat");
    router.refresh();
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "#17171f", border: "1px solid #2a2a35",
    borderRadius: "12px", padding: "12px 16px", color: "#f5f5f7",
    fontSize: "15px", fontFamily: "inherit", outline: "none", display: "block",
  };

  return (
    <>
      <style>{`.auth-input:focus { border-color: #a855f7 !important; }`}</style>

      <div style={{ marginBottom: "4px" }}>
        <span style={{ fontWeight: 800, fontSize: "28px", background: "linear-gradient(135deg,#ffffff 30%,#d8b4fe 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>chatting.aja</span>
      </div>
      <p style={{ color: "#7c7c8a", fontSize: "14px", marginBottom: "24px" }}>Buat akun baru. Gratis selamanya.</p>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "#7c7c8a", marginBottom: "8px" }}>USERNAME</label>
          <input className="auth-input" type="text" placeholder="username kamu" value={username} onChange={e => setUsername(e.target.value)} style={inp} required minLength={3} />
        </div>

        {tag && (
          <div style={{ background: "rgba(168,85,247,0.08)", border: "1px dashed rgba(168,85,247,0.5)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#7c7c8a", marginBottom: "4px" }}>Unique Tag kamu (otomatis)</div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "#d8b4fe" }}>{tag}</div>
            </div>
            <Sparkles size={18} color="#a855f7" />
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "#7c7c8a", marginBottom: "8px" }}>EMAIL</label>
          <input className="auth-input" type="email" placeholder="kamu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inp} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "#7c7c8a", marginBottom: "8px" }}>PASSWORD</label>
          <div style={{ position: "relative" }}>
            <input className="auth-input" type={showPass ? "text" : "password"} placeholder="min. 8 karakter" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, paddingRight: "48px" }} required minLength={8} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#7c7c8a", cursor: "pointer", display: "flex" }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(255,92,92,0.1)", border: "1px solid rgba(255,92,92,0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#ff5c5c" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !tag} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg,#a855f7,#d946ef)", border: "none", color: "white", fontWeight: 600, fontSize: "15px", cursor: "pointer", opacity: (loading || !tag) ? 0.7 : 1 }}>
          {loading ? "Membuat akun..." : "Buat Akun →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#7c7c8a", marginTop: "20px" }}>
        Sudah punya akun?{" "}
        <Link href="/login" style={{ color: "#a855f7", fontWeight: 600, textDecoration: "none" }}>Login</Link>
      </p>
    </>
  );
}
