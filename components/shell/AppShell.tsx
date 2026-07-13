import { getCurrentUser } from "@/lib/dal";
import { getNotifications } from "@/lib/dal-pelanggan";
import { logout } from "@/lib/auth";
import { navForRole } from "@/components/shell/RoleNav";
import { Shell } from "@/components/shell/Shell";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const items = navForRole(user.role);

  // Pelanggan get a notifications badge. The endpoint returns per-user
  // records, so it's safe to call for any role, but the bell only matters
  // in the pelanggan nav; we pass the count to the topbar in all cases
  // and let the icon show the dot when > 0.
  let unreadCount = 0;
  if (user.role === "pelanggan" || user.role === "kreator" || user.role === "penerima_tamu") {
    try {
      const { items: notes } = await getNotifications(user, { limit: 100 });
      unreadCount = notes.length;
    } catch {
      // If the backend is down, silently hide the badge — the user will
      // still see notifications in /notifications.
      unreadCount = 0;
    }
  }

  return (
    <Shell
      user={{ id: user.userId, name: user.name, role: user.role }}
      items={items}
      logoutAction={logout}
      notificationsHref="/notifications"
      notificationCount={unreadCount}
    >
      {children}
    </Shell>
  );
}
