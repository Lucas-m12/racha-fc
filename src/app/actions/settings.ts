"use server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { settingsInput } from "@/lib/zod";
import type { ActionResult } from "@/lib/zod";
import { withTiming } from "@/lib/log";

export async function updateSettings(input: unknown): Promise<ActionResult<null>> {
  return withTiming("settings.update", {}, async () => {
    if (!(await isAdmin())) return { ok: false as const, error: "unauthorized" };
    const parsed = settingsInput.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "validation", issues: parsed.error.issues };
    const patch = { ...parsed.data, updatedAt: new Date() };
    const existing = await db.select().from(schema.settings).where(eq(schema.settings.id, 1));
    if (existing.length === 0) {
      await db.insert(schema.settings).values({
        id: 1,
        adminPin: parsed.data.adminPin ?? "1234",
        pixKey: parsed.data.pixKey ?? "",
        pixOwner: parsed.data.pixOwner ?? "",
        maxConfirmados: parsed.data.maxConfirmados ?? 14,
      });
    } else {
      await db.update(schema.settings).set(patch).where(eq(schema.settings.id, 1));
    }
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}
