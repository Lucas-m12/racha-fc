import { redirect } from "next/navigation";
import { getAll } from "@/lib/db/repo";
import { isAdmin } from "@/lib/auth";
import { computeFinance } from "@/lib/stats";
import { formatBRL } from "@/lib/format";
import { ShellWrapper } from "../_shell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CaixaList } from "./CaixaList";

export const dynamic = "force-dynamic";

export default async function Caixa() {
  if (!(await isAdmin())) redirect("/");
  const { transactions, players } = await getAll();
  const finance = computeFinance(transactions);

  return (
    <ShellWrapper viewLabel="caixa">
      <div className="page">
        <section
          style={{
            background: "linear-gradient(160deg, var(--surface-hi), var(--surface))",
            border: "1px solid var(--border-hi)",
            borderRadius: "var(--radius-2xl)",
            padding: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="lbl-mono">saldo em caixa</div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 60,
              color: finance.saldo >= 0 ? "var(--accent)" : "var(--warm)",
              marginTop: 6,
            }}
          >
            {formatBRL(finance.saldo / 100)}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
            <div>
              <div className="lbl-mono">mês: entrou</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--accent)" }}>
                {formatBRL(finance.entrouMes / 100)}
              </div>
            </div>
            <div>
              <div className="lbl-mono">mês: saiu</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--warm)" }}>
                {formatBRL(finance.saiuMes / 100)}
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="LANÇAMENTOS" sub={`${transactions.length} itens`} />
          <CaixaList transactions={transactions} playerNameById={Object.fromEntries(players.map((p) => [p.id, p.nome]))} />
        </section>
      </div>
    </ShellWrapper>
  );
}
