"use server";
import { revalidatePath } from "next/cache";
import { getSession, isAdmin as readIsAdmin } from "@/lib/auth";
import { getPlayers, getSettings } from "@/lib/db/repo";
import { findPlayerByPhone } from "@/lib/stats";
import { phone as phoneSchema } from "@/lib/zod";
import { withTiming } from "@/lib/log";
import type { ActionResult } from "@/lib/zod";

export async function loginByPhone(phoneInput: string): Promise<ActionResult<{ playerId: string; nome: string }>> {
  return withTiming("auth.loginByPhone", { phone: phoneInput }, async () => {
    const parsed = phoneSchema.safeParse(phoneInput);
    if (!parsed.success) {
      return { ok: false as const, error: "validation", issues: parsed.error.issues };
    }
    const players = await getPlayers();
    const player = findPlayerByPhone(players, parsed.data);
    if (!player) return { ok: false as const, error: "not_found" };
    const session = await getSession();
    session.phone = parsed.data;
    await session.save();
    revalidatePath("/", "layout");
    return { ok: true as const, data: { playerId: player.id, nome: player.nome } };
  });
}

export async function logout(): Promise<ActionResult<null>> {
  return withTiming("auth.logout", {}, async () => {
    const session = await getSession();
    session.destroy();
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function unlockAdmin(pin: string): Promise<ActionResult<null>> {
  return withTiming("auth.unlockAdmin", {}, async () => {
    const settings = await getSettings();
    if (pin !== settings.adminPin) {
      return { ok: false as const, error: "invalid_pin" };
    }
    const session = await getSession();
    session.adminUnlockedAt = Date.now();
    await session.save();
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function lockAdmin(): Promise<ActionResult<null>> {
  return withTiming("auth.lockAdmin", {}, async () => {
    const session = await getSession();
    session.adminUnlockedAt = undefined;
    await session.save();
    revalidatePath("/", "layout");
    return { ok: true as const, data: null };
  });
}

export async function whoami() {
  const session = await getSession();
  const admin = await readIsAdmin();
  return { phone: session.phone ?? null, isAdmin: admin };
}
