/**
 * Seed script — run with: bun run db:seed
 * Maps the prototype's string ids (p1, m-1, v1, t1) to DB UUIDs on insert.
 */
import "dotenv/config";
import { db, schema } from "./index";
import {
  SEED_PLAYERS, SEED_MATCHES, SEED_VOTES, SEED_TRANSACTIONS, SEED_SETTINGS,
} from "./seed-data";

async function main() {
  console.log("seeding…");

  // Wipe in reverse FK order
  await db.delete(schema.votes);
  await db.delete(schema.transactions);
  await db.delete(schema.matchPlayers);
  await db.delete(schema.matches);
  await db.delete(schema.players);
  await db.delete(schema.settings);

  // Players
  const playerRows = await db
    .insert(schema.players)
    .values(
      SEED_PLAYERS.map((p) => ({
        nome: p.nome,
        posicao: p.posicao,
        tipo: p.tipo,
        mensalidade: p.mensalidade,
        diaria: p.diaria,
        cor: p.cor,
        telefone: p.telefone,
        ativo: p.ativo,
        manualOvr: p.manualOvr,
      })),
    )
    .returning({ id: schema.players.id, nome: schema.players.nome });
  const playerIdBySeed = new Map<string, string>();
  for (const seed of SEED_PLAYERS) {
    const row = playerRows.find((r) => r.nome === seed.nome);
    if (row) playerIdBySeed.set(seed.id, row.id);
  }

  // Matches
  const matchRows = await db
    .insert(schema.matches)
    .values(
      SEED_MATCHES.map((m) => ({
        data: m.data,
        local: m.local,
        status: m.status,
        placarA: m.placarA,
        placarB: m.placarB,
        custoQuadra: m.custoQuadra,
        observacao: m.observacao,
      })),
    )
    .returning({ id: schema.matches.id, data: schema.matches.data, local: schema.matches.local });
  const matchIdBySeed = new Map<string, string>();
  // Match by (data, local) — unique enough in seed
  for (const seed of SEED_MATCHES) {
    const row = matchRows.find((r) => r.data === seed.data && r.local === seed.local);
    if (row) matchIdBySeed.set(seed.id, row.id);
  }

  // Match players
  const mpValues: typeof schema.matchPlayers.$inferInsert[] = [];
  for (const m of SEED_MATCHES) {
    const mId = matchIdBySeed.get(m.id);
    if (!mId) continue;
    for (const j of m.jogadores) {
      const pId = playerIdBySeed.get(j.playerId);
      if (!pId) continue;
      mpValues.push({
        matchId: mId,
        playerId: pId,
        presente: j.presente,
        time: j.time,
        gols: j.gols,
        assists: j.assists,
        pagou: j.pagou,
        confirmadoEm: j.confirmadoEm,
      });
    }
  }
  if (mpValues.length) await db.insert(schema.matchPlayers).values(mpValues);

  // Transactions
  const txValues = SEED_TRANSACTIONS.map((t) => ({
    data: t.data,
    tipo: t.tipo,
    categoria: t.categoria,
    valor: t.valor,
    descricao: t.descricao,
    matchId: t.matchId ? matchIdBySeed.get(t.matchId) ?? null : null,
    playerId: t.playerId ? playerIdBySeed.get(t.playerId) ?? null : null,
  }));
  if (txValues.length) await db.insert(schema.transactions).values(txValues);

  // Votes
  const voteValues: typeof schema.votes.$inferInsert[] = [];
  for (const v of SEED_VOTES) {
    const mId = matchIdBySeed.get(v.matchId);
    const voter = playerIdBySeed.get(v.voterId);
    const rated = playerIdBySeed.get(v.ratedId);
    if (!mId || !voter || !rated) continue;
    voteValues.push({ matchId: mId, voterId: voter, ratedId: rated, score: v.score });
  }
  if (voteValues.length) await db.insert(schema.votes).values(voteValues);

  // Settings
  await db.insert(schema.settings).values({
    id: 1,
    adminPin: SEED_SETTINGS.adminPin,
    pixKey: SEED_SETTINGS.pixKey,
    pixOwner: SEED_SETTINGS.pixOwner,
    maxConfirmados: SEED_SETTINGS.maxConfirmados,
  });

  console.log(
    `✓ players=${playerRows.length} matches=${matchRows.length} match_players=${mpValues.length} transactions=${txValues.length} votes=${voteValues.length}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
