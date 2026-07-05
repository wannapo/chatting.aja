import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ChatDefaultPage() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "#0a0a10", fontFamily: "inherit", padding: "24px" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#111116", border: "1px solid #2a2a35", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageSquare size={26} color="#7c7c8a" />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "16px", color: "#f5f5f7", marginBottom: "6px" }}>Pilih percakapan</h2>
        <p style={{ fontSize: "13px", color: "#7c7c8a" }}>Pilih chat dari menu, atau cari pengguna baru.</p>
      </div>
      <Link href="/find" style={{ marginTop: "8px", padding: "10px 24px", borderRadius: "12px", background: "linear-gradient(135deg,#a855f7,#d946ef)", color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: "13px", textDecoration: "none", boxShadow: "0 4px 16px rgba(168,85,247,0.35)" }}>
        + Cari Pengguna
      </Link>
    </div>
  );
}
