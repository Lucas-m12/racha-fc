"use client";
import { useState, useTransition } from "react";
import type { Player } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { Avatar } from "@/components/ui/Avatar";
import { loginByPhone, logout } from "@/app/actions/auth";
import { maskPhone } from "@/lib/format";

interface Props {
  currentPlayer: Player | null;
  players: Player[];
  onClose: () => void;
}

export function PhoneLoginModal({ currentPlayer, onClose }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const handleLogin = () => {
    setError(null);
    start(async () => {
      const res = await loginByPhone(phone);
      if (res.ok) onClose();
      else setError(res.error === "not_found" ? "Número não encontrado no elenco." : "Número inválido.");
    });
  };

  const handleLogout = () => {
    start(async () => {
      await logout();
      onClose();
    });
  };

  if (currentPlayer) {
    return (
      <BottomSheet title="Minha conta" sub={`identificado como ${currentPlayer.nome}`} onClose={onClose}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar player={currentPlayer} size={56} fontSize={20} />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{currentPlayer.nome.toUpperCase()}</div>
            <div className="lbl-mono">{maskPhone(currentPlayer.telefone)}</div>
          </div>
        </div>
        <button type="button" className="btn-block danger" disabled={pending} onClick={handleLogout}>
          SAIR
        </button>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      title="Entrar"
      sub="digita teu número pra confirmar presença"
      onClose={onClose}
    >
      <label className="field">
        <span className="lbl-mono">Celular</span>
        <input
          type="tel"
          inputMode="numeric"
          autoFocus
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="11987654321"
        />
      </label>
      {error && <div className="lbl-serif" style={{ color: "var(--warm)" }}>{error}</div>}
      <button type="button" className="btn-block primary" disabled={pending || !phone} onClick={handleLogin}>
        {pending ? "VERIFICANDO…" : "ENTRAR"}
      </button>
    </BottomSheet>
  );
}
