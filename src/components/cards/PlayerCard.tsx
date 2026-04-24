import Link from "next/link";
import type { Player, PlayerStats } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { POS_COLORS } from "@/lib/format";

interface Props {
  player: Player;
  stats: PlayerStats;
}

export function PlayerCard({ player, stats }: Props) {
  return (
    <Link href={`/jogadores/${player.id}`} className="player-card" style={{ textDecoration: "none" }}>
      <div className="player-card-head">
        <span className="pos" style={{ color: POS_COLORS[player.posicao] }}>
          {player.posicao}
        </span>
        <div className="ovr" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span>{stats.rating}</span>
          {stats.provisional && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--muted)",
                letterSpacing: "0.1em",
              }}
            >
              PROV
            </span>
          )}
        </div>
      </div>
      <Avatar player={player} size={64} fontSize={22} />
      <div className="name" style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 10 }}>
        {player.nome.toUpperCase()}
      </div>
      <div className="stats">
        <div className="s"><span className="lbl">J</span><span className="val">{stats.jogos}</span></div>
        <div className="s gols"><span className="lbl">G</span><span className="val">{stats.gols}</span></div>
        <div className="s"><span className="lbl">A</span><span className="val">{stats.assists}</span></div>
        <div className="s"><span className="lbl">V%</span><span className="val">{stats.aprov}</span></div>
      </div>
    </Link>
  );
}
