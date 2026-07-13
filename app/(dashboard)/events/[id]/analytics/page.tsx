import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getEvent, getEventAnalytics } from "@/lib/dal-pelanggan";
import { ErrorState } from "@/components/ui/ErrorState";
import { EventAnalyticsView } from "@/components/events/EventAnalyticsView";

export default async function EventAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;
  const event = await getEvent(session, id);
  if (!event) notFound();
  if (event.pelanggan_id !== session.userId) notFound();

  const analytics = await getEventAnalytics(session, id);
  if (!analytics) {
    return (
      <ErrorState
        title="Analitik belum tersedia"
        description="Belum ada data yang cukup untuk menampilkan analitik acara ini."
      />
    );
  }

  return <EventAnalyticsView analytics={analytics} />;
}
