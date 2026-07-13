"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  IconChart,
  IconImage,
  IconReceipt,
  IconUsers,
  IconClipboardCheck,
} from "@/components/ui/icons";

type Item = {
  id: string;
  label: string;
  href: (eventId: string) => string;
  match: (path: string, eventId: string) => boolean;
  icon: React.ReactNode;
};

const ITEMS: Item[] = [
  {
    id: "overview",
    label: "Ringkasan",
    href: (id) => `/events/${id}`,
    match: (path, id) => path === `/events/${id}`,
    icon: <IconClipboardCheck size={15} />,
  },
  {
    id: "guests",
    label: "Tamu",
    href: (id) => `/events/${id}/guests`,
    match: (path, id) => path.startsWith(`/events/${id}/guests`),
    icon: <IconUsers size={15} />,
  },
  {
    id: "gallery",
    label: "Galeri",
    href: (id) => `/events/${id}/gallery`,
    match: (path, id) => path.startsWith(`/events/${id}/gallery`),
    icon: <IconImage size={15} />,
  },
  {
    id: "orders",
    label: "Pesanan",
    href: (id) => `/events/${id}/orders`,
    match: (path, id) => path.startsWith(`/events/${id}/orders`),
    icon: <IconReceipt size={15} />,
  },
  {
    id: "analytics",
    label: "Analitik",
    href: (id) => `/events/${id}/analytics`,
    match: (path, id) => path.startsWith(`/events/${id}/analytics`),
    icon: <IconChart size={15} />,
  },
];

/**
 * Sticky sub-nav used inside an event's dashboard layout. Each tab is a
 * `<Link>` so the URL stays shareable; the active item is detected from
 * `usePathname()` and the current route group.
 */
export function EventTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Bagian acara"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {ITEMS.map((item) => {
        const active = item.match(pathname, eventId);
        return (
          <Link
            key={item.id}
            role="tab"
            aria-selected={active}
            href={item.href(eventId)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-accent text-foreground"
                : "border-transparent text-foreground/55 hover:text-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
