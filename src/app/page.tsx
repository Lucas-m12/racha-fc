import { getAll } from "@/lib/db/repo";
import { buildStatsMap, computeFinance } from "@/lib/stats";
import { formatBRL } from "@/lib/format";
import { ShellWrapper } from "./_shell";
import { ProximaPeladaHero } from "@/components/cards/ProximaPeladaHero";
import { ArtilheiroDestaque } from "@/components/cards/ArtilheiroDestaque";
import { MatchListItem } from "@/components/cards/MatchListItem";
import { ScorerRow } from "@/components/cards/ScorerRow";
import { StatBlock } from "@/components/ui/StatBlock";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { isAdmin } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { players, matches, transactions, votes, settings } = await getAll();
  const statsMap = buildStatsMap(players, matches, votes);
  const finance = computeFinance(transactions);
  const admin = await isAdmin();

  // matches comes desc — the closest future agendada is the LAST one in date order.
  const proxima =
    matches
      .filter((m) => m.status === "agendada")
      .sort((a, b) => a.data.localeCompare(b.data))[0] ?? null;
  const finalizadas = matches.filter((m) => m.status === "finalizada");
  const recentes = finalizadas.slice(0, 3);

  const artilheiros = players
    .filter((p) => p.ativo)
    .map((p) => ({ player: p, stats: statsMap[p.id] }))
    .filter((x) => x.stats && x.stats.gols > 0)
    .sort((a, b) => b.stats.gols - a.stats.gols || b.stats.assists - a.stats.assists);
  const artilheiro = artilheiros[0];
  const topScorers = artilheiros.slice(0, 5);

  return (
    <ShellWrapper viewLabel="início">
      <div className="page">
        {proxima && (
          <ProximaPeladaHero
            match={proxima}
            players={players}
            statsMap={statsMap}
            settings={settings}
          />
        )}

        {admin && (
          <div className="stats-grid">
            <StatBlock label="SALDO" value={formatBRL(finance.saldo / 100)} big color="var(--accent)" />
            <StatBlock
              label="ENTROU"
              value={formatBRL(finance.entrouMes / 100)}
              color="var(--accent)"
              icon={<Icon name="arrowUpRight" size={12} />}
            />
            <StatBlock
              label="SAIU"
              value={formatBRL(finance.saiuMes / 100)}
              color="var(--warm)"
              icon={<Icon name="arrowDownRight" size={12} />}
            />
          </div>
        )}

        {artilheiro && (
          <section>
            <ArtilheiroDestaque player={artilheiro.player} stats={artilheiro.stats} />
          </section>
        )}

        {recentes.length > 0 && (
          <section>
            <SectionHeader title="ÚLTIMOS RESULTADOS" sub={`${recentes.length} jogos`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentes.map((m) => <MatchListItem key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {topScorers.length > 0 && (
          <section>
            <SectionHeader title="TOP ARTILHEIROS" sub="temporada" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topScorers.map((x, i) => (
                <ScorerRow key={x.player.id} rank={i + 1} player={x.player} stats={x.stats} />
              ))}
            </div>
          </section>
        )}
      </div>
    </ShellWrapper>
  );
}
