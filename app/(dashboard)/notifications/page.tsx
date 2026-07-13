import { Suspense } from "react";
import type { Metadata } from "next";

import { verifySession } from "@/lib/dal";
import { getNotifications } from "@/lib/dal-pelanggan";
import { LiveNotifications } from "@/components/notifications/LiveNotifications";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Notifikasi",
  description: "Kabar terbaru tentang acara, RSVP, dan pembayaran Anda.",
};

export default async function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Notifikasi
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Kabar terbaru untuk Anda
        </h1>
        <p className="text-sm text-foreground/65">
          Aktivitas acara, pembayaran, dan RSVP tampil di sini. Daftar ini
          akan diperbarui otomatis.
        </p>
      </div>

      <Suspense fallback={<NotificationsFallback />}>
        <NotificationsBody />
      </Suspense>
    </div>
  );
}

async function NotificationsBody() {
  const session = await verifySession();
  const { items } = await getNotifications(session, { page: 1, limit: 20 });
  return <LiveNotifications userId={session.userId} initial={items} />;
}

function NotificationsFallback() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-40" />
            <SkeletonText lines={2} />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
