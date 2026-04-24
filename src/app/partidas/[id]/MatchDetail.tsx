"use client";
import { useState, useTransition } from "react";
import type { Match, Player, StatsMap, Settings, Vote } from "@/lib/types";
import { splitConfirmados } from "@/lib/stats";
import { formatDateLong, formatBRL } from "@/lib/format";
import { PitchFormation } from "@/components/pitch/PitchFormation";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import {
  togglePresence, togglePagou, assignTeam, sortearTimes, saveScore, finalizeMatch,
} from "@/app/actions/matches";
import { submitVotes } from "@/app/actions/votes";

interface Props {
  match: Match;
  players: Player[];
  statsMap: StatsMap;
  settings: Settings;
  isAdmin: boolean;
  currentPlayerId: string | null;
  allVotes: Vote[];
}

type Tab = "presenca" | "times" | "placar";

export function MatchDetail({
  match, players, statsMap, settings, isAdmin, currentPlayerId, allVotes,
}: Props) {
  const [tab, setTab] = useState<Tab>(match.status === "finalizada" ? "placar" : "presenca");
  const [pending, start] = useTransition();
  const [placarA, setPlacarA] = useState(match.placarA ?? 0);
  const [placarB, setPlacarB] = useState(match.placarB ?? 0);
  const [observacao, setObservacao] = useState(match.observacao);
  const [playerScores, setPlayerScores] = useState(() => {
    const map: Record<string, { gols: number; assists: number }> = {};
    for (const j of match.jogadores) {
      map[j.playerId] = { gols: j.gols, assists: j.assists };
    }
    return map;
  });

  const playerById = new Map(players.map((p) => [p.id, p]));
  const { confirmados } = splitConfirmados(match, settings.maxConfirmados);

  const teamA = confirmados
    .filter((j) => j.time === "A")
    .map((j) => playerById.get(j.playerId))
    .filter((p): p is Player => !!p);
  const teamB = confirmados
    .filter((j) => j.time === "B")
    .map((j) => playerById.get(j.playerId))
    .filter((p): p is Player => !!p);

  const isFinalized = match.status === "finalizada";
  const readOnly = isFinalized && !isAdmin;

  const handleToggle = (playerId: string, presente: boolean) => {
    start(async () => {
      await togglePresence({ matchId: match.id, playerId, presente });
    });
  };

  const handlePagou = (playerId: string, pagou: boolean) => {
    start(async () => {
      await togglePagou({ matchId: match.id, playerId, pagou });
    });
  };

  const handleAssign = (playerId: string, time: "A" | "B" | null) => {
    start(async () => {
      await assignTeam({ matchId: match.id, playerId, time });
    });
  };

  const handleSortear = () => {
    start(async () => {
      await sortearTimes(match.id);
    });
  };

  const handleSaveScore = () => {
    start(async () => {
      await saveScore({
        matchId: match.id,
        placarA,
        placarB,
        observacao,
        players: Object.entries(playerScores).map(([playerId, s]) => ({
          playerId,
          gols: s.gols,
          assists: s.assists,
        })),
      });
    });
  };

  const handleFinalize = () => {
    if (!confirm("Finalizar rodada? Isso gera lançamentos de diária e quadra.")) return;
    start(async () => {
      await saveScore({
        matchId: match.id,
        placarA,
        placarB,
        observacao,
        players: Object.entries(playerScores).map(([playerId, s]) => ({
          playerId,
          gols: s.gols,
          assists: s.assists,
        })),
      });
      await finalizeMatch(match.id);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div className={`lbl-mono ${isFinalized ? "" : ""}`} style={{ color: isFinalized ? "var(--muted)" : "var(--accent)" }}>
            {match.status}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
            {formatDateLong(match.data)}
          </div>
          <div className="lbl-serif">{match.local}</div>
        </div>
        {isFinalized && (
          <div style={{ textAlign: "right" }}>
            <div className="lbl-mono">placar</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 44, whiteSpace: "nowrap" }}>
              {match.placarA}–{match.placarB}
            </div>
          </div>
        )}
      </header>

      <div className="modal-tabs" style={{ position: "static", background: "transparent" }}>
        {(["presenca", "times", "placar"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t === "presenca" ? "PRESENÇA" : t === "times" ? "TIMES" : "PLACAR"}
          </button>
        ))}
      </div>

      {tab === "presenca" && (
        <PresencaTab
          match={match}
          players={players}
          settings={settings}
          isAdmin={isAdmin}
          readOnly={readOnly}
          currentPlayerId={currentPlayerId}
          onToggle={handleToggle}
          onTogglePagou={handlePagou}
          pending={pending}
        />
      )}

      {tab === "times" && (
        <>
          <PitchFormation
            teamA={teamA}
            teamB={teamB}
            statsMap={statsMap}
            emptyState={{
              title: "SEM TIMES AINDA",
              sub: "sorteia ou monte manualmente",
              chip: `${confirmados.length} presentes`,
            }}
          />
          {isAdmin && !isFinalized && (
            <>
              <button type="button" className="btn-block primary" disabled={pending} onClick={handleSortear}>
                <Icon name="shuffle" size={16} /> SORTEAR BALANCEADO
              </button>
              <p className="lbl-serif" style={{ color: "var(--muted)" }}>
                toque em um jogador pra alternar time manualmente
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {confirmados.map((j) => {
                  const p = playerById.get(j.playerId);
                  if (!p) return null;
                  const next: "A" | "B" | null = j.time === "A" ? "B" : j.time === "B" ? null : "A";
                  return (
                    <button
                      key={j.playerId}
                      type="button"
                      onClick={() => handleAssign(j.playerId, next)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: 10,
                        background: "var(--surface)",
                        border: `1px solid ${j.time === "A" ? "var(--team-green)" : j.time === "B" ? "var(--team-red)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)",
                      }}
                    >
                      <Avatar player={p} size={30} fontSize={11} />
                      <span style={{ flex: 1, textAlign: "left" }}>{p.nome}</span>
                      <span className="lbl-mono">
                        {j.time === "A" ? "VERDE" : j.time === "B" ? "VERMELHO" : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {tab === "placar" && (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
            <ScoreBox label="VERDE" color="var(--team-green)" value={placarA} setValue={setPlacarA} readOnly={readOnly} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>×</span>
            <ScoreBox label="VERMELHO" color="var(--team-red)" value={placarB} setValue={setPlacarB} readOnly={readOnly} />
          </div>

          <SectionHeader title="ESTATÍSTICAS" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {confirmados.map((j) => {
              const p = playerById.get(j.playerId);
              if (!p) return null;
              const s = playerScores[j.playerId] ?? { gols: 0, assists: 0 };
              return (
                <div
                  key={j.playerId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <Avatar player={p} size={30} fontSize={11} />
                  <span style={{ flex: 1 }}>{p.nome}</span>
                  <Stepper
                    label="G"
                    value={s.gols}
                    onChange={(v) => setPlayerScores((m) => ({ ...m, [j.playerId]: { ...s, gols: v } }))}
                    disabled={readOnly}
                  />
                  <Stepper
                    label="A"
                    value={s.assists}
                    onChange={(v) => setPlayerScores((m) => ({ ...m, [j.playerId]: { ...s, assists: v } }))}
                    disabled={readOnly}
                  />
                </div>
              );
            })}
          </div>

          <label className="field">
            <span className="lbl-mono">Observação</span>
            <textarea
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              disabled={readOnly}
            />
          </label>

          {isAdmin && !isFinalized && (
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn-block" onClick={handleSaveScore} disabled={pending}>
                SALVAR
              </button>
              <button type="button" className="btn-block primary" onClick={handleFinalize} disabled={pending}>
                FINALIZAR RODADA
              </button>
            </div>
          )}

          {isFinalized && currentPlayerId && (
            <VotingSection
              match={match}
              players={players}
              currentPlayerId={currentPlayerId}
              allVotes={allVotes}
            />
          )}

          {isAdmin && isFinalized && (
            <p className="lbl-serif" style={{ color: "var(--muted)", textAlign: "center" }}>
              custo quadra: {formatBRL(match.custoQuadra / 100)}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ScoreBox({
  label, color, value, setValue, readOnly,
}: { label: string; color: string; value: number; setValue: (n: number) => void; readOnly: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span className="lbl-mono" style={{ color }}>{label}</span>
      <input
        type="number"
        min={0}
        max={50}
        disabled={readOnly}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          width: 80,
          textAlign: "center",
          fontFamily: "var(--font-display)",
          fontSize: 44,
          background: "var(--surface)",
          border: `1px solid ${color}`,
          borderRadius: "var(--radius-lg)",
          color: "var(--cream)",
          padding: 8,
        }}
      />
    </div>
  );
}

function Stepper({
  label, value, onChange, disabled,
}: { label: string; value: number; onChange: (n: number) => void; disabled: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <button
        type="button"
        disabled={disabled || value === 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="btn-tiny"
        style={{ width: 28 }}
      >
        −
      </button>
      <span
        style={{
          width: 30,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
        }}
      >
        {value}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="btn-tiny"
        style={{ width: 28 }}
      >
        +
      </button>
      <span className="lbl-mono" style={{ marginLeft: 4 }}>{label}</span>
    </div>
  );
}

function PresencaTab({
  match, players, settings, isAdmin, readOnly, currentPlayerId, onToggle, onTogglePagou, pending,
}: {
  match: Match;
  players: Player[];
  settings: Settings;
  isAdmin: boolean;
  readOnly: boolean;
  currentPlayerId: string | null;
  onToggle: (playerId: string, presente: boolean) => void;
  onTogglePagou: (playerId: string, pagou: boolean) => void;
  pending: boolean;
}) {
  const { confirmados, espera } = splitConfirmados(match, settings.maxConfirmados);
  const presentIds = new Set(match.jogadores.filter((j) => j.presente).map((j) => j.playerId));
  const ativos = players.filter((p) => p.ativo);

  const renderRow = (playerId: string, waitlist = false, pos?: number) => {
    const p = players.find((x) => x.id === playerId);
    if (!p) return null;
    const mp = match.jogadores.find((j) => j.playerId === playerId);
    const canToggle = !readOnly && (isAdmin || p.id === currentPlayerId);
    const checked = mp?.presente ?? false;
    return (
      <div
        key={playerId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: 10,
          background: "var(--surface)",
          border: `1px solid ${waitlist ? "var(--warm)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
        }}
      >
        {waitlist && pos != null && (
          <span className="lbl-mono" style={{ color: "var(--warm)", width: 20 }}>#{pos}</span>
        )}
        <Avatar player={p} size={30} fontSize={11} />
        <div style={{ flex: 1 }}>
          <div>{p.nome}</div>
          <div className="lbl-mono">{p.posicao} · {p.tipo}</div>
        </div>
        {isAdmin && mp?.presente && p.tipo === "avulso" && (
          <button
            type="button"
            onClick={() => onTogglePagou(p.id, !mp.pagou)}
            disabled={pending}
            className="btn-tiny"
            style={{ color: mp.pagou ? "#000" : "var(--warm)", background: mp.pagou ? "var(--accent)" : "var(--surface)", borderColor: mp.pagou ? "var(--accent)" : "var(--warm)" }}
          >
            {mp.pagou ? "PAGO" : "R$"}
          </button>
        )}
        <button
          type="button"
          disabled={!canToggle || pending}
          onClick={() => onToggle(p.id, !checked)}
          className={`btn-tiny ${checked ? "" : ""}`}
          style={{
            background: checked ? "var(--accent)" : "var(--surface)",
            color: checked ? "#000" : "var(--cream)",
            borderColor: checked ? "var(--accent)" : "var(--border)",
            minWidth: 60,
          }}
        >
          {checked ? "VEM" : "—"}
        </button>
      </div>
    );
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", justifyContent: "space-between" }}>
        <SectionHeader title={`CONFIRMADOS · ${confirmados.length}/${settings.maxConfirmados}`} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {confirmados.map((j) => renderRow(j.playerId))}
        {confirmados.length === 0 && (
          <p className="lbl-serif" style={{ textAlign: "center", color: "var(--muted)" }}>
            ninguém confirmou ainda
          </p>
        )}
      </div>

      {espera.length > 0 && (
        <>
          <SectionHeader title="LISTA DE ESPERA" sub={`${espera.length} aguardando`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {espera.map((j, i) => renderRow(j.playerId, true, i + 1))}
          </div>
        </>
      )}

      {(isAdmin || currentPlayerId) && (
        <>
          <SectionHeader title="NÃO CONFIRMADOS" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ativos.filter((p) => !presentIds.has(p.id)).map((p) => renderRow(p.id))}
          </div>
        </>
      )}
    </>
  );
}

function VotingSection({
  match, players, currentPlayerId, allVotes,
}: {
  match: Match;
  players: Player[];
  currentPlayerId: string;
  allVotes: Vote[];
}) {
  const [pending, start] = useTransition();
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const mine = allVotes.filter((v) => v.matchId === match.id && v.voterId === currentPlayerId);
    return Object.fromEntries(mine.map((v) => [v.ratedId, v.score]));
  });
  const [saved, setSaved] = useState(false);

  const myPresence = match.jogadores.find((j) => j.playerId === currentPlayerId);
  if (!myPresence?.presente) {
    return (
      <p className="lbl-serif" style={{ color: "var(--muted)", textAlign: "center" }}>
        só quem jogou pode votar
      </p>
    );
  }

  const others = match.jogadores
    .filter((j) => j.presente && j.playerId !== currentPlayerId)
    .map((j) => players.find((p) => p.id === j.playerId))
    .filter((p): p is Player => !!p);

  const handleSubmit = () => {
    const votes = Object.entries(scores).map(([ratedId, score]) => ({ ratedId, score }));
    if (votes.length === 0) return;
    start(async () => {
      const res = await submitVotes({ matchId: match.id, votes });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  return (
    <section>
      <SectionHeader title="VOTAÇÃO" sub="nota 0 a 10 pros parças" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {others.map((p) => {
          const val = scores[p.id] ?? 5;
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 10,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <Avatar player={p} size={30} fontSize={11} />
              <span style={{ flex: 1 }}>{p.nome}</span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={scores[p.id] ?? 5}
                onChange={(e) => setScores((m) => ({ ...m, [p.id]: Number(e.target.value) }))}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: val >= 8 ? "var(--accent)" : val <= 4 ? "var(--warm)" : "var(--cream)",
                  width: 28,
                  textAlign: "center",
                }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="btn-block primary"
        disabled={pending || Object.keys(scores).length === 0}
        onClick={handleSubmit}
        style={{ marginTop: 10 }}
      >
        {saved ? "VOTOS REGISTRADOS" : pending ? "ENVIANDO…" : "ENVIAR VOTOS"}
      </button>
    </section>
  );
}
