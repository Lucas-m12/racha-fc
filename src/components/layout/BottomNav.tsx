"use client";
import { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AppShellContext } from "./AppShellContext";

interface NavItem {
  href: string;
  icon: IconName;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: "home", label: "INÍCIO" },
  { href: "/partidas", icon: "trophy", label: "PARTIDAS" },
  { href: "/jogadores", icon: "users", label: "ELENCO" },
  { href: "/caixa", icon: "wallet", label: "CAIXA", adminOnly: true },
  { href: "/admin", icon: "shield", label: "ADMIN", adminOnly: true },
];

export function BottomNav() {
  const ctx = useContext(AppShellContext);
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || ctx?.isAdmin);
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "active" : ""}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "6px 14px",
              color: active ? "var(--accent)" : "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: active ? 700 : 400,
              textDecoration: "none",
              transition: "color 150ms",
            }}
          >
            <Icon name={item.icon} size={22} strokeWidth={active ? 2.5 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
