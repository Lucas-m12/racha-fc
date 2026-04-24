import Link from "next/link";
import type { Player, PlayerStats } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  player: Player;
  stats: PlayerStats;
}

export function ArtilheiroDestaque({ player, stats }: Props) {
  return (
    <Link
      href={`/jogadores/${player.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 16,
        background: `linear-gradient(135deg, ${player.cor}22, transparent)`,
        border: "1px solid var(--border-hi)",
        borderRadius: "var(--radius-xl)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Avatar player={player} size={64} fontSize={22} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="lbl-mono">artilheiro do momento</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>
          {player.nome.toUpperCase()}
        </span>
        <span className="lbl-serif">
          {stats.gols} gols · {stats.assists} assists · OVR {stats.rating}
        </span>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--accent)" }}>
        {stats.gols}
      </span>
    </Link>
  );
}
