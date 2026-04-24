"use client";
import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Icon } from "@/components/ui/Icon";

interface Props {
  pixKey: string;
  pixOwner: string;
  onClose: () => void;
}

export function PixModal({ pixKey, pixOwner, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop: browser blocked clipboard
    }
  };
  return (
    <BottomSheet title="Pagamento Pix" sub={`titular ${pixOwner}`} onClose={onClose}>
      <div
        style={{
          background: "var(--surface-hi)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 160, height: 160, background: "#F2EDDE", borderRadius: 10,
            display: "grid", placeItems: "center", color: "#0E0D0B", fontFamily: "var(--font-mono)",
          }}
        >
          QR CODE
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, wordBreak: "break-all", textAlign: "center" }}>
          {pixKey || "—"}
        </div>
      </div>
      <button type="button" className="btn-block primary" onClick={handleCopy} disabled={!pixKey}>
        <Icon name="copy" size={16} /> {copied ? "COPIADO" : "COPIAR CHAVE"}
      </button>
    </BottomSheet>
  );
}
