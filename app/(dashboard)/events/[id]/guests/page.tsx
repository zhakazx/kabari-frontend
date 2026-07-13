import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getEvent, getInvitationsByEvent } from "@/lib/dal-pelanggan";
import type { InvitationsQuery } from "@/lib/dal-pelanggan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconDownload } from "@/components/ui/icons";
import { GuestBatchForm } from "@/components/events/GuestBatchForm";
import { LiveEventGuests } from "@/components/events/LiveEventGuests";

export const metadata = {
  title: "Daftar Tamu",
};

const PAGE_SIZE = 20;

export default async function EventGuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;
  const event = await getEvent(session, id);
  if (!event) notFound();
  if (event.pelanggan_id !== session.userId) notFound();

  const query: InvitationsQuery = { page: 1, limit: PAGE_SIZE };
  const { items: guests, meta, counts } = await getInvitationsByEvent(session, id, query);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="Total tamu" value={meta.total} />
        <SummaryTile
          label="Sudah konfirmasi"
          value={counts.confirmed}
        />
        <SummaryTile
          label="Sudah check-in"
          value={counts.checked_in}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>Tambah tamu</CardTitle>
              <p className="text-xs text-foreground/55">
                Setiap tamu mendapat QR code pribadi. Bisa diedit sebelum
                undangan dikirim.
              </p>
            </div>
            <Button
              href={`/api/reports/${id}/guests/xlsx`}
              variant="outline"
              size="sm"
              download
            >
              <IconDownload size={14} />
              Buku tamu (XLSX)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <GuestBatchForm eventId={id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar tamu</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveEventGuests eventId={id} initial={guests} />
        </CardContent>
      </Card>

      <p className="text-xs text-foreground/50">
        Ingin mengelola event lain?{" "}
        <Link href="/events" className="text-accent hover:underline">
          Kembali ke daftar acara
        </Link>
      </p>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-5">
        <span className="text-sm text-foreground/65">{label}</span>
        <span className="font-display text-2xl font-medium tracking-tight text-foreground">
          {value.toLocaleString("id-ID")}
        </span>
      </CardContent>
    </Card>
  );
}
