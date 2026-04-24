"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { Player } from "@/lib/types";
import { initials, isColorLight } from "@/lib/format";

interface PlayerPinProps {
  player: Player;
  rating?: number;
  x: number; // 0..100
  y: number; // 0..100
  teamColor: string;
  delay?: number;
  provisional?: boolean;
}

export function PlayerPin({ player, rating, x, y, teamColor, delay = 0, provisional = false }: PlayerPinProps) {
  const reduce = useReducedMotion();
  const light = isColorLight(player.cor);
  return (
    <motion.div
      className="player-pin"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 14, delay }}
    >
      <div
        className="pin-avatar"
        style={{
          background: player.cor,
          color: light ? "#0E0D0B" : "#F2EDDE",
          boxShadow: `0 3px 10px rgba(0,0,0,0.5), 0 0 0 2px ${teamColor}`,
        }}
      >
        {initials(player.nome)}
        {rating != null && (
          <span
            className="pin-ovr"
            style={{ color: teamColor, opacity: provisional ? 0.75 : 1 }}
            title={provisional ? "OVR provisório" : undefined}
          >
            {rating}
          </span>
        )}
      </div>
      <div className="pin-name">{player.nome.toUpperCase()}</div>
    </motion.div>
  );
}
