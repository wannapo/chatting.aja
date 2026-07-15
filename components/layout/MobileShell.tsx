"use client";
import { useState } from "react";
import { Radio, Zap, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import IconNav from "./IconNav";

interface Props {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  nodeId?: string;
}

export default function MobileShell({ sidebar, children, nodeId }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
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
          height: 100vh; height: 100dvh; width: 100vw; background: #0a0a10;
          padding: 14px; box-sizing: border-box; display: flex;
          position: relative; overflow: hidden;
        }
        .os-window {
          flex: 1; display: flex; flex-direction: column;
          border: 1px solid #35353f; border-radius: 22px;
          background: #0a0a10; overflow: hidden; position: relative;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5);
        }
        .os-grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .os-glow {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse 45% 40% at 70% 65%, rgba(217,70,239,0.16), transparent 60%);
        }
        .os-header {
          position: relative; z-index: 1; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid #2a2a35;
        }
        .os-header-left { display: flex; align-items: center; gap: 10px; }
        .os-logo-dot {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg,#a855f7,#d946ef);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }
        .os-header-icons { display: flex; align-items: center; gap: 14px; color: #7c7c8a; }
        .os-body { position: relative; z-index: 1; flex: 1; min-height: 0; display: flex; }
        .os-nav-rail { width: 90px; flex-shrink: 0; border-right: 1px solid #2a2a35; overflow-y: auto; }
        .os-sidebar { width: 280px; flex-shrink: 0; border-right: 1px solid #2a2a35; display: flex; flex-direction: column; overflow: hidden; }
        .os-content { flex: 1; min-width: 0; overflow: hidden; display: flex; flex-direction: column; }
        .os-footer {
          position: relative; z-index: 1; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 20px; border-top: 1px solid #2a2a35;
          font-size: 10px; letter-spacing: 0.5px; color: #55555f;
        }
        .mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 49; backdrop-filter: blur(2px); cursor: pointer; }
        .mobile-overlay.open { display: block; }
        .mobile-topbar { display: none; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #2a2a35; flex-shrink: 0; position: relative; z-index: 1; }
        @media (max-width: 768px) {
          .os-outer { padding: 0; }
          .os-window { border-radius: 0; border: none; }
          .os-nav-rail { display: none; }
          .os-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 82vw; max-width: 300px; z-index: 50; transform: translateX(-100%); transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); background: #0a0a10; border-right: 1px solid #2a2a35; }
          .os-sidebar.open { transform: translateX(0); box-shadow: 6px 0 32px rgba(0,0,0,0.7); }
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
              <div className="os-logo-dot">🜏</div>
              <div>
                <div className="mono" style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "1px", color: "#f5f5f7" }}>chatting.aja</div>
                <div className="mono" style={{ fontSize: "10px", color: "#55555f", letterSpacing: "0.5px" }}>
                  CONNECTED: {nodeId || "NODE_00"}
                </div>
              </div>
            </div>
            <div className="os-header-icons">
              <Radio size={15} />
              <Zap size={15} />
              <button onClick={handlePowerOff} title="Logout" style={{ background: "none", border: "none", color: "#7c7c8a", cursor: "pointer", display: "flex", padding: 0 }}>
                <Power size={15} />
              </button>
            </div>
          </div>

          <div className="mobile-topbar">
            <button onClick={open} style={{ background: "none", border: "none", color: "#f5f5f7", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ display: "block", width: "20px", height: "2px", background: "#f5f5f7", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "20px", height: "2px", background: "#f5f5f7", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "20px", height: "2px", background: "#f5f5f7", borderRadius: "2px" }} />
            </button>
            <span className="mono" style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "1px", color: "#f5f5f7" }}>chatting.aja</span>
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

          {/* Footer status bar */}
          <div className="os-footer mono">
            <span>SYSTEM_STABLE // NO_LEAK_DETECTED</span>
            <span style={{ display: "flex", gap: "16px" }}>
              <span>UPLINK_STATUS</span>
              <span>LATENCY_9MS</span>
              <span>ENCRYPTION_AES</span>
            </span>
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
