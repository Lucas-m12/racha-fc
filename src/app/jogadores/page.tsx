import { getAll } from "@/lib/db/repo";
import { buildStatsMap } from "@/lib/stats";
import { ShellWrapper } from "../_shell";
import { JogadoresGrid } from "./JogadoresGrid";

export const dynamic = "force-dynamic";

export default async function Jogadores() {
  const { players, matches, votes } = await getAll();
  const statsMap = buildStatsMap(players, matches, votes);
  const ativos = players.filter((p) => p.ativo);
  return (
    <ShellWrapper viewLabel="elenco">
      <div className="page">
        <JogadoresGrid players={ativos} statsMap={statsMap} />
      </div>
    </ShellWrapper>
  );
}
