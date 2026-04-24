"use server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { transactionInput } from "@/lib/zod";
import type { ActionResult } from "@/lib/zod";
import { withTiming } from "@/lib/log";

export async function createTransaction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withTiming("transactions.create", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = transactionInput.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const row = await db
      .insert(schema.transactions)
      .values(parsed.data)
      .returning({ id: schema.transactions.id });
    revalidatePath("/caixa");
    revalidatePath("/admin");
    return { ok: true as const, data: { id: row[0].id } };
  });
}

export async function deleteTransaction(id: string): Promise<ActionResult<null>> {
  return withTiming("transactions.delete", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
    revalidatePath("/caixa");
    revalidatePath("/admin");
    return { ok: true as const, data: null };
  });
}
