import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconBell, IconInfo } from "@/components/ui/icons";
import {
  formatDateTime,
  statusBadgeVariant,
} from "@/lib/utils";
import type { Notification } from "@/lib/types";

const CHANNEL_LABELS: Record<Notification["channel"], string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  in_app: "Aplikasi",
};

const STATUS_LABELS: Record<Notification["status"], string> = {
  queued: "Antrian",
  sent: "Terkirim",
  failed: "Gagal",
};

export function NotificationList({ items }: { items?: Notification[] }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    return (
      <EmptyState
        icon={<IconBell size={22} />}
        title="Belum ada notifikasi"
        description="Notifikasi akan tampil di sini saat ada aktivitas terkait acara Anda."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {list.map((n) => (
        <li
          key={n.id}
          className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-info-soft text-info"
              >
                <IconInfo size={15} />
              </span>
              <h3 className="font-medium text-foreground">{n.subject}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="neutral">{CHANNEL_LABELS[n.channel]}</Badge>
              <Badge variant={statusBadgeVariant(n.status)} dot>
                {STATUS_LABELS[n.status]}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-foreground/75">{n.message}</p>
          <p className="text-xs text-foreground/55">
            {formatDateTime(n.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
