import type { Player } from "@/lib/types";
import { initials, isColorLight } from "@/lib/format";

interface AvatarProps {
  player: Pick<Player, "nome" | "cor">;
  size?: number;
  fontSize?: number;
  radius?: number | string;
}

export function Avatar({ player, size = 36, fontSize = 13, radius = "50%" }: AvatarProps) {
  const light = isColorLight(player.cor);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: player.cor,
        color: light ? "#0E0D0B" : "#F2EDDE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        fontSize,
        flexShrink: 0,
      }}
    >
      {initials(player.nome)}
    </div>
  );
}
