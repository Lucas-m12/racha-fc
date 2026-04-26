import { getAll } from "@/lib/db/repo";
import { buildStatsMap } from "@/lib/stats";
import { isAdmin } from "@/lib/auth";
import { ShellWrapper } from "../_shell";
import { ProximaPeladaHero } from "@/components/cards/ProximaPeladaHero";
import { MatchListItem } from "@/components/cards/MatchListItem";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

export default async function Partidas() {
  const { players, matches, votes, settings } = await getAll();
  const statsMap = buildStatsMap(players, matches, votes);
  const admin = await isAdmin();
  const proxima =
    matches
      .filter((m) => m.status === "agendada")
      .sort((a, b) => a.data.localeCompare(b.data))[0] ?? null;
  const finalizadas = matches.filter((m) => m.status === "finalizada");

  return (
    <ShellWrapper viewLabel="partidas">
      <div className="page">
        {proxima && (
          <ProximaPeladaHero
            match={proxima}
            players={players}
            statsMap={statsMap}
            settings={settings}
          />
        )}
        <section>
          <SectionHeader title="HISTÓRICO" sub={`${finalizadas.length} partidas`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {finalizadas.map((m) => <MatchListItem key={m.id} match={m} />)}
          </div>
        </section>
        {admin && (
          <p className="lbl-serif" style={{ color: "var(--muted)", textAlign: "center" }}>
            use o admin pra criar novas partidas
          </p>
        )}
      </div>
    </ShellWrapper>
  );
}
