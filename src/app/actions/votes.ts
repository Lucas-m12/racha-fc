"use server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getCurrentPlayer } from "@/lib/auth";
import { voteInput } from "@/lib/zod";
import type { ActionResult } from "@/lib/zod";
import { withTiming } from "@/lib/log";

export async function submitVotes(input: unknown): Promise<ActionResult<{ count: number }>> {
  return withTiming("votes.submit", {}, async () => {
    const parsed = voteInput.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const me = await getCurrentPlayer();
    if (!me) return { ok: false as const, error: "unauthorized" };
    const { matchId, votes } = parsed.data;

    // Voter must have been present
    const myMp = await db
      .select()
      .from(schema.matchPlayers)
      .where(and(eq(schema.matchPlayers.matchId, matchId), eq(schema.matchPlayers.playerId, me.id)));
    if (myMp.length === 0 || !myMp[0].presente) {
      return { ok: false as const, error: "must_be_present" };
    }

    // Cannot vote self; filter out defensively
    const filtered = votes.filter((v) => v.ratedId !== me.id);
    if (filtered.length === 0) return { ok: false as const, error: "empty_votes" };

    // Upsert: delete then insert this voter's votes for this match
    await db
      .delete(schema.votes)
      .where(and(eq(schema.votes.matchId, matchId), eq(schema.votes.voterId, me.id)));
    await db.insert(schema.votes).values(
      filtered.map((v) => ({
        matchId,
        voterId: me.id,
        ratedId: v.ratedId,
        score: v.score,
      })),
    );

    revalidatePath("/", "layout");
    return { ok: true as const, data: { count: filtered.length } };
  });
}
