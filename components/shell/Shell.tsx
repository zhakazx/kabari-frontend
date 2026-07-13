"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import type { NavItem } from "@/components/shell/RoleNav";

export function Shell({
  user,
  items,
  logoutAction,
  notificationsHref,
  notificationCount = 0,
  children,
}: {
  user: { id: string; name: string; role: UserRole };
  items: NavItem[];
  logoutAction: () => void | Promise<void>;
  notificationsHref?: string;
  notificationCount?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar items={items} onNavigate={() => setOpen(false)} />
      </aside>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
        />
      ) : null}

      <div className="lg:pl-64">
        <Topbar
          user={user}
          logoutAction={logoutAction}
          notificationsHref={notificationsHref}
          notificationCount={notificationCount}
          onMenuClick={() => setOpen(true)}
        />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
