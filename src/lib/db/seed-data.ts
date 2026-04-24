// Seed port of prototype's data.js. Money values in CENTAVOS (integer).
// Player ids here are stable strings — the seed script maps them to DB UUIDs.

import type { Posicao, Tipo, MatchStatus, Team, TxTipo, TxCategoria } from "../types";

export interface SeedPlayer {
  id: string;
  nome: string;
  posicao: Posicao;
  tipo: Tipo;
  mensalidade: number; // centavos
  diaria: number;
  cor: string;
  ativo: boolean;
  telefone: string | null;
  manualOvr: number | null;
}

export interface SeedMatchPlayer {
  playerId: string;
  presente: boolean;
  time: Team | null;
  gols: number;
  assists: number;
  pagou: boolean;
  confirmadoEm: number | null;
}

export interface SeedMatch {
  id: string;
  data: string;
  local: string;
  status: MatchStatus;
  placarA: number | null;
  placarB: number | null;
  custoQuadra: number; // centavos
  observacao: string;
  jogadores: SeedMatchPlayer[];
}

export interface SeedTx {
  id: string;
  data: string;
  tipo: TxTipo;
  categoria: TxCategoria;
  valor: number; // centavos
  descricao: string;
  matchId: string | null;
  playerId: string | null;
}

export interface SeedVote {
  id: string;
  matchId: string;
  voterId: string;
  ratedId: string;
  score: number;
}

export interface SeedSettings {
  adminPin: string;
  pixKey: string;
  pixOwner: string;
  maxConfirmados: number;
}

const R = (brl: number) => Math.round(brl * 100); // BRL → centavos

