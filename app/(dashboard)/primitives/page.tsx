import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { Tabs } from "@/components/ui/Tabs";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { statusBadgeVariant } from "@/lib/utils";
import { ErrorStateDemo, ModalDemo, ToastDemo } from "./_components/InteractiveDemos";

const SWATCHES: { name: string; token: string }[] = [
  { name: "ink", token: "bg-primary" },
  { name: "paper", token: "bg-background" },
  { name: "surface", token: "bg-surface" },
  { name: "muted", token: "bg-surface-muted" },
  { name: "accent", token: "bg-accent" },
  { name: "success", token: "bg-success" },
  { name: "warning", token: "bg-warning" },
  { name: "danger", token: "bg-danger" },
  { name: "info", token: "bg-info" },
];

const STATUSES = [
  "published",
  "pending_review",
  "rejected",
  "hadir",
  "tidak_hadir",
  "belum_rsvp",
  "sudah_check_in",
  "paid",
  "failed",
  "expired",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

export default function PrimitivesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-medium tracking-tight">
          Primitif UI
        </h1>
        <p className="text-sm text-foreground/60">
          Galeri dev — setiap primitif dari fase 3, dibangun dari token desain.
        </p>
      </div>

      <Section title="Tipografi">
        <p className="font-display text-3xl font-medium tracking-tight">
          Fraunces — wajah display untuk judul &amp; momen seremonial.
        </p>
        <p className="text-sm text-foreground/70">
          Geist Sans — teks tubuh &amp; antarmuka operasional.
        </p>
        <p className="font-mono text-xs text-foreground/60">
          Geist Mono — data, kode, token.
        </p>
      </Section>

      <Section title="Palet">
        <div className="flex flex-wrap gap-3">
          {SWATCHES.map((s) => (
            <div key={s.name} className="flex flex-col gap-1.5">
              <div
                className={`h-14 w-20 rounded-md border border-border ${s.token}`}
              />
              <span className="text-xs text-foreground/60">{s.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="add">+</Button>
          <Button pending>Memproses</Button>
        </div>
      </Section>

      <Section title="Form">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama" htmlFor="p-nama" required>
            <Input id="p-nama" placeholder="Nama tamu" />
          </Field>
          <Field label="Email" htmlFor="p-email" error={["Email tidak valid"]}>
            <Input id="p-email" invalid placeholder="nama@email.com" />
          </Field>
          <Field label="Kategori" htmlFor="p-kat">
            <Select id="p-kat" defaultValue="digital">
              <option value="digital">Digital</option>
              <option value="fisik">Fisik</option>
            </Select>
          </Field>
          <Field label="Catatan" htmlFor="p-note" hint="Opsional.">
            <Textarea id="p-note" placeholder="Catatan untuk tamu…" />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Checkbox id="p-agree" defaultChecked />
          <label htmlFor="p-agree" className="text-sm text-foreground/80">
            Saya menyetujui ketentuan
          </label>
          <Switch id="p-preview" label="Mode pratinjau" defaultChecked />
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">neutral</Badge>
          <Badge variant="info">info</Badge>
          <Badge variant="success">success</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="danger">danger</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Badge key={s} variant={statusBadgeVariant(s)} dot>
              {s.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex items-center gap-3">
          <Avatar name="Budi Santoso" size="sm" />
          <Avatar name="Sari" size="md" />
          <Avatar name="Andi Wijaya" size="lg" />
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <THead>
            <TR>
              <TH>Tamu</TH>
              <TH>RSVP</TH>
              <TH>Check-in</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TD className="font-medium">Budi Santoso</TD>
              <TD><Badge variant="success" dot>hadir</Badge></TD>
              <TD><Badge variant="success" dot>sudah</Badge></TD>
            </TR>
            <TR>
              <TD className="font-medium">Sari Putri</TD>
              <TD><Badge variant="danger" dot>tidak hadir</Badge></TD>
              <TD><Badge variant="neutral" dot>belum</Badge></TD>
            </TR>
          </TBody>
        </Table>
      </Section>

      <Section title="Tabs">
        <Tabs
          items={[
            { id: "a", label: "Tab A", content: <p className="text-sm text-foreground/70">Konten tab A.</p> },
            { id: "b", label: "Tab B", content: <p className="text-sm text-foreground/70">Konten tab B.</p> },
          ]}
        />
      </Section>

      <Section title="Skeleton & Spinner">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <SkeletonText lines={3} />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
          <Spinner size={22} className="text-foreground/60" />
        </div>
      </Section>

      <Section title="Empty & Error state">
        <EmptyState
          title="Belum ada tamu"
          description="Tamu akan tampil di sini setelah Anda menambahkannya."
        />
        <ErrorStateDemo />
      </Section>

      <Section title="Modal & Toast">
        <ModalDemo />
        <ToastDemo />
      </Section>
    </div>
  );
}
