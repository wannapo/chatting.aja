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

    router.push("/home");
    router.refresh();
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "12px 16px", color: "var(--text)",
    fontSize: "15px", fontFamily: "inherit", outline: "none", display: "block",
  };

  return (
    <>
      <style>{`.auth-input:focus { border-color: var(--accent) !important; }`}</style>

      <div style={{ marginBottom: "4px" }}>
        <span style={{ fontWeight: 800, fontSize: "28px", background: "var(--brand-gradient)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>chatting.aja</span>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px" }}>Buat akun baru. Gratis selamanya.</p>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "var(--muted)", marginBottom: "8px" }}>USERNAME</label>
          <input className="auth-input" type="text" placeholder="username kamu" value={username} onChange={e => setUsername(e.target.value)} style={inp} required minLength={3} />
        </div>

        {tag && (
          <div style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)", border: "1px dashed color-mix(in srgb, var(--accent) 50%, transparent)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>Unique Tag kamu (otomatis)</div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--accent)" }}>{tag}</div>
            </div>
            <Sparkles size={18} color="var(--accent)" />
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "var(--muted)", marginBottom: "8px" }}>EMAIL</label>
          <input className="auth-input" type="email" placeholder="kamu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inp} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "var(--muted)", marginBottom: "8px" }}>PASSWORD</label>
          <div style={{ position: "relative" }}>
            <input className="auth-input" type={showPass ? "text" : "password"} placeholder="min. 8 karakter" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, paddingRight: "48px" }} required minLength={8} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "color-mix(in srgb, var(--red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--red)" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !tag} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "var(--bubble-mine)", border: "none", color: "white", fontWeight: 600, fontSize: "15px", cursor: "pointer", opacity: (loading || !tag) ? 0.7 : 1 }}>
          {loading ? "Membuat akun..." : "Buat Akun →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)", marginTop: "20px" }}>
        Sudah punya akun?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Login</Link>
      </p>
    </>
  );
}
