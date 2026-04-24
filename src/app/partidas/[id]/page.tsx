import { notFound } from "next/navigation";
import { getAll } from "@/lib/db/repo";
import { buildStatsMap } from "@/lib/stats";
import { isAdmin, getCurrentPlayer } from "@/lib/auth";
import { ShellWrapper } from "../../_shell";
import { MatchDetail } from "./MatchDetail";

export const dynamic = "force-dynamic";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, admin, me] = await Promise.all([getAll(), isAdmin(), getCurrentPlayer()]);
  const match = data.matches.find((m) => m.id === id);
  if (!match) notFound();
  const statsMap = buildStatsMap(data.players, data.matches, data.votes);
  return (
    <ShellWrapper viewLabel={`partida · ${match.status}`}>
      <div className="page">
        <MatchDetail
          match={match}
          players={data.players}
          statsMap={statsMap}
          settings={data.settings}
          isAdmin={admin}
          currentPlayerId={me?.id ?? null}
          allVotes={data.votes}
        />
      </div>
    </ShellWrapper>
  );
}
