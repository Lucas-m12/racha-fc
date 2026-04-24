import type {
  Match,
  Player,
  PlayerStats,
  StatsMap,
  Transaction,
  Vote,
  Finance,
  PitchPosition,
  Posicao,
  Team,
} from "./types";
import { clamp, parseDate, todayInFortaleza } from "./format";

export const MIN_VOTES_FOR_OVR = 5;
const DEFAULT_PROVISIONAL_OVR = 60;

export function votesToOvr(avgScore: number): number {
  return Math.round(clamp(30 + (avgScore / 10) * 69, 30, 99));
}

export function computePlayerStats(
  playerId: string,
  matches: Match[],
  votes: Vote[],
  manualOvr: number | null,
): PlayerStats {
  let jogos = 0, gols = 0, assists = 0;
  let vitorias = 0, empates = 0, derrotas = 0, hatTricks = 0;

  for (const m of matches) {
    if (m.status !== "finalizada") continue;
    const mp = m.jogadores.find((x) => x.playerId === playerId);
    if (!mp || !mp.presente || !mp.time) continue;
    jogos++;
    gols += mp.gols;
    assists += mp.assists;
    if (mp.gols >= 3) hatTricks++;
    const myScore = mp.time === "A" ? m.placarA : m.placarB;
    const oppScore = mp.time === "A" ? m.placarB : m.placarA;
    if (myScore == null || oppScore == null) continue;
    if (myScore > oppScore) vitorias++;
    else if (myScore === oppScore) empates++;
    else derrotas++;
  }

  const ga = gols + assists;
  const aprov = jogos > 0 ? Math.round(((vitorias * 3 + empates) / (jogos * 3)) * 100) : 0;

  const myVotes = votes.filter((v) => v.ratedId === playerId);
  const voteCount = myVotes.length;
  const voteAvg = voteCount > 0 ? myVotes.reduce((s, v) => s + v.score, 0) / voteCount : 0;
  const provisional = voteCount < MIN_VOTES_FOR_OVR;

  let rating: number;
  let ratingSource: PlayerStats["ratingSource"];
  if (manualOvr != null) {
    rating = clamp(manualOvr, 30, 99);
    ratingSource = "manual";
  } else if (voteCount === 0) {
    rating = DEFAULT_PROVISIONAL_OVR;
    ratingSource = "default";
  } else {
    rating = votesToOvr(voteAvg);
    ratingSource = provisional ? "provisional" : "votes";
  }

  return {
    jogos, gols, assists, ga,
    vitorias, empates, derrotas,
    aprov, hatTricks,
    rating, ratingSource,
    voteCount,
    voteAvg: Math.round(voteAvg * 10) / 10,
    provisional,
  };
}

export function buildStatsMap(players: Player[], matches: Match[], votes: Vote[]): StatsMap {
  const map: StatsMap = {};
  for (const p of players) {
    map[p.id] = computePlayerStats(p.id, matches, votes, p.manualOvr);
  }
  return map;
}

export function splitConfirmados(match: Match, cap: number) {
  const presentes = match.jogadores
    .filter((j) => j.presente)
    .map((j, idx) => ({ j, idx }))
    .sort((a, b) => {
      const ta = a.j.confirmadoEm ?? 0;
      const tb = b.j.confirmadoEm ?? 0;
      if (ta !== tb) return ta - tb;
      return a.idx - b.idx;
    });
  return {
    confirmados: presentes.slice(0, cap).map((x) => x.j),
    espera: presentes.slice(cap).map((x) => x.j),
  };
}

export function computeFinance(
  transactions: Transaction[],
  today: Date = todayInFortaleza(),
): Finance {
  let saldo = 0, entrouMes = 0, saiuMes = 0;
  const curMonth = today.getMonth();
  const curYear = today.getFullYear();

  for (const t of transactions) {
    if (t.tipo === "entrada") saldo += t.valor;
    else saldo -= t.valor;
    const d = parseDate(t.data);
    if (d.getMonth() === curMonth && d.getFullYear() === curYear) {
      if (t.tipo === "entrada") entrouMes += t.valor;
      else saiuMes += t.valor;
    }
  }
  return { saldo, entrouMes, saiuMes };
}

export function serpentineBalance(
  playerIdsWithRating: Array<{ id: string; rating: number }>,
): Record<string, Team> {
  const sorted = [...playerIdsWithRating].sort((a, b) => b.rating - a.rating);
  const result: Record<string, Team> = {};
  sorted.forEach((p, i) => {
    const cycle = Math.floor(i / 2) % 2;
    const team: Team = (i % 2 === 0) !== (cycle === 1) ? "A" : "B";
    result[p.id] = team;
  });
  return result;
}

export function getPositions(teamPlayers: Player[], team: Team): PitchPosition[] {
  const yMap: Record<Posicao, number> =
    team === "A"
      ? { GOL: 8, DEF: 22, MEI: 34, ATA: 45 }
      : { GOL: 92, DEF: 78, MEI: 66, ATA: 55 };

  const groups: Record<Posicao, Player[]> = { GOL: [], DEF: [], MEI: [], ATA: [] };
  for (const p of teamPlayers) groups[p.posicao].push(p);

  const xForGroup = (pos: Posicao, n: number): number[] => {
    if (n === 0) return [];
    if (n === 1) return [50];
    if (n === 2) {
      if (pos === "MEI") return [14, 86];
      if (pos === "DEF" || pos === "ATA") return [37, 63];
      return [35, 65];
    }
    const padMap: Record<Posicao, number> = { GOL: 35, DEF: 28, MEI: 14, ATA: 28 };
    const pad = padMap[pos];
    const step = (100 - pad * 2) / (n - 1);
    return Array.from({ length: n }, (_, i) => pad + i * step);
  };

  const result: PitchPosition[] = [];
  for (const pos of ["GOL", "DEF", "MEI", "ATA"] as const) {
    const ps = groups[pos];
    const xs = xForGroup(pos, ps.length);
    ps.forEach((p, i) => {
      result.push({ player: p, x: xs[i], y: yMap[pos] });
    });
  }
  return result;
}

export function avgRating(players: Player[], statsMap: StatsMap): number {
  if (!players.length) return 0;
  const sum = players.reduce((s, p) => s + (statsMap[p.id]?.rating ?? 60), 0);
  return Math.round(sum / players.length);
}

export function findPlayerByPhone(players: Player[], phone: string): Player | null {
  const normalize = (s: string | null | undefined) => (s || "").replace(/\D/g, "");
  const n = normalize(phone);
  if (!n || n.length < 8) return null;
  return players.find((p) => normalize(p.telefone) === n) || null;
}
