"use client";
import { useState, useTransition } from "react";
import type { Transaction, Player } from "@/lib/types";
import { formatBRLSigned, formatDateShort, todayInFortaleza } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { BottomSheet } from "@/components/modals/BottomSheet";
import { createTransaction, deleteTransaction } from "@/app/actions/transactions";
import type { TxTipo, TxCategoria } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  players: Player[];
}

export function AdminCaixa({ transactions, players }: Props) {
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" className="btn-block primary" onClick={() => setCreating(true)}>
        <Icon name="plus" size={16} /> NOVO LANÇAMENTO
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {transactions.map((t) => (
          <div
            key={t.id}
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
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{t.descricao}</div>
              <div className="lbl-mono">{formatDateShort(t.data)} · {t.categoria}</div>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: t.tipo === "entrada" ? "var(--accent)" : "var(--warm)",
              }}
            >
              {formatBRLSigned(t.valor / 100, t.tipo)}
            </span>
            <button
              type="button"
              disabled={pending}
              className="btn-tiny"
              style={{ color: "var(--warm)", borderColor: "var(--warm)" }}
              onClick={() => {
                if (!confirm("Apagar lançamento?")) return;
                start(async () => { await deleteTransaction(t.id); });
              }}
            >
              <Icon name="trash" size={12} />
            </button>
          </div>
        ))}
      </div>
      {creating && <NewTransactionModal players={players} onClose={() => setCreating(false)} />}
    </>
  );
}

const CATEGORIAS_BY_TIPO: Record<TxTipo, TxCategoria[]> = {
  entrada: ["mensalidade", "diaria", "outros"],
  saida: ["quadra", "material", "outros"],
};

function NewTransactionModal({ players, onClose }: { players: Player[]; onClose: () => void }) {
  const today = todayInFortaleza();
  const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [tipo, setTipo] = useState<TxTipo>("entrada");
  const [categoria, setCategoria] = useState<TxCategoria>("outros");
  const [valorBRL, setValorBRL] = useState(0);
  const [data, setData] = useState(isoToday);
  const [descricao, setDescricao] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const handleSave = () => {
    start(async () => {
      const res = await createTransaction({
        tipo,
        categoria,
        valor: Math.round(valorBRL * 100),
        data,
        descricao,
        playerId,
        matchId: null,
      });
      if (res.ok) onClose();
    });
  };

  return (
    <BottomSheet title="Novo lançamento" onClose={onClose}>
      <div style={{ display: "flex", gap: 8 }}>
        {(["entrada", "saida"] as TxTipo[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`pill ${tipo === t ? "active" : ""}`}
            onClick={() => { setTipo(t); setCategoria(CATEGORIAS_BY_TIPO[t][0]); }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <label className="field">
        <span className="lbl-mono">Categoria</span>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value as TxCategoria)}>
          {CATEGORIAS_BY_TIPO[tipo].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="field">
        <span className="lbl-mono">Valor (R$)</span>
        <input type="number" step="0.01" value={valorBRL} onChange={(e) => setValorBRL(Number(e.target.value))} />
      </label>
      <label className="field">
        <span className="lbl-mono">Data</span>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl-mono">Descrição</span>
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl-mono">Jogador (opcional)</span>
        <select value={playerId ?? ""} onChange={(e) => setPlayerId(e.target.value || null)}>
          <option value="">—</option>
          {players.filter((p) => p.ativo).map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </label>
      <button type="button" className="btn-block primary" disabled={pending || valorBRL <= 0} onClick={handleSave}>
        {pending ? "SALVANDO…" : "SALVAR"}
      </button>
    </BottomSheet>
  );
}
