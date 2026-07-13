import { AppShell } from "@/components/shell/AppShell";

export const unstable_instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
