import type { Player, StatsMap } from "@/lib/types";
import { getPositions, avgRating } from "@/lib/stats";
import { PlayerPin } from "./PlayerPin";

interface Props {
  teamA: Player[];
  teamB: Player[];
  statsMap: StatsMap;
  emptyState?: {
    title: string;
    sub?: string;
    chip?: string;
  };
}

export function PitchFormation({ teamA, teamB, statsMap, emptyState }: Props) {
  const empty = teamA.length === 0 && teamB.length === 0;
  const posA = getPositions(teamA, "A");
  const posB = getPositions(teamB, "B");

  const ovrA = avgRating(teamA, statsMap);
  const ovrB = avgRating(teamB, statsMap);

  return (
    <div className="pitch-wrap">
      <svg className="pitch-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="2" y="2" width="96" height="96" />
        <line x1="2" y1="50" x2="98" y2="50" />
        <circle cx="50" cy="50" r="8" />
        <rect x="25" y="2" width="50" height="14" />
        <rect x="25" y="84" width="50" height="14" />
      </svg>

      {!empty && (
        <>
          <div className="pitch-label-top">
            TIME VERDE <span className="ovr-badge">{ovrA}</span>
          </div>
          <div className="pitch-label-bottom">
            TIME VERMELHO <span className="ovr-badge">{ovrB}</span>
          </div>
        </>
      )}

      {posA.map((p, i) => (
        <PlayerPin
          key={p.player.id}
          player={p.player}
          rating={statsMap[p.player.id]?.rating}
          provisional={statsMap[p.player.id]?.provisional}
          x={p.x}
          y={p.y}
          teamColor="var(--team-green)"
          delay={i * 0.04}
        />
      ))}
      {posB.map((p, i) => (
        <PlayerPin
          key={p.player.id}
          player={p.player}
          rating={statsMap[p.player.id]?.rating}
          provisional={statsMap[p.player.id]?.provisional}
          x={p.x}
          y={p.y}
          teamColor="var(--team-red)"
          delay={(posA.length + i) * 0.04}
        />
      ))}

      {empty && emptyState && (
        <div className="pitch-empty">
          <div className="title">{emptyState.title}</div>
          {emptyState.sub && <div className="sub">{emptyState.sub}</div>}
          {emptyState.chip && <div className="chip">{emptyState.chip}</div>}
        </div>
      )}
    </div>
  );
}
