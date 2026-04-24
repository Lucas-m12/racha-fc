"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { Match } from "@/lib/types";
import { formatDateShort, nextFridayISO } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { BottomSheet } from "@/components/modals/BottomSheet";
import { createMatch, deleteMatch } from "@/app/actions/matches";

interface Props {
  matches: Match[];
}

export function AdminPartidas({ matches }: Props) {
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" className="btn-block primary" onClick={() => setCreating(true)}>
        <Icon name="plus" size={16} /> NOVA PARTIDA
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {matches.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>
                {formatDateShort(m.data)}
              </div>
              <div className="lbl-mono">{m.local} · {m.status}</div>
            </div>
            <Link href={`/partidas/${m.id}`} className="btn-tiny">
              ABRIR
            </Link>
            {m.status === "agendada" && (
              <button
                type="button"
                disabled={pending}
                className="btn-tiny"
                style={{ color: "var(--warm)", borderColor: "var(--warm)" }}
                onClick={() => {
                  if (!confirm(`Apagar partida de ${m.data}?`)) return;
                  start(async () => { await deleteMatch(m.id); });
                }}
              >
                <Icon name="trash" size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      {creating && <NewMatchModal onClose={() => setCreating(false)} />}
    </>
  );
}

function NewMatchModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState(nextFridayISO());
  const [local, setLocal] = useState("Arena Cajueiro");
  const [custoBRL, setCustoBRL] = useState(120);
  const [pending, start] = useTransition();

  const handleSave = () => {
    start(async () => {
      const res = await createMatch({
        data,
        local,
        custoQuadra: Math.round(custoBRL * 100),
        observacao: "",
      });
      if (res.ok) onClose();
    });
  };

  return (
    <BottomSheet title="Nova partida" onClose={onClose}>
      <label className="field">
        <span className="lbl-mono">Data</span>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl-mono">Local</span>
        <input value={local} onChange={(e) => setLocal(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl-mono">Custo quadra (R$)</span>
        <input type="number" step="0.01" value={custoBRL} onChange={(e) => setCustoBRL(Number(e.target.value))} />
      </label>
      <button type="button" className="btn-block primary" disabled={pending} onClick={handleSave}>
        {pending ? "CRIANDO…" : "CRIAR"}
      </button>
    </BottomSheet>
  );
}
