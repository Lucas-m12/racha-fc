import type { ReactNode } from "react";

interface StatBlockProps {
  label: string;
  value: ReactNode;
  big?: boolean;
  color?: string;
  icon?: ReactNode;
}

export function StatBlock({ label, value, big = false, color, icon }: StatBlockProps) {
  return (
    <div className="stat-block">
      <div className="lbl">
        {icon}
        {label}
      </div>
      <div
        className="val"
        style={{
          fontFamily: big ? "var(--font-display)" : "var(--font-mono)",
          fontSize: big ? 28 : 18,
          color: color ?? "var(--cream)",
          fontWeight: big ? 400 : 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}
