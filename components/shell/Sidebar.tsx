"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/ui/BrandMark";
import type { NavItem } from "@/components/shell/RoleNav";
import { ICON_REGISTRY } from "@/components/shell/iconRegistry";

function isActive(pathname: string, href: string): boolean {
  if (href === pathname) return true;
  // Treat a nav root as active for any nested route beneath it.
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 bg-surface">
      <div className="flex h-16 items-center px-5">
        <Link href="/" onClick={onNavigate} aria-label="KABARI — beranda">
          <Wordmark />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-foreground/40">
          Menu
        </p>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = ICON_REGISTRY[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-surface-muted text-foreground"
                  : "text-foreground/65 hover:bg-surface-muted/60 hover:text-foreground",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent"
                />
              )}
              <Icon
                size={18}
                className={cn(active ? "text-accent" : "text-foreground/50 group-hover:text-foreground/70")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-5 py-5 text-[0.7rem] leading-relaxed text-foreground/40">
        Kabari · v0.1
      </div>
    </div>
  );
}
