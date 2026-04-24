import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAll } from "@/lib/db/repo";
import { ShellWrapper } from "../_shell";
import { AdminTabs } from "./AdminTabs";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/");
  const data = await getAll();
  return (
    <ShellWrapper viewLabel="admin">
      <div className="page">
        <AdminTabs
          players={data.players}
          matches={data.matches}
          transactions={data.transactions}
          votes={data.votes}
        />
      </div>
    </ShellWrapper>
  );
}
