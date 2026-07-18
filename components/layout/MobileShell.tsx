"use client";
import { useState } from "react";
import { Power, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/theme";
import IconNav from "./IconNav";

interface Props {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  nodeId?: string;
}

export default function MobileShell({ sidebar, children, nodeId }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const open = () => setSidebarOpen(true);
  const close = () => setSidebarOpen(false);

  async function handlePowerOff() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <style>{`
        html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }
        .os-outer {
          height: 100vh; height: 100dvh; width: 100vw; background: var(--bg);
          padding: 14px; box-sizing: border-box; display: flex;
          position: relative; overflow: hidden;
        }
        .os-window {
          flex: 1; display: flex; flex-direction: column;
          border: 1px solid var(--border); border-radius: 22px;
          background: var(--bg); overflow: hidden; position: relative;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.12);
        }
        :root[data-theme="dark"] .os-window { box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5); }
        .os-grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        :root[data-theme="light"] .os-grid { display: none; }
        .os-glow {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse 45% 40% at 70% 65%, rgba(217,70,239,0.16), transparent 60%);
        }
        :root[data-theme="light"] .os-glow { display: none; }
        .os-header {
          position: relative; z-index: 1; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid var(--border);
        }
        .os-header-left { display: flex; align-items: center; gap: 10px; }
        .os-logo-dot {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--bubble-mine);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .os-header-icons { display: flex; align-items: center; gap: 14px; color: var(--muted); }
        .os-header-icons button { background: none; border: none; color: inherit; cursor: pointer; display: flex; padding: 0; }
        .os-body { position: relative; z-index: 1; flex: 1; min-height: 0; display: flex; }
        .os-nav-rail { width: 90px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; }
        .os-sidebar { width: 280px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
        .os-content { flex: 1; min-width: 0; overflow: hidden; display: flex; flex-direction: column; }
        .os-footer {
          position: relative; z-index: 1; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 20px; border-top: 1px solid var(--border);
          font-size: 10px; letter-spacing: 0.5px; color: var(--muted);
        }
        .mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; backdrop-filter: blur(2px); cursor: pointer; }
        .mobile-overlay.open { display: block; }
        .mobile-topbar { display: none; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; position: relative; z-index: 1; }
        .burger-line { display: block; width: 20px; height: 2px; background: var(--text); border-radius: 2px; }
        @media (max-width: 768px) {
          .os-outer { padding: 0; }
          .os-window { border-radius: 0; border: none; }
          .os-nav-rail { display: none; }
          .os-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 82vw; max-width: 300px; z-index: 50; transform: translateX(-100%); transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); background: var(--bg); border-right: 1px solid var(--border); }
          .os-sidebar.open { transform: translateX(0); box-shadow: 6px 0 32px rgba(0,0,0,0.35); }
          .mobile-topbar { display: flex !important; }
          .os-footer { display: none; }
        }
        @media (min-width: 769px) { .mobile-topbar { display: none !important; } .mobile-overlay { display: none !important; } }
      `}</style>

      <div className="os-outer">
        <div className="os-window">
          <div className="os-grid" />
          <div className="os-glow" />

          {/* Header bar */}
          <div className="os-header">
            <div className="os-header-left">
              <div className="os-logo-dot">💬</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>chatting.aja</div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {nodeId || ""}
                </div>
              </div>
            </div>
            <div className="os-header-icons">
              <button onClick={toggleTheme} title="Ganti tema">
                {isLight ? <Moon size={16} /> : <Sun size={15} />}
              </button>
              <button onClick={handlePowerOff} title="Logout">
                <Power size={15} />
              </button>
            </div>
          </div>

          <div className="mobile-topbar">
            <button onClick={open} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span className="burger-line" />
              <span className="burger-line" />
              <span className="burger-line" />
            </button>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>chatting.aja</span>
            <div style={{ width: "32px" }} />
          </div>

          <div className="os-body">
            <div className="mobile-overlay-wrap">
              <div className={`mobile-overlay${sidebarOpen ? " open" : ""}`} onClick={close} />
            </div>

            <div className="os-nav-rail">
              <IconNav />
            </div>

            <div className={`os-sidebar${sidebarOpen ? " open" : ""}`}>
              <SidebarWrapper onClose={close}>{sidebar}</SidebarWrapper>
            </div>

            <div className="os-content">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }} onClick={e => {
      const target = e.target as HTMLElement;
      if (target.closest('a')) onClose();
    }}>
      {children}
    </div>
  );
}
