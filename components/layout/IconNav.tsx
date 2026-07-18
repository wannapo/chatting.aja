"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Settings } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function IconNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { href: "/home", label: t("nav_home"), icon: LayoutDashboard, match: (p: string) => p.startsWith("/home") },
    { href: "/chat", label: t("nav_chat"), icon: MessageSquare, match: (p: string) => p.startsWith("/chat") || p.startsWith("/find") },
    { href: "/profile", label: t("nav_settings"), icon: Settings, match: (p: string) => p.startsWith("/profile") },
  ];

  return (
    <nav className="icon-nav">
      {NAV_ITEMS.map(item => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={`icon-nav-item${active ? " active" : ""}`}>
            <Icon size={17} strokeWidth={2} />
            <span className="icon-nav-label">{item.label}</span>
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
          color: var(--muted);
          transition: all 0.15s ease;
        }
        .icon-nav-item:hover { background: var(--surface2); color: var(--accent); }
        .icon-nav-item.active {
          background: color-mix(in srgb, var(--accent) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
          color: var(--accent);
        }
        .icon-nav-label {
          font-size: 11px;
          font-weight: 600;
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
