export type Posicao = "GOL" | "DEF" | "MEI" | "ATA";
export type Tipo = "mensalista" | "avulso";
export type MatchStatus = "agendada" | "finalizada";
export type Team = "A" | "B";
export type TxTipo = "entrada" | "saida";
export type TxCategoria = "mensalidade" | "diaria" | "quadra" | "material" | "outros";

export interface Player {
  id: string;
  nome: string;
  posicao: Posicao;
  tipo: Tipo;
  mensalidade: number;
  diaria: number;
  cor: string;
  ativo: boolean;
  telefone: string | null;
  manualOvr: number | null;
}

export interface MatchPlayer {
  playerId: string;
  presente: boolean;
  time: Team | null;
  gols: number;
  assists: number;
  pagou: boolean;
  confirmadoEm: number | null;
}

export interface Match {
  id: string;
  data: string; // YYYY-MM-DD
  local: string;
  status: MatchStatus;
  placarA: number | null;
  placarB: number | null;
  custoQuadra: number;
  observacao: string;
  jogadores: MatchPlayer[];
}

export interface Transaction {
  id: string;
  data: string;
  tipo: TxTipo;
  categoria: TxCategoria;
  valor: number;
  descricao: string;
  matchId: string | null;
  playerId: string | null;
}

export interface Vote {
  id: string;
  matchId: string;
  voterId: string;
  ratedId: string;
  score: number; // 0..10
}

export interface Settings {
  adminPin: string;
  pixKey: string;
  pixOwner: string;
  maxConfirmados: number;
}

export interface PlayerStats {
  jogos: number;
  gols: number;
  assists: number;
  ga: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  aprov: number;
  hatTricks: number;
  rating: number;
  ratingSource: "manual" | "default" | "provisional" | "votes";
  voteCount: number;
  voteAvg: number;
  provisional: boolean;
}

export type StatsMap = Record<string, PlayerStats>;

export interface Finance {
  saldo: number;
  entrouMes: number;
  saiuMes: number;
}

export interface PitchPosition {
  player: Player;
  x: number;
  y: number;
}
