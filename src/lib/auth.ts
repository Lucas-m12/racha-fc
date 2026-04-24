import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import type { Player } from "./types";
import { findPlayerByPhone } from "./stats";

export interface Session {
  phone?: string;
  adminUnlockedAt?: number; // epoch ms
}

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function sessionOptions(): SessionOptions {
  const password = process.env.COOKIE_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "COOKIE_SECRET must be set and at least 32 chars long (add it to .env.local)",
    );
  }
  return {
    password,
    cookieName: "fc_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS,
    },
  };
}

export async function getSession(): Promise<IronSession<Session>> {
  const cookieStore = await cookies();
  return getIronSession<Session>(cookieStore, sessionOptions());
}

export async function getCurrentPhone(): Promise<string | null> {
  const session = await getSession();
  return session.phone ?? null;
}

export async function getCurrentPlayer(): Promise<Player | null> {
  const phone = await getCurrentPhone();
  if (!phone) return null;
  const rows = await db.select().from(schema.players).where(eq(schema.players.ativo, true));
  const mapped: Player[] = rows.map(rowToPlayer);
  return findPlayerByPhone(mapped, phone);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session.adminUnlockedAt) return false;
  const age = Date.now() - session.adminUnlockedAt;
  return age < THIRTY_DAYS * 1000;
}

export function rowToPlayer(r: typeof schema.players.$inferSelect): Player {
  return {
    id: r.id,
    nome: r.nome,
    posicao: r.posicao,
    tipo: r.tipo,
    mensalidade: r.mensalidade,
    diaria: r.diaria,
    cor: r.cor,
    ativo: r.ativo,
    telefone: r.telefone,
    manualOvr: r.manualOvr,
  };
}
