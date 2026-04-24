"use client";
import { useContext } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { formatBRL } from "@/lib/format";
import { AppShellContext } from "./AppShellContext";

interface AppHeaderProps {
  viewLabel: string;
}

export function AppHeader({ viewLabel }: AppHeaderProps) {
  const ctx = useContext(AppShellContext);
  return (
    <header className="app-header">
      <div className="brand">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          FUT<span className="dot">CAJU</span>
        </Link>
        <span className="view-label">{viewLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {ctx?.isAdmin && (
          <div className="caixa">
            <span className="caixa-label">caixa</span>
            <span
              className={`caixa-value ${ctx.saldo >= 0 ? "pos" : "neg"}`}
            >
              {formatBRL(ctx.saldo / 100)}
            </span>
          </div>
        )}
        <button
          type="button"
          aria-label="settings"
          onClick={() => ctx?.openModal("settings")}
          style={{ color: "var(--muted)", padding: 4 }}
        >
          <Icon name="settings" size={18} />
        </button>
        {ctx?.currentPlayer ? (
          <button
            type="button"
            aria-label="login"
            onClick={() => ctx.openModal("phoneLogin")}
            style={{ padding: 0 }}
          >
            <Avatar player={ctx.currentPlayer} size={30} fontSize={11} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ctx?.openModal("phoneLogin")}
            style={{ color: "var(--muted)", padding: 4 }}
            aria-label="login"
          >
            <Icon name="user" size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
