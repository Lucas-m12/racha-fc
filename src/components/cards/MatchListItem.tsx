import Link from "next/link";
import type { Match } from "@/lib/types";
import { formatDateShort, formatRelative } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

interface Props {
  match: Match;
}

export function MatchListItem({ match }: Props) {
  const final = match.status === "finalizada";
  const placar = final ? `${match.placarA}–${match.placarB}` : "—";
  return (
    <Link href={`/partidas/${match.id}`} className="match-list-item" style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="lbl-mono">{formatRelative(match.data)}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>
          {formatDateShort(match.data)}
        </span>
        <span className="lbl-serif" style={{ fontSize: 12 }}>{match.observacao || "—"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            color: final ? "var(--cream)" : "var(--muted)",
            whiteSpace: "nowrap",
          }}
        >
          {placar}
        </span>
        <Icon name="chevronRight" size={18} style={{ color: "var(--muted)" }} />
      </div>
    </Link>
  );
}
