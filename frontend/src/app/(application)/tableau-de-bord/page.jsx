import { getDashboard } from "@/lib/application-api";
import { requireUser } from "@/lib/auth";
import DashboardView from "./DashboardView";

export const metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const [user, dashboard] = await Promise.all([requireUser(), getDashboard()]);

  return <DashboardView displayName={user.name || user.email} {...dashboard} />;
}
