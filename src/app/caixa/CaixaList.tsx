"use client";
import { useState, useTransition } from "react";
import type { Transaction } from "@/lib/types";
import { formatBRLSigned, formatDateShort } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { deleteTransaction } from "@/app/actions/transactions";

interface Props {
  transactions: Transaction[];
  playerNameById: Record<string, string>;
}

type Filter = "todas" | "entradas" | "saidas";

export function CaixaList({ transactions, playerNameById }: Props) {
  const [filter, setFilter] = useState<Filter>("todas");
  const [pending, start] = useTransition();

  const filtered = transactions.filter((t) =>
    filter === "todas" ? true : filter === "entradas" ? t.tipo === "entrada" : t.tipo === "saida",
  );

  const handleDelete = (id: string) => {
    if (!confirm("Apagar lançamento?")) return;
    start(async () => {
      await deleteTransaction(id);
    });
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["todas", "entradas", "saidas"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`pill ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 12,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <Icon
              name={t.tipo === "entrada" ? "arrowUpRight" : "arrowDownRight"}
              size={18}
              style={{ color: t.tipo === "entrada" ? "var(--accent)" : "var(--warm)" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {t.descricao || (t.playerId ? playerNameById[t.playerId] : "—")}
              </div>
              <div className="lbl-mono">{formatDateShort(t.data)} · {t.categoria}</div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                color: t.tipo === "entrada" ? "var(--accent)" : "var(--warm)",
                whiteSpace: "nowrap",
              }}
            >
              {formatBRLSigned(t.valor / 100, t.tipo)}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(t.id)}
              disabled={pending}
              aria-label="apagar"
              style={{ color: "var(--muted)", padding: 4 }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="lbl-serif" style={{ textAlign: "center", color: "var(--muted)" }}>
            nenhum lançamento ainda
          </p>
        )}
      </div>
    </>
  );
}
