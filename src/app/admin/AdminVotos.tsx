"use client";
import type { Vote, Match, Player } from "@/lib/types";
import { formatDateShort } from "@/lib/format";

interface Props {
  votes: Vote[];
  matches: Match[];
  players: Player[];
}

export function AdminVotos({ votes, matches, players }: Props) {
  const playerById = new Map(players.map((p) => [p.id, p]));
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const byMatch: Record<string, Vote[]> = {};
  for (const v of votes) {
    const arr = byMatch[v.matchId] ?? [];
    arr.push(v);
    byMatch[v.matchId] = arr;
  }
  const matchIds = Object.keys(byMatch).sort((a, b) => {
    const da = matchById.get(a)?.data ?? "";
    const db = matchById.get(b)?.data ?? "";
    return db.localeCompare(da);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {matchIds.map((mid) => {
        const m = matchById.get(mid);
        if (!m) return null;
        return (
          <section key={mid}>
            <h3 className="lbl-mono">{formatDateShort(m.data)} · {m.local}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              {byMatch[mid].map((v) => {
                const voter = playerById.get(v.voterId);
                const rated = playerById.get(v.ratedId);
                return (
                  <div
                    key={v.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 8,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ flex: 1 }}>
                      <strong>{voter?.nome ?? "?"}</strong> → {rated?.nome ?? "?"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: v.score >= 8 ? "var(--accent)" : v.score <= 4 ? "var(--warm)" : "var(--cream)",
                      }}
                    >
                      {v.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      {matchIds.length === 0 && (
        <p className="lbl-serif" style={{ textAlign: "center", color: "var(--muted)" }}>
          ainda sem votos
        </p>
      )}
    </div>
  );
}
