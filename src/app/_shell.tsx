import { getAll } from "@/lib/db/repo";
import { getCurrentPlayer, isAdmin } from "@/lib/auth";
import { computeFinance } from "@/lib/stats";
import { AppShell } from "@/components/layout/AppShell";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  viewLabel: string;
}

export async function ShellWrapper({ children, viewLabel }: Props) {
  const [current, admin, data] = await Promise.all([
    getCurrentPlayer(),
    isAdmin(),
    getAll(),
  ]);
  const { saldo } = computeFinance(data.transactions);
  return (
    <AppShell
      viewLabel={viewLabel}
      currentPlayer={current}
      isAdmin={admin}
      saldo={saldo}
      settings={data.settings}
      allPlayers={data.players}
    >
      {children}
    </AppShell>
  );
}
