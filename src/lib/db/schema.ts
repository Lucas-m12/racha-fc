import {
  pgTable, text, integer, boolean, bigint, timestamp, date,
  pgEnum, uniqueIndex, index, primaryKey, uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const posicaoEnum = pgEnum("posicao", ["GOL", "DEF", "MEI", "ATA"]);
export const tipoEnum = pgEnum("tipo", ["mensalista", "avulso"]);
export const matchStatusEnum = pgEnum("match_status", ["agendada", "finalizada"]);
export const teamEnum = pgEnum("team", ["A", "B"]);
export const txTipoEnum = pgEnum("tx_tipo", ["entrada", "saida"]);
export const txCategoriaEnum = pgEnum("tx_categoria", [
  "mensalidade", "diaria", "quadra", "material", "outros",
]);

export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull().unique(),
    posicao: posicaoEnum("posicao").notNull(),
    tipo: tipoEnum("tipo").notNull(),
    mensalidade: integer("mensalidade").notNull().default(0), // centavos
    diaria: integer("diaria").notNull().default(0),           // centavos
    cor: text("cor").notNull(),
    telefone: text("telefone"),
    ativo: boolean("ativo").notNull().default(true),
    manualOvr: integer("manual_ovr"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    telefoneUniq: uniqueIndex("players_telefone_uniq")
      .on(t.telefone)
      .where(sql`${t.telefone} is not null`),
    ativoIdx: index("players_ativo_idx").on(t.ativo),
  }),
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    data: date("data").notNull(),
    local: text("local").notNull(),
    status: matchStatusEnum("status").notNull().default("agendada"),
    placarA: integer("placar_a"),
    placarB: integer("placar_b"),
    custoQuadra: integer("custo_quadra").notNull().default(0), // centavos
    observacao: text("observacao").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusDataIdx: index("matches_status_data_idx").on(t.status, t.data),
    dataIdx: index("matches_data_idx").on(t.data),
  }),
);

export const matchPlayers = pgTable(
  "match_players",
  {
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "restrict" }),
    presente: boolean("presente").notNull().default(false),
    time: teamEnum("time"),
    gols: integer("gols").notNull().default(0),
    assists: integer("assists").notNull().default(0),
    pagou: boolean("pagou").notNull().default(false),
    confirmadoEm: bigint("confirmado_em", { mode: "number" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.matchId, t.playerId] }),
    matchIdx: index("match_players_match_idx").on(t.matchId),
  }),
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    data: date("data").notNull(),
    tipo: txTipoEnum("tipo").notNull(),
    categoria: txCategoriaEnum("categoria").notNull(),
    valor: integer("valor").notNull(), // centavos, sempre positivo
    descricao: text("descricao").notNull().default(""),
    matchId: uuid("match_id").references(() => matches.id, { onDelete: "set null" }),
    playerId: uuid("player_id").references(() => players.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    dataIdx: index("transactions_data_idx").on(t.data),
    matchIdx: index("transactions_match_idx").on(t.matchId),
    playerIdx: index("transactions_player_idx").on(t.playerId),
  }),
);

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    voterId: uuid("voter_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    ratedId: uuid("rated_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("votes_match_voter_rated_uniq").on(t.matchId, t.voterId, t.ratedId),
    matchIdx: index("votes_match_idx").on(t.matchId),
  }),
);

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  adminPin: text("admin_pin").notNull().default("1234"),
  pixKey: text("pix_key").notNull().default(""),
  pixOwner: text("pix_owner").notNull().default(""),
  maxConfirmados: integer("max_confirmados").notNull().default(14),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PlayerRow = typeof players.$inferSelect;
export type MatchRow = typeof matches.$inferSelect;
export type MatchPlayerRow = typeof matchPlayers.$inferSelect;
export type TransactionRow = typeof transactions.$inferSelect;
export type VoteRow = typeof votes.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;
