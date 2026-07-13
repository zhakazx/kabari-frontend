import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CHECK_IN_LABELS,
  RSVP_LABELS,
  statusBadgeVariant,
  toNumber,
} from "@/lib/utils";
import type { Invitation } from "@/lib/types";
import { IconQr } from "@/components/ui/icons";
import { CopyInviteButton } from "@/components/events/CopyInviteButton";

/**
 * Renders the guest list for an event. Each row offers a link to the
 * guest's printable QR view and a copy-invite button (client island).
 */
export function GuestListTable({ guests }: { guests: Invitation[] }) {
  if (guests.length === 0) return null;

  return (
    <Table>
      <THead>
        <TR>
          <TH>Nama</TH>
          <TH className="hidden sm:table-cell">Kontak</TH>
          <TH>Kategori</TH>
          <TH>RSVP</TH>
          <TH>Hadir</TH>
          <TH>Check-in</TH>
          <TH className="text-right">Tautan</TH>
        </TR>
      </THead>
      <TBody>
        {guests.map((g) => (
          <TR key={g.id}>
            <TD>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{g.tamu_name}</span>
                {g.tamu_phone ? (
                  <span className="text-xs text-foreground/55">{g.tamu_phone}</span>
                ) : null}
              </div>
            </TD>
            <TD className="hidden sm:table-cell">
              <span className="text-xs text-foreground/65">
                {g.tamu_email ?? "—"}
              </span>
            </TD>
            <TD>
              <Badge variant="neutral">{g.category}</Badge>
            </TD>
            <TD>
              <Badge variant={statusBadgeVariant(g.rsvp_status)} dot>
                {RSVP_LABELS[g.rsvp_status]}
              </Badge>
            </TD>
            <TD>
              <span className="text-sm text-foreground/75">
                {toNumber(g.jumlah_hadir)}
              </span>
            </TD>
            <TD>
              <Badge variant={statusBadgeVariant(g.check_in_status)} dot>
                {CHECK_IN_LABELS[g.check_in_status]}
              </Badge>
            </TD>
            <TD className="text-right">
              <div className="inline-flex items-center gap-1.5">
                <Button
                  href={`/invite/${g.qr_code_token}/qr`}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  aria-label="Lihat QR tamu"
                >
                  <IconQr size={14} />
                </Button>
                <CopyInviteButton token={g.qr_code_token} />
              </div>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