export const SEED_PLAYERS: SeedPlayer[] = [
  { id: "p1", nome: "Lucas", posicao: "MEI", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#E8FF4D", ativo: true, telefone: "11987654321", manualOvr: null },
  { id: "p2", nome: "Gabriel", posicao: "ATA", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#FF4D8B", ativo: true, telefone: "11912345678", manualOvr: null },
  { id: "p3", nome: "Adrian", posicao: "DEF", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#4D8BFF", ativo: true, telefone: "11955554444", manualOvr: null },
  { id: "p4", nome: "Zero", posicao: "GOL", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#FF5F1F", ativo: true, telefone: "11933332222", manualOvr: null },
  { id: "p5", nome: "Rafa", posicao: "MEI", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#8BFF4D", ativo: true, telefone: "11944443333", manualOvr: null },
  { id: "p6", nome: "Caio", posicao: "DEF", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#D44DFF", ativo: true, telefone: "11922221111", manualOvr: null },
  { id: "p7", nome: "Diego", posicao: "ATA", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#4DFFEA", ativo: true, telefone: "11966665555", manualOvr: null },
  { id: "p8", nome: "Pedro", posicao: "MEI", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#FFD84D", ativo: true, telefone: "11977776666", manualOvr: null },
  { id: "p9", nome: "Thiago", posicao: "GOL", tipo: "mensalista", mensalidade: R(60), diaria: R(20), cor: "#FF4D4D", ativo: true, telefone: "11988887777", manualOvr: null },
  { id: "p10", nome: "Bruno", posicao: "DEF", tipo: "avulso", mensalidade: 0, diaria: R(20), cor: "#9BFF4D", ativo: true, telefone: "11999998888", manualOvr: null },
  { id: "p11", nome: "Vitor", posicao: "ATA", tipo: "avulso", mensalidade: 0, diaria: R(20), cor: "#4DB8FF", ativo: true, telefone: "11900001111", manualOvr: null },
  { id: "p12", nome: "Matheus", posicao: "MEI", tipo: "avulso", mensalidade: 0, diaria: R(20), cor: "#FF7FD4", ativo: true, telefone: "11911112222", manualOvr: null },
  { id: "p13", nome: "João", posicao: "DEF", tipo: "avulso", mensalidade: 0, diaria: R(20), cor: "#FFA64D", ativo: true, telefone: "11922223333", manualOvr: null },
  { id: "p14", nome: "André", posicao: "ATA", tipo: "avulso", mensalidade: 0, diaria: R(20), cor: "#4DFFB8", ativo: true, telefone: "11933334444", manualOvr: null },
];

const mp = (playerId: string, opts: Partial<SeedMatchPlayer> = {}): SeedMatchPlayer => ({
  playerId,
  presente: opts.presente ?? true,
  time: opts.time ?? null,
  gols: opts.gols ?? 0,
  assists: opts.assists ?? 0,
  pagou: opts.pagou ?? true,
  confirmadoEm: opts.confirmadoEm ?? null,
});

export const SEED_MATCHES: SeedMatch[] = [
  {
    id: "m-next", data: "2026-05-01", local: "Arena Cajueiro", status: "agendada",
    placarA: null, placarB: null, custoQuadra: R(120), observacao: "",
    jogadores: [
      mp("p1", { time: "A", confirmadoEm: 1714500000001 }),
      mp("p2", { time: "A", confirmadoEm: 1714500000002 }),
      mp("p3", { time: "A", confirmadoEm: 1714500000003 }),
      mp("p4", { time: "A", confirmadoEm: 1714500000004 }),
      mp("p5", { time: "A", confirmadoEm: 1714500000005 }),
      mp("p6", { time: "A", confirmadoEm: 1714500000006 }),
      mp("p7", { time: "A", confirmadoEm: 1714500000007 }),
      mp("p8", { time: "B", confirmadoEm: 1714500000008 }),
      mp("p9", { time: "B", confirmadoEm: 1714500000009 }),
      mp("p10", { time: "B", confirmadoEm: 1714500000010 }),
      mp("p11", { time: "B", confirmadoEm: 1714500000011 }),
      mp("p12", { time: "B", confirmadoEm: 1714500000012 }),
      mp("p13", { time: "B", confirmadoEm: 1714500000013 }),
      mp("p14", { time: "B", confirmadoEm: 1714500000014 }),
    ],
  },
  {
    id: "m-1", data: "2026-04-17", local: "Arena Cajueiro", status: "finalizada",
    placarA: 6, placarB: 6, custoQuadra: R(120), observacao: "jogão, empate no último minuto",
    jogadores: [
      mp("p1", { time: "A", gols: 1, assists: 2 }),
      mp("p2", { time: "A", gols: 3, assists: 1 }),
      mp("p3", { time: "A", gols: 0, assists: 1 }),
      mp("p4", { time: "A", gols: 0, assists: 0 }),
      mp("p5", { time: "A", gols: 1, assists: 1 }),
      mp("p6", { time: "A", gols: 0, assists: 0 }),
      mp("p10", { time: "A", gols: 1, assists: 1 }),
      mp("p7", { time: "B", gols: 2, assists: 2 }),
      mp("p8", { time: "B", gols: 1, assists: 1 }),
      mp("p9", { time: "B", gols: 0, assists: 0 }),
      mp("p11", { time: "B", gols: 2, assists: 0 }),
      mp("p12", { time: "B", gols: 1, assists: 2 }),
      mp("p13", { time: "B", gols: 0, assists: 1 }),
      mp("p14", { time: "B", gols: 0, assists: 0 }),
    ],
  },
  {
    id: "m-2", data: "2026-04-10", local: "Arena Cajueiro", status: "finalizada",
    placarA: 5, placarB: 3, custoQuadra: R(120), observacao: "verde dominou no segundo tempo",
    jogadores: [
      mp("p1", { time: "A", gols: 1, assists: 2 }),
      mp("p2", { time: "A", gols: 2, assists: 1 }),
      mp("p3", { time: "A", gols: 0, assists: 0 }),
      mp("p4", { time: "A", gols: 0, assists: 0 }),
      mp("p5", { time: "A", gols: 1, assists: 0 }),
      mp("p6", { time: "A", gols: 1, assists: 1 }),
      mp("p11", { time: "A", gols: 0, assists: 1 }),
      mp("p7", { time: "B", gols: 1, assists: 1 }),
      mp("p8", { time: "B", gols: 0, assists: 1 }),
      mp("p9", { time: "B", gols: 0, assists: 0 }),
      mp("p12", { time: "B", gols: 1, assists: 0 }),
      mp("p13", { time: "B", gols: 1, assists: 0 }),
      mp("p14", { time: "B", gols: 0, assists: 1 }),
    ],
  },
  {
    id: "m-3", data: "2026-04-03", local: "Arena Cajueiro", status: "finalizada",
    placarA: 4, placarB: 5, custoQuadra: R(120), observacao: "vermelho virou faltando 3min",
    jogadores: [
      mp("p1", { time: "A", gols: 1, assists: 1 }),
      mp("p3", { time: "A", gols: 0, assists: 1 }),
      mp("p4", { time: "A", gols: 0, assists: 0 }),
      mp("p5", { time: "A", gols: 1, assists: 0 }),
      mp("p6", { time: "A", gols: 0, assists: 1 }),
      mp("p11", { time: "A", gols: 2, assists: 0 }),
      mp("p13", { time: "A", gols: 0, assists: 0 }),
      mp("p2", { time: "B", gols: 1, assists: 2 }),
      mp("p7", { time: "B", gols: 2, assists: 1 }),
      mp("p8", { time: "B", gols: 1, assists: 0 }),
      mp("p9", { time: "B", gols: 0, assists: 0 }),
      mp("p10", { time: "B", gols: 0, assists: 1 }),
      mp("p12", { time: "B", gols: 1, assists: 1 }),
    ],
  },
  {
    id: "m-4", data: "2026-03-27", local: "Arena Cajueiro", status: "finalizada",
    placarA: 7, placarB: 4, custoQuadra: R(120), observacao: "",
    jogadores: [
      mp("p1", { time: "A", gols: 2, assists: 2 }),
      mp("p2", { time: "A", gols: 3, assists: 1 }),
      mp("p3", { time: "A", gols: 0, assists: 0 }),
      mp("p4", { time: "A", gols: 0, assists: 0 }),
      mp("p5", { time: "A", gols: 1, assists: 2 }),
      mp("p12", { time: "A", gols: 1, assists: 1 }),
      mp("p7", { time: "B", gols: 2, assists: 1 }),
      mp("p8", { time: "B", gols: 1, assists: 0 }),
      mp("p9", { time: "B", gols: 0, assists: 0 }),
      mp("p6", { time: "B", gols: 1, assists: 1 }),
      mp("p11", { time: "B", gols: 0, assists: 2 }),
      mp("p14", { time: "B", gols: 0, assists: 0 }),
    ],
  },
  {
    id: "m-5", data: "2026-03-20", local: "Arena Cajueiro", status: "finalizada",
    placarA: 3, placarB: 3, custoQuadra: R(120), observacao: "chuva atrapalhou, mas jogou",
    jogadores: [
      mp("p1", { time: "A", gols: 0, assists: 1 }),
      mp("p3", { time: "A", gols: 0, assists: 0 }),
      mp("p4", { time: "A", gols: 0, assists: 0 }),
      mp("p5", { time: "A", gols: 1, assists: 1 }),
      mp("p10", { time: "A", gols: 1, assists: 0 }),
      mp("p13", { time: "A", gols: 1, assists: 1 }),
      mp("p2", { time: "B", gols: 2, assists: 1 }),
      mp("p7", { time: "B", gols: 1, assists: 1 }),
      mp("p9", { time: "B", gols: 0, assists: 0 }),
      mp("p11", { time: "B", gols: 0, assists: 1 }),
      mp("p12", { time: "B", gols: 0, assists: 0 }),
    ],
  },
];

export const SEED_VOTES: SeedVote[] = [
  { id: "v1", matchId: "m-1", voterId: "p2", ratedId: "p1", score: 9 },
  { id: "v2", matchId: "m-1", voterId: "p5", ratedId: "p1", score: 8 },
  { id: "v3", matchId: "m-1", voterId: "p7", ratedId: "p1", score: 7 },
  { id: "v4", matchId: "m-2", voterId: "p3", ratedId: "p1", score: 8 },
  { id: "v5", matchId: "m-2", voterId: "p6", ratedId: "p1", score: 9 },
  { id: "v6", matchId: "m-1", voterId: "p1", ratedId: "p2", score: 10 },
  { id: "v7", matchId: "m-1", voterId: "p3", ratedId: "p2", score: 9 },
  { id: "v8", matchId: "m-1", voterId: "p7", ratedId: "p2", score: 9 },
  { id: "v9", matchId: "m-2", voterId: "p5", ratedId: "p2", score: 8 },
  { id: "v10", matchId: "m-2", voterId: "p7", ratedId: "p2", score: 9 },
  { id: "v11", matchId: "m-1", voterId: "p1", ratedId: "p7", score: 8 },
  { id: "v12", matchId: "m-1", voterId: "p2", ratedId: "p7", score: 7 },
  { id: "v13", matchId: "m-2", voterId: "p1", ratedId: "p7", score: 7 },
  { id: "v14", matchId: "m-2", voterId: "p3", ratedId: "p7", score: 8 },
  { id: "v15", matchId: "m-1", voterId: "p1", ratedId: "p4", score: 8 },
  { id: "v16", matchId: "m-1", voterId: "p2", ratedId: "p4", score: 7 },
  { id: "v17", matchId: "m-2", voterId: "p3", ratedId: "p4", score: 9 },
  { id: "v18", matchId: "m-2", voterId: "p5", ratedId: "p4", score: 8 },
  { id: "v19", matchId: "m-1", voterId: "p1", ratedId: "p5", score: 8 },
  { id: "v20", matchId: "m-1", voterId: "p2", ratedId: "p5", score: 7 },
  { id: "v21", matchId: "m-2", voterId: "p1", ratedId: "p3", score: 6 },
  { id: "v22", matchId: "m-2", voterId: "p2", ratedId: "p3", score: 7 },
  { id: "v23", matchId: "m-1", voterId: "p1", ratedId: "p6", score: 7 },
  { id: "v24", matchId: "m-1", voterId: "p2", ratedId: "p6", score: 6 },
  { id: "v25", matchId: "m-1", voterId: "p1", ratedId: "p11", score: 8 },
  { id: "v26", matchId: "m-1", voterId: "p2", ratedId: "p11", score: 7 },
  { id: "v27", matchId: "m-1", voterId: "p1", ratedId: "p12", score: 6 },
  { id: "v28", matchId: "m-1", voterId: "p2", ratedId: "p8", score: 6 },
  { id: "v29", matchId: "m-2", voterId: "p1", ratedId: "p8", score: 7 },
  { id: "v30", matchId: "m-2", voterId: "p2", ratedId: "p9", score: 6 },
];

export const SEED_TRANSACTIONS: SeedTx[] = [
  { id: "t1", data: "2026-04-05", tipo: "entrada", categoria: "mensalidade", valor: R(60), descricao: "Mensalidade abril — Lucas", playerId: "p1", matchId: null },
  { id: "t2", data: "2026-04-05", tipo: "entrada", categoria: "mensalidade", valor: R(60), descricao: "Mensalidade abril — Gabriel", playerId: "p2", matchId: null },
  { id: "t3", data: "2026-04-06", tipo: "entrada", categoria: "mensalidade", valor: R(60), descricao: "Mensalidade abril — Adrian", playerId: "p3", matchId: null },
  { id: "t4", data: "2026-04-06", tipo: "entrada", categoria: "mensalidade", valor: R(60), descricao: "Mensalidade abril — Zero", playerId: "p4", matchId: null },
  { id: "t5", data: "2026-04-07", tipo: "entrada", categoria: "mensalidade", valor: R(60), descricao: "Mensalidade abril — Rafa", playerId: "p5", matchId: null },
  { id: "t6", data: "2026-04-08", tipo: "entrada", categoria: "mensalidade", valor: R(60), descricao: "Mensalidade abril — Caio", playerId: "p6", matchId: null },
  { id: "t7", data: "2026-04-10", tipo: "entrada", categoria: "mensalidade", valor: R(60), descricao: "Mensalidade abril — Diego", playerId: "p7", matchId: null },
  { id: "t8", data: "2026-04-17", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Bruno", playerId: "p10", matchId: "m-1" },
  { id: "t9", data: "2026-04-17", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Vitor", playerId: "p11", matchId: "m-1" },
  { id: "t10", data: "2026-04-17", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Matheus", playerId: "p12", matchId: "m-1" },
  { id: "t11", data: "2026-04-17", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — João", playerId: "p13", matchId: "m-1" },
  { id: "t12", data: "2026-04-17", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — André", playerId: "p14", matchId: "m-1" },
  { id: "t13", data: "2026-04-17", tipo: "saida", categoria: "quadra", valor: R(120), descricao: "Aluguel quadra — 17 abr", playerId: null, matchId: "m-1" },
  { id: "t14", data: "2026-04-10", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Vitor", playerId: "p11", matchId: "m-2" },
  { id: "t15", data: "2026-04-10", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Matheus", playerId: "p12", matchId: "m-2" },
  { id: "t16", data: "2026-04-10", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — João", playerId: "p13", matchId: "m-2" },
  { id: "t17", data: "2026-04-10", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — André", playerId: "p14", matchId: "m-2" },
  { id: "t18", data: "2026-04-10", tipo: "saida", categoria: "quadra", valor: R(120), descricao: "Aluguel quadra — 10 abr", playerId: null, matchId: "m-2" },
  { id: "t19", data: "2026-04-03", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Bruno", playerId: "p10", matchId: "m-3" },
  { id: "t20", data: "2026-04-03", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Vitor", playerId: "p11", matchId: "m-3" },
  { id: "t21", data: "2026-04-03", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — Matheus", playerId: "p12", matchId: "m-3" },
  { id: "t22", data: "2026-04-03", tipo: "entrada", categoria: "diaria", valor: R(20), descricao: "Diária — João", playerId: "p13", matchId: "m-3" },
  { id: "t23", data: "2026-04-03", tipo: "saida", categoria: "quadra", valor: R(120), descricao: "Aluguel quadra — 3 abr", playerId: null, matchId: "m-3" },
  { id: "t24", data: "2026-04-12", tipo: "saida", categoria: "material", valor: R(85), descricao: "Bola nova", playerId: null, matchId: null },
];

export const SEED_SETTINGS: SeedSettings = {
  adminPin: "1234",
  pixKey: "racha.cajueiro@pix.com.br",
  pixOwner: "Lucas Silva",
  maxConfirmados: 14,
};
