"use client";
import { useState, useTransition } from "react";
import type { Settings } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { unlockAdmin, lockAdmin } from "@/app/actions/auth";
import { updateSettings } from "@/app/actions/settings";

interface Props {
  settings: Settings;
  isAdmin: boolean;
  onClose: () => void;
}

export function SettingsModal({ settings, isAdmin, onClose }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState(settings.pixKey);
  const [pixOwner, setPixOwner] = useState(settings.pixOwner);
  const [maxConfirmados, setMaxConfirmados] = useState(settings.maxConfirmados);
  const [adminPin, setAdminPin] = useState(settings.adminPin);
  const [pending, start] = useTransition();

  const handleUnlock = () => {
    setError(null);
    start(async () => {
      const res = await unlockAdmin(pin);
      if (res.ok) onClose();
      else setError("PIN incorreto.");
    });
  };

  const handleSave = () => {
    start(async () => {
      const res = await updateSettings({ pixKey, pixOwner, maxConfirmados, adminPin });
      if (res.ok) onClose();
    });
  };

  const handleLock = () => {
    start(async () => {
      await lockAdmin();
      onClose();
    });
  };

  if (!isAdmin) {
    return (
      <BottomSheet title="Configurações" sub="digite o PIN pra desbloquear admin" onClose={onClose}>
        <label className="field">
          <span className="lbl-mono">PIN admin</span>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
          />
        </label>
        {error && <div className="lbl-serif" style={{ color: "var(--warm)" }}>{error}</div>}
        <button type="button" className="btn-block primary" disabled={pending || !pin} onClick={handleUnlock}>
          {pending ? "VERIFICANDO…" : "DESBLOQUEAR"}
        </button>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet title="Admin" sub="configurações da pelada" onClose={onClose}>
      <label className="field">
        <span className="lbl-mono">Chave Pix</span>
        <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl-mono">Titular</span>
        <input value={pixOwner} onChange={(e) => setPixOwner(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl-mono">Máx. confirmados</span>
        <input
          type="number"
          min={2}
          max={40}
          value={maxConfirmados}
          onChange={(e) => setMaxConfirmados(Number(e.target.value))}
        />
      </label>
      <label className="field">
        <span className="lbl-mono">PIN admin</span>
        <input value={adminPin} onChange={(e) => setAdminPin(e.target.value)} />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="btn-block" onClick={handleLock} disabled={pending}>
          TRAVAR
        </button>
        <button type="button" className="btn-block primary" onClick={handleSave} disabled={pending}>
          SALVAR
        </button>
      </div>
    </BottomSheet>
  );
}
