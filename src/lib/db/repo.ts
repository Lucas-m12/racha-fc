import "server-only";
import { db, schema } from "./index";
import { eq, desc } from "drizzle-orm";
import type {
  Player, Match, MatchPlayer, Transaction, Vote, Settings,
} from "../types";

function mapPlayer(r: typeof schema.players.$inferSelect): Player {
  return {
    id: r.id,
    nome: r.nome,
    posicao: r.posicao,
    tipo: r.tipo,
    mensalidade: r.mensalidade,
    diaria: r.diaria,
    cor: r.cor,
    telefone: r.telefone,
    ativo: r.ativo,
    manualOvr: r.manualOvr,
  };
}

function mapMatchPlayer(r: typeof schema.matchPlayers.$inferSelect): MatchPlayer {
  return {
    playerId: r.playerId,
    presente: r.presente,
    time: r.time,
    gols: r.gols,
    assists: r.assists,
    pagou: r.pagou,
    confirmadoEm: r.confirmadoEm,
  };
}

function mapTransaction(r: typeof schema.transactions.$inferSelect): Transaction {
  return {
    id: r.id,
    data: r.data,
    tipo: r.tipo,
    categoria: r.categoria,
    valor: r.valor,
    descricao: r.descricao,
    matchId: r.matchId,
    playerId: r.playerId,
  };
}

function mapVote(r: typeof schema.votes.$inferSelect): Vote {
  return {
    id: r.id,
    matchId: r.matchId,
    voterId: r.voterId,
    ratedId: r.ratedId,
    score: r.score,
  };
}

export async function getPlayers(): Promise<Player[]> {
  const rows = await db.select().from(schema.players);
  return rows.map(mapPlayer);
}

export async function getMatches(): Promise<Match[]> {
  const matchRows = await db
    .select()
    .from(schema.matches)
    .orderBy(desc(schema.matches.data));
  const mpRows = await db.select().from(schema.matchPlayers);
  const mpByMatch = new Map<string, MatchPlayer[]>();
  for (const mp of mpRows) {
    const arr = mpByMatch.get(mp.matchId) ?? [];
    arr.push(mapMatchPlayer(mp));
    mpByMatch.set(mp.matchId, arr);
  }
  return matchRows.map((m) => ({
    id: m.id,
    data: m.data,
    local: m.local,
    status: m.status,
    placarA: m.placarA,
    placarB: m.placarB,
    custoQuadra: m.custoQuadra,
    observacao: m.observacao,
    jogadores: mpByMatch.get(m.id) ?? [],
  }));
}

export async function getTransactions(): Promise<Transaction[]> {
  const rows = await db
    .select()
    .from(schema.transactions)
    .orderBy(desc(schema.transactions.data));
  return rows.map(mapTransaction);
}

export async function getVotes(): Promise<Vote[]> {
  const rows = await db.select().from(schema.votes);
  return rows.map(mapVote);
}

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1));
  if (rows.length === 0) {
    return { adminPin: "1234", pixKey: "", pixOwner: "", maxConfirmados: 14 };
  }
  const r = rows[0];
  return {
    adminPin: r.adminPin,
    pixKey: r.pixKey,
    pixOwner: r.pixOwner,
    maxConfirmados: r.maxConfirmados,
  };
}

export async function getAll() {
  const [players, matches, transactions, votes, settings] = await Promise.all([
    getPlayers(),
    getMatches(),
    getTransactions(),
    getVotes(),
    getSettings(),
  ]);
  return { players, matches, transactions, votes, settings };
}
