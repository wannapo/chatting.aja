"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message
      );
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
        <span style={{ fontWeight: 800, fontSize: "28px", background: "var(--brand-gradient)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          chatting.aja
        </span>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "28px" }}>
        Chat tanpa ribet. Tanpa nomor telepon.
      </p>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "var(--muted)", marginBottom: "8px" }}>EMAIL</label>
          <input className="auth-input" type="email" placeholder="kamu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inp} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: "var(--muted)", marginBottom: "8px" }}>PASSWORD</label>
          <div style={{ position: "relative" }}>
            <input className="auth-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, paddingRight: "48px" }} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div style={{ textAlign: "right", marginTop: "6px" }}>
            <Link href="#" style={{ fontSize: "12px", color: "var(--accent)", textDecoration: "none" }}>Lupa password?</Link>
          </div>
        </div>

        {error && (
          <div style={{ background: "color-mix(in srgb, var(--red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--red)" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "var(--bubble-mine)", border: "none", color: "white", fontWeight: 600, fontSize: "15px", cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: "4px" }}>
          {loading ? "Memverifikasi..." : "Masuk →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)", marginTop: "20px" }}>
        Belum punya akun?{" "}
        <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Daftar sekarang</Link>
      </p>
    </>
  );
}
