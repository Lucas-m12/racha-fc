"use server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getCurrentPlayer, isAdmin } from "@/lib/auth";
import { matchInput, presenceInput, scoreInput } from "@/lib/zod";
import type { ActionResult } from "@/lib/zod";
import { withTiming } from "@/lib/log";
import { buildStatsMap, serpentineBalance } from "@/lib/stats";
import { getAll } from "@/lib/db/repo";
import { z } from "zod";

export async function createMatch(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withTiming("matches.create", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = matchInput.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const row = await db
      .insert(schema.matches)
      .values({ ...parsed.data, status: "agendada" })
      .returning({ id: schema.matches.id });
    revalidatePath("/", "layout");
    return { ok: true as const, data: { id: row[0].id } };
  });
}

const updateSchema = matchInput.partial().extend({ id: z.string().uuid() });

export async function updateMatch(input: unknown): Promise<ActionResult<null>> {
  return withTiming("matches.update", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const { id, ...patch } = parsed.data;
    await db
      .update(schema.matches)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.matches.id, id));
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function deleteMatch(id: string): Promise<ActionResult<null>> {
  return withTiming("matches.delete", { matchId: id }, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    await db.delete(schema.matches).where(eq(schema.matches.id, id));
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function togglePresence(input: unknown): Promise<ActionResult<null>> {
  return withTiming("matches.togglePresence", {}, async () => {
    const parsed = presenceInput.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const { matchId, playerId, presente } = parsed.data;

    // Self-service allowed when the current phone maps to the target player; otherwise admin.
    const admin = await isAdmin();
    if (!admin) {
      const me = await getCurrentPlayer();
      if (!me || me.id !== playerId) return { ok: false as const, error: "unauthorized" };
    }

    const existing = await db
      .select()
      .from(schema.matchPlayers)
      .where(and(eq(schema.matchPlayers.matchId, matchId), eq(schema.matchPlayers.playerId, playerId)));

    const confirmadoEm = presente ? Date.now() : null;

    if (existing.length === 0) {
      await db.insert(schema.matchPlayers).values({
        matchId, playerId, presente, confirmadoEm,
        time: null, gols: 0, assists: 0, pagou: false,
      });
    } else {
      await db
        .update(schema.matchPlayers)
        .set({
          presente,
          confirmadoEm,
          ...(presente ? {} : { time: null }),
        })
        .where(and(eq(schema.matchPlayers.matchId, matchId), eq(schema.matchPlayers.playerId, playerId)));
    }
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

const pagouSchema = z.object({ matchId: z.string().uuid(), playerId: z.string().uuid(), pagou: z.boolean() });

export async function togglePagou(input: unknown): Promise<ActionResult<null>> {
  return withTiming("matches.togglePagou", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = pagouSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const { matchId, playerId, pagou } = parsed.data;
    await db
      .update(schema.matchPlayers)
      .set({ pagou })
      .where(and(eq(schema.matchPlayers.matchId, matchId), eq(schema.matchPlayers.playerId, playerId)));
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

const teamSchema = z.object({
  matchId: z.string().uuid(),
  playerId: z.string().uuid(),
  time: z.enum(["A", "B"]).nullable(),
});

export async function assignTeam(input: unknown): Promise<ActionResult<null>> {
  return withTiming("matches.assignTeam", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = teamSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const { matchId, playerId, time } = parsed.data;
    await db
      .update(schema.matchPlayers)
      .set({ time })
      .where(and(eq(schema.matchPlayers.matchId, matchId), eq(schema.matchPlayers.playerId, playerId)));
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function sortearTimes(matchId: string): Promise<ActionResult<null>> {
  return withTiming("matches.sortearTimes", { matchId }, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const { players, matches, votes } = await getAll();
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { ok: false as const, error: "not_found" };
    const statsMap = buildStatsMap(players, matches, votes);

    const presentes = match.jogadores.filter((j) => j.presente);
    const withRating = presentes.map((j) => ({
      id: j.playerId,
      rating: statsMap[j.playerId]?.rating ?? 60,
    }));
    const assignment = serpentineBalance(withRating);

    for (const j of presentes) {
      const time = assignment[j.playerId];
      await db
        .update(schema.matchPlayers)
        .set({ time })
        .where(and(eq(schema.matchPlayers.matchId, matchId), eq(schema.matchPlayers.playerId, j.playerId)));
    }
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function saveScore(input: unknown): Promise<ActionResult<null>> {
  return withTiming("matches.saveScore", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = scoreInput.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const { matchId, placarA, placarB, observacao, players } = parsed.data;
    await db
      .update(schema.matches)
      .set({ placarA, placarB, observacao, updatedAt: new Date() })
      .where(eq(schema.matches.id, matchId));
    for (const p of players) {
      await db
        .update(schema.matchPlayers)
        .set({ gols: p.gols, assists: p.assists })
        .where(and(eq(schema.matchPlayers.matchId, matchId), eq(schema.matchPlayers.playerId, p.playerId)));
    }
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function finalizeMatch(matchId: string): Promise<ActionResult<null>> {
  return withTiming("matches.finalize", { matchId }, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const { players, matches } = await getAll();
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { ok: false as const, error: "not_found" };
    if (match.status === "finalizada") return { ok: false as const, error: "already_finalized" };
    if (match.placarA == null || match.placarB == null) {
      return { ok: false as const, error: "score_missing" };
    }

    await db
      .update(schema.matches)
      .set({ status: "finalizada", updatedAt: new Date() })
      .where(eq(schema.matches.id, matchId));

    const playerById = new Map(players.map((p) => [p.id, p]));
    const txValues: typeof schema.transactions.$inferInsert[] = [];
    for (const j of match.jogadores) {
      if (!j.presente) continue;
      const p = playerById.get(j.playerId);
      if (!p || p.tipo !== "avulso") continue;
      txValues.push({
        data: match.data,
        tipo: "entrada",
        categoria: "diaria",
        valor: p.diaria,
        descricao: `Diária — ${p.nome}`,
        playerId: p.id,
        matchId,
      });
    }
    if (match.custoQuadra > 0) {
      txValues.push({
        data: match.data,
        tipo: "saida",
        categoria: "quadra",
        valor: match.custoQuadra,
        descricao: `Aluguel quadra — ${match.data}`,
        playerId: null,
        matchId,
      });
    }
    if (txValues.length) await db.insert(schema.transactions).values(txValues);

    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}
