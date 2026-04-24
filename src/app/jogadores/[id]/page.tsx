import { notFound } from "next/navigation";
import { getAll } from "@/lib/db/repo";
import { buildStatsMap } from "@/lib/stats";
import { formatDateShort, formatRelative } from "@/lib/format";
import { ShellWrapper } from "../../_shell";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

export default async function PlayerProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { players, matches, votes } = await getAll();
  const player = players.find((p) => p.id === id);
  if (!player) notFound();
  const statsMap = buildStatsMap(players, matches, votes);
  const stats = statsMap[player.id];

  const myMatches = matches
    .filter((m) => m.status === "finalizada" && m.jogadores.some((j) => j.playerId === player.id && j.presente))
    .slice(0, 5);

  return (
    <ShellWrapper viewLabel={`perfil · ${player.nome.toLowerCase()}`}>
      <div className="page">
        <section
          style={{
            background: `linear-gradient(160deg, ${player.cor}22, var(--surface))`,
            border: "1px solid var(--border-hi)",
            borderRadius: "var(--radius-2xl)",
            padding: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Avatar player={player} size={88} fontSize={28} />
          <div style={{ flex: 1 }}>
            <div className="lbl-mono">{player.posicao} · {player.tipo}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36 }}>
              {player.nome.toUpperCase()}
            </div>
            <div className="lbl-serif" style={{ fontSize: 13 }}>
              OVR {stats.rating} {stats.provisional && <span style={{ color: "var(--muted)" }}>(prov.)</span>}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="TEMPORADA" />
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[
              { lbl: "JOGOS", val: stats.jogos },
              { lbl: "GOLS", val: stats.gols, c: "var(--accent)" },
              { lbl: "ASSISTS", val: stats.assists },
              { lbl: "G+A", val: stats.ga },
              { lbl: "VIT.", val: stats.vitorias },
              { lbl: "EMP.", val: stats.empates },
              { lbl: "DER.", val: stats.derrotas },
              { lbl: "APROV.", val: `${stats.aprov}%` },
            ].map((x) => (
              <div key={x.lbl} className="stat-block">
                <div className="lbl">{x.lbl}</div>
                <div
                  className="val"
                  style={{ fontFamily: "var(--font-display)", fontSize: 22, color: x.c ?? "var(--cream)" }}
                >
                  {x.val}
                </div>
              </div>
            ))}
          </div>
        </section>

        {myMatches.length > 0 && (
          <section>
            <SectionHeader title="ÚLTIMOS JOGOS" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myMatches.map((m) => {
                const mp = m.jogadores.find((j) => j.playerId === player.id)!;
                const myScore = mp.time === "A" ? m.placarA : m.placarB;
                const opp = mp.time === "A" ? m.placarB : m.placarA;
                const res = myScore == null || opp == null ? "—" : myScore > opp ? "V" : myScore === opp ? "E" : "D";
                const color = res === "V" ? "var(--accent)" : res === "E" ? "var(--muted)" : "var(--warm)";
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 22,
                        color,
                        width: 26,
                        textAlign: "center",
                      }}
                    >
                      {res}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>
                        {formatDateShort(m.data)}
                      </div>
                      <div className="lbl-serif" style={{ fontSize: 12 }}>{formatRelative(m.data)}</div>
                    </div>
                    <span className="lbl-mono">{mp.gols}G · {mp.assists}A</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>
                      {m.placarA}–{m.placarB}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </ShellWrapper>
  );
}
