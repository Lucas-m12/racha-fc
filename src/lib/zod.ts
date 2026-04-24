import { z } from "zod";

export const posicao = z.enum(["GOL", "DEF", "MEI", "ATA"]);
export const tipo = z.enum(["mensalista", "avulso"]);
export const team = z.enum(["A", "B"]);
export const matchStatus = z.enum(["agendada", "finalizada"]);
export const txTipo = z.enum(["entrada", "saida"]);
export const txCategoria = z.enum(["mensalidade", "diaria", "quadra", "material", "outros"]);

export const phone = z
  .string()
  .transform((s) => s.replace(/\D/g, ""))
  .refine((s) => s.length >= 8 && s.length <= 15, "telefone inválido");

export const cents = z.number().int().nonnegative();
export const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "formato AAAA-MM-DD");
export const uuid = z.string().uuid();

export const playerInput = z.object({
  nome: z.string().min(1).max(40),
  posicao,
  tipo,
  mensalidade: cents.default(0),
  diaria: cents,
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  telefone: phone.nullable().default(null),
  manualOvr: z.number().int().min(30).max(99).nullable().default(null),
  ativo: z.boolean().default(true),
});

export const matchInput = z.object({
  data: iso,
  local: z.string().min(1).max(80),
  custoQuadra: cents,
  observacao: z.string().max(280).default(""),
});

export const presenceInput = z.object({
  matchId: uuid,
  playerId: uuid,
  presente: z.boolean(),
});

export const scoreInput = z.object({
  matchId: uuid,
  placarA: z.number().int().min(0).max(50),
  placarB: z.number().int().min(0).max(50),
  observacao: z.string().max(280).default(""),
  players: z.array(
    z.object({
      playerId: uuid,
      gols: z.number().int().min(0).max(30),
      assists: z.number().int().min(0).max(30),
    }),
  ),
});

export const transactionInput = z.object({
  data: iso,
  tipo: txTipo,
  categoria: txCategoria,
  valor: cents.refine((n) => n > 0, "valor deve ser positivo"),
  descricao: z.string().max(160).default(""),
  playerId: uuid.nullable().default(null),
  matchId: uuid.nullable().default(null),
});

export const voteInput = z.object({
  matchId: uuid,
  votes: z
    .array(
      z.object({
        ratedId: uuid,
        score: z.number().int().min(0).max(10),
      }),
    )
    .min(1),
});

export const settingsInput = z.object({
  adminPin: z.string().regex(/^\d{4,6}$/).optional(),
  pixKey: z.string().max(120).optional(),
  pixOwner: z.string().max(80).optional(),
  maxConfirmados: z.number().int().min(2).max(40).optional(),
});

export type PlayerInput = z.infer<typeof playerInput>;
export type MatchInput = z.infer<typeof matchInput>;
export type PresenceInput = z.infer<typeof presenceInput>;
export type ScoreInput = z.infer<typeof scoreInput>;
export type TransactionInput = z.infer<typeof transactionInput>;
export type VoteInput = z.infer<typeof voteInput>;
export type SettingsInput = z.infer<typeof settingsInput>;

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: z.core.$ZodIssue[] };
