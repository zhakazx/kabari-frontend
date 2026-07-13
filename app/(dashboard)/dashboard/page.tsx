import { verifySession } from "@/lib/dal";

import { AdminDashboard } from "../_components/AdminDashboard";
import { KreatorDashboard } from "../_components/KreatorDashboard";
import { PelangganDashboard } from "../_components/PelangganDashboard";
import { PenerimaTamuDashboard } from "../_components/PenerimaTamuDashboard";

/**
 * Role-aware home page at `/dashboard`. The (dashboard) layout
 * (`app/(dashboard)/layout.tsx`) wraps every page in the AppShell, which
 * already picks the right sidebar nav from `RoleNav.ts` for the
 * authenticated role. This page just renders the role-specific overview.
 *
 * `verifySession` (not `requireRole`) so we can branch on any role
 * without a redirect loop — the AppShell has already shown the matching
 * sidebar before this renders.
 */
export default async function DashboardEntry() {
  const session = await verifySession();

  switch (session.role) {
    case "pelanggan":
      return <PelangganDashboard session={session} />;
    case "kreator":
      return <KreatorDashboard session={session} />;
    case "penerima_tamu":
      return <PenerimaTamuDashboard session={session} />;
    case "admin":
      return <AdminDashboard session={session} />;
  }
}
