import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getEvent, getEventDashboardStats } from "@/lib/dal-pelanggan";
import { LiveEventDashboard } from "@/components/events/LiveEventDashboard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Dashboard Acara",
};

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;

  // The layout already ran the owner check, so the event must exist
  // and be ours — but we re-fetch here because the layout doesn't share
  // its data with children in this router.
  const event = await getEvent(session, id);
  if (!event) notFound();
  if (event.pelanggan_id !== session.userId) notFound();

  // First paint uses the SSR'd data; the LiveEventDashboard client island
  // takes over and refreshes every 8s.
  const initial = await getEventDashboardStats(session, id);
  if (!initial) {
    return <DashboardUnavailable />;
  }

  return <LiveEventDashboard eventId={id} initial={initial} />;
}

function DashboardUnavailable() {
  return (
    <ErrorState
      title="Statistik tidak tersedia"
      description="Belum ada data RSVP atau check-in untuk acara ini."
      action={
        <Button href="/events" variant="outline" size="sm">
          Kembali ke daftar acara
        </Button>
      }
    />
  );
}
