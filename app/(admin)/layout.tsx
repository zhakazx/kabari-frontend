import { requireRole } from "@/lib/dal";
import { logout } from "@/lib/auth";
import { ADMIN_NAV } from "@/components/shell/RoleNav";
import { Shell } from "@/components/shell/Shell";

export const unstable_instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("admin");

  return (
    <Shell
      user={{ id: user.userId, name: user.name, role: user.role }}
      items={ADMIN_NAV}
      logoutAction={logout}
    >
      {children}
    </Shell>
  );
}
