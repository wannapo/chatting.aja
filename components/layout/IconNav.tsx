"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home", label: "BERANDA", icon: LayoutDashboard, match: (p: string) => p.startsWith("/home") },
  { href: "/chat", label: "CHAT", icon: MessageSquare, match: (p: string) => p.startsWith("/chat") || p.startsWith("/find") },
  { href: "/profile", label: "PENGATURAN", icon: Settings, match: (p: string) => p.startsWith("/profile") },
];

export default function IconNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="icon-nav">
      {NAV_ITEMS.map(item => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={`icon-nav-item${active ? " active" : ""}`}>
            <Icon size={17} strokeWidth={2} />
            <span className="mono icon-nav-label">{item.label}</span>
          </Link>
        );
      })}

      <style>{`
        .icon-nav {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 4px;
          padding: 10px 8px;
        }
        .icon-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 10px;
          text-decoration: none;
          color: #7c7c8a;
          transition: all 0.15s ease;
        }
        .icon-nav-item:hover { background: #17171f; color: #d8b4fe; }
        .icon-nav-item.active {
          background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.35);
          color: #d8b4fe;
        }
        .icon-nav-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
          .icon-nav { flex-direction: row; padding: 8px; gap: 2px; }
          .icon-nav-item { flex-direction: column; flex: 1; gap: 4px; padding: 8px 4px; }
          .icon-nav-label { font-size: 9px; }
        }
      `}</style>
    </nav>
  );
}
