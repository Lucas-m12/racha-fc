"use client";
import { useContext, useTransition } from "react";
import type { Match, Player, StatsMap, Settings } from "@/lib/types";
import { splitConfirmados } from "@/lib/stats";
import { formatDateShort, daysBetween, formatBRL } from "@/lib/format";
import { PitchFormation } from "@/components/pitch/PitchFormation";
import { Icon } from "@/components/ui/Icon";
import { AppShellContext } from "@/components/layout/AppShellContext";
import { togglePresence } from "@/app/actions/matches";
import Link from "next/link";

interface Props {
  match: Match;
  players: Player[];
  statsMap: StatsMap;
  settings: Settings;
}

export function ProximaPeladaHero({ match, players, statsMap, settings }: Props) {
  const ctx = useContext(AppShellContext);
  const [pending, start] = useTransition();

  const { confirmados, espera } = splitConfirmados(match, settings.maxConfirmados);
  const playerById = new Map(players.map((p) => [p.id, p]));

  const teamA = confirmados
    .filter((j) => j.time === "A")
    .map((j) => playerById.get(j.playerId))
    .filter((p): p is Player => !!p);
  const teamB = confirmados
    .filter((j) => j.time === "B")
    .map((j) => playerById.get(j.playerId))
    .filter((p): p is Player => !!p);

  const diff = daysBetween(match.data);
  const daysText = diff === 0 ? "HOJE" : diff > 0 ? `${diff} DIAS` : "PASSOU";

  const me = ctx?.currentPlayer;
  const myMp = me ? match.jogadores.find((j) => j.playerId === me.id) : undefined;
  const iAmConfirmed = myMp?.presente ?? false;

  const diariaBRL = me?.tipo === "avulso"
    ? formatBRL(me.diaria / 100)
    : formatBRL((playerById.get(confirmados[0]?.playerId ?? "")?.diaria ?? 2000) / 100);

  const handleTogglePresence = () => {
    if (!me) {
      ctx?.openModal("phoneLogin");
      return;
    }
    start(async () => {
      const res = await togglePresence({
        matchId: match.id,
        playerId: me.id,
        presente: !iAmConfirmed,
      });
      if (res.ok && !iAmConfirmed && me.tipo === "avulso") {
        ctx?.openModal("pix");
      }
    });
  };

  return (
    <section className="hero-match">
      <div className="hero-match-head">
        <div className="left">
          <div className="lbl">próxima pelada</div>
          <div className={`days ${diff === 0 ? "today" : ""}`}>{daysText}</div>
          <div className="date-line">{formatDateShort(match.data)} · {match.local}</div>
        </div>
        <div className="right">
          <div className="lbl">confirmados</div>
          <div className="count">{confirmados.length}</div>
          <div className="split">
            cap. {settings.maxConfirmados}
            {espera.length > 0 && ` +${espera.length}`}
          </div>
        </div>
      </div>

      <div className="hero-match-pitch">
        <PitchFormation
          teamA={teamA}
          teamB={teamB}
          statsMap={statsMap}
          emptyState={{
            title: "ESCALAÇÃO EM BREVE",
            sub: "aguardando sorteio dos times",
            chip: `${confirmados.length} de ${settings.maxConfirmados}`,
          }}
        />
      </div>

      <div style={{ padding: "10px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className={`btn-block ${iAmConfirmed ? "" : "primary"}`}
          disabled={pending}
          onClick={handleTogglePresence}
          style={{ flex: 1, minWidth: 140 }}
        >
          {pending
            ? "..."
            : iAmConfirmed
              ? "CANCELAR PRESENÇA"
              : me
                ? `CONFIRMAR · ${diariaBRL}`
                : "CONFIRMAR PRESENÇA"}
        </button>
        {iAmConfirmed && me?.tipo === "avulso" && !myMp?.pagou && (
          <button
            type="button"
            className="btn-block primary"
            onClick={() => ctx?.openModal("pix")}
            style={{ flex: 1, minWidth: 140 }}
          >
            PAGAR PIX
          </button>
        )}
      </div>

      <Link
        href={`/partidas/${match.id}`}
        className="hero-match-cta"
        style={{ textDecoration: "none" }}
      >
        <span className="location">
          <Icon name="mapPin" size={14} /> {match.local}
        </span>
        <span className="cta-txt">
          ESCALAÇÃO <Icon name="chevronRight" size={12} />
        </span>
      </Link>
    </section>
  );
}
