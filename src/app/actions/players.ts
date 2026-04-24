"use server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { playerInput } from "@/lib/zod";
import type { ActionResult } from "@/lib/zod";
import { withTiming } from "@/lib/log";
import { z } from "zod";

const patchSchema = playerInput.partial().extend({
  id: z.string().uuid(),
});

export async function addPlayer(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withTiming("players.add", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = playerInput.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const row = await db
      .insert(schema.players)
      .values(parsed.data)
      .returning({ id: schema.players.id });
    revalidatePath("/", "layout");
    return { ok: true as const, data: { id: row[0].id } };
  });
}

export async function updatePlayer(input: unknown): Promise<ActionResult<null>> {
  return withTiming("players.update", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = patchSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const { id, ...patch } = parsed.data;
    await db
      .update(schema.players)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.players.id, id));
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function deactivatePlayer(id: string): Promise<ActionResult<null>> {
  return withTiming("players.deactivate", { playerId: id }, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    await db
      .update(schema.players)
      .set({ ativo: false, updatedAt: new Date() })
      .where(eq(schema.players.id, id));
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}
