"use client";
import { useState, useTransition } from "react";
import type { Player } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { addPlayer, updatePlayer, deactivatePlayer } from "@/app/actions/players";
import { BottomSheet } from "@/components/modals/BottomSheet";

interface Props {
  players: Player[];
}

const POSICOES = ["GOL", "DEF", "MEI", "ATA"] as const;
const TIPOS = ["mensalista", "avulso"] as const;

export function AdminJogadores({ players }: Props) {
  const [editing, setEditing] = useState<Player | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button type="button" className="btn-block primary" onClick={() => setCreating(true)}>
        <Icon name="plus" size={16} /> NOVO JOGADOR
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {players.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              opacity: p.ativo ? 1 : 0.5,
            }}
          >
            <Avatar player={p} size={30} fontSize={11} />
            <div style={{ flex: 1 }}>
              <div>{p.nome}</div>
              <div className="lbl-mono">{p.posicao} · {p.tipo}</div>
            </div>
            <button type="button" onClick={() => setEditing(p)} className="btn-tiny">
              <Icon name="edit" size={12} /> EDIT
            </button>
            {p.ativo && (
              <button
                type="button"
                disabled={pending}
                className="btn-tiny"
                onClick={() => {
                  if (!confirm(`Desativar ${p.nome}?`)) return;
                  start(async () => { await deactivatePlayer(p.id); });
                }}
                style={{ color: "var(--warm)", borderColor: "var(--warm)" }}
              >
                <Icon name="trash" size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      {(editing || creating) && (
        <PlayerEditModal
          player={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </>
  );
}

function PlayerEditModal({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const [nome, setNome] = useState(player?.nome ?? "");
  const [posicao, setPosicao] = useState(player?.posicao ?? "MEI");
  const [tipo, setTipo] = useState(player?.tipo ?? "mensalista");
  const [mensalidadeBRL, setMensalidadeBRL] = useState((player?.mensalidade ?? 6000) / 100);
  const [diariaBRL, setDiariaBRL] = useState((player?.diaria ?? 2000) / 100);
  const [cor, setCor] = useState(player?.cor ?? "#E8FF4D");
  const [telefone, setTelefone] = useState(player?.telefone ?? "");
  const [manualOvr, setManualOvr] = useState<number | "">(player?.manualOvr ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const handleSave = () => {
    setError(null);
    start(async () => {
      const input = {
        nome,
        posicao,
        tipo,
        mensalidade: Math.round(mensalidadeBRL * 100),
        diaria: Math.round(diariaBRL * 100),
        cor,
        telefone: telefone || null,
        manualOvr: manualOvr === "" ? null : Number(manualOvr),
        ativo: player?.ativo ?? true,
      };
      const res = player
        ? await updatePlayer({ id: player.id, ...input })
        : await addPlayer(input);
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <BottomSheet title={player ? `Editar · ${player.nome}` : "Novo jogador"} onClose={onClose}>
      <label className="field">
        <span className="lbl-mono">Nome</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl-mono">Posição</span>
        <select value={posicao} onChange={(e) => setPosicao(e.target.value as typeof posicao)}>
          {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <label className="field">
        <span className="lbl-mono">Tipo</span>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label className="field">
          <span className="lbl-mono">Mensalidade (R$)</span>
          <input type="number" step="0.01" value={mensalidadeBRL} onChange={(e) => setMensalidadeBRL(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="lbl-mono">Diária (R$)</span>
          <input type="number" step="0.01" value={diariaBRL} onChange={(e) => setDiariaBRL(Number(e.target.value))} />
        </label>
      </div>
      <label className="field">
        <span className="lbl-mono">Telefone</span>
        <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="11987654321" />
      </label>
      <label className="field">
        <span className="lbl-mono">Cor (hex)</span>
        <input value={cor} onChange={(e) => setCor(e.target.value)} placeholder="#E8FF4D" />
      </label>
      <label className="field">
        <span className="lbl-mono">OVR manual (vazio = automático)</span>
        <input type="number" min={30} max={99} value={manualOvr}
          onChange={(e) => setManualOvr(e.target.value === "" ? "" : Number(e.target.value))} />
      </label>
      {error && <div className="lbl-serif" style={{ color: "var(--warm)" }}>{error}</div>}
      <button type="button" className="btn-block primary" disabled={pending || !nome} onClick={handleSave}>
        {pending ? "SALVANDO…" : "SALVAR"}
      </button>
    </BottomSheet>
  );
}
