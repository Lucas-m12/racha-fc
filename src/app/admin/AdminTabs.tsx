"use client";
import { useState } from "react";
import type { Player, Match, Transaction, Vote } from "@/lib/types";
import { AdminJogadores } from "./AdminJogadores";
import { AdminPartidas } from "./AdminPartidas";
import { AdminCaixa } from "./AdminCaixa";
import { AdminVotos } from "./AdminVotos";

type Tab = "jogadores" | "partidas" | "caixa" | "votos";

interface Props {
  players: Player[];
  matches: Match[];
  transactions: Transaction[];
  votes: Vote[];
}

export function AdminTabs({ players, matches, transactions, votes }: Props) {
  const [tab, setTab] = useState<Tab>("jogadores");
  return (
    <>
      <div className="modal-tabs" style={{ position: "static", background: "transparent" }}>
        {(["jogadores", "partidas", "caixa", "votos"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      {tab === "jogadores" && <AdminJogadores players={players} />}
      {tab === "partidas" && <AdminPartidas matches={matches} />}
      {tab === "caixa" && <AdminCaixa transactions={transactions} players={players} />}
      {tab === "votos" && <AdminVotos votes={votes} matches={matches} players={players} />}
    </>
  );
}
