"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  IconChevronDown,
  IconLogOut,
  IconMenu,
} from "@/components/ui/icons";
import { LiveNotificationBell } from "@/components/notifications/LiveNotificationBell";
import type { UserRole } from "@/lib/types";

export function Topbar({
  user,
  logoutAction,
  notificationsHref = "/notifications",
  notificationCount = 0,
  onMenuClick,
}: {
  user: { id: string; name: string; role: UserRole };
  logoutAction: () => void | Promise<void>;
  notificationsHref?: string;
  notificationCount?: number;
  onMenuClick?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Buka menu"
        className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/70 transition hover:bg-surface-muted lg:hidden"
      >
        <IconMenu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <LiveNotificationBell
          userId={user.id}
          initialCount={notificationCount}
          href={notificationsHref}
        />

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-surface-muted"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar name={user.name} size="sm" />
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {user.name}
            </span>
            <IconChevronDown
              size={16}
              className={cn(
                "hidden text-foreground/50 transition-transform sm:block",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label="Tutup menu"
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-surface shadow-lift"
              >
                <div className="flex flex-col gap-1 px-3 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <Badge variant="neutral">{ROLE_LABELS[user.role]}</Badge>
                </div>
                <div className="h-px bg-border" />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-surface-muted"
                  >
                    <IconLogOut size={17} />
                    Keluar
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
