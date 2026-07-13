import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getEvent } from "@/lib/dal-pelanggan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Gallery } from "@/components/shared/Gallery";
import { GalleryUploader } from "@/components/events/GalleryUploader";
import { IconImage } from "@/components/ui/icons";

export default async function EventGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;
  const event = await getEvent(session, id);
  if (!event) notFound();
  if (event.pelanggan_id !== session.userId) notFound();

  const urls = parseGalleryUrls(event.gallery_urls);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Galeri publik</CardTitle>
        </CardHeader>
        <CardContent>
          {urls.length === 0 ? (
            <EmptyState
              icon={<IconImage size={22} />}
              title="Belum ada foto"
              description="Tambahkan foto agar tamu dapat melihat suasana acara Anda."
            />
          ) : (
            <Gallery urls={urls} alt={`Galeri ${event.event_name}`} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tambah foto</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryUploader eventId={id} />
        </CardContent>
      </Card>
    </div>
  );
}

function parseGalleryUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    // fall through
  }
  return raw ? [raw] : [];
}
