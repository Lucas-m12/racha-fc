import Link from "next/link";
import type { Player, PlayerStats } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  rank: number;
  player: Player;
  stats: PlayerStats;
}

export function ScorerRow({ rank, player, stats }: Props) {
  return (
    <Link
      href={`/jogadores/${player.id}`}
      className="scorer-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          width: 28,
          textAlign: "center",
          color: rank === 1 ? "var(--accent)" : "var(--muted)",
        }}
      >
        {rank}
      </span>
      <Avatar player={player} size={36} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{player.nome.toUpperCase()}</span>
        <span className="lbl-mono">{stats.jogos} J · {stats.assists} A</span>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>
        {stats.gols}
      </span>
    </Link>
  );
}
