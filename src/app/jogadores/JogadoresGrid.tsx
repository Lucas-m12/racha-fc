"use client";
import { useState } from "react";
import type { Player, StatsMap } from "@/lib/types";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Filter = "todos" | "mensalistas" | "avulsos";

interface Props {
  players: Player[];
  statsMap: StatsMap;
}

export function JogadoresGrid({ players, statsMap }: Props) {
  const [filter, setFilter] = useState<Filter>("todos");
  const filtered = players
    .filter((p) => filter === "todos" || (filter === "mensalistas" ? p.tipo === "mensalista" : p.tipo === "avulso"))
    .sort((a, b) => (statsMap[b.id]?.rating ?? 60) - (statsMap[a.id]?.rating ?? 60));

  return (
    <>
      <SectionHeader title="ELENCO" sub={`${filtered.length} atletas`} />
      <div style={{ display: "flex", gap: 8 }}>
        {(["todos", "mensalistas", "avulsos"] as Filter[]).map((f) => (
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {filtered.map((p) => (
          <PlayerCard key={p.id} player={p} stats={statsMap[p.id]} />
        ))}
      </div>
    </>
  );
}
