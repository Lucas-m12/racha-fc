type LogLevel = "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  action?: string;
  phone?: string;
  playerId?: string;
  matchId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

function maskPhone(phone: string | undefined): string | undefined {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;
  return "••••" + digits.slice(-4);
}

function emit(level: LogLevel, msg: string, ctx: LogContext = {}) {
  const payload = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...ctx,
    phone: maskPhone(ctx.phone as string | undefined),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
};

export function newRequestId(): string {
  return crypto.randomUUID();
}

export async function withTiming<T>(
  action: string,
  ctx: LogContext,
  fn: () => Promise<T>,
): Promise<T> {
  const requestId = ctx.requestId ?? newRequestId();
  const start = performance.now();
  log.info("action.start", { ...ctx, action, requestId });
  try {
    const result = await fn();
    log.info("action.ok", {
      ...ctx,
      action,
      requestId,
      durationMs: Math.round(performance.now() - start),
    });
    return result;
  } catch (err) {
    log.error("action.fail", {
      ...ctx,
      action,
      requestId,
      durationMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
