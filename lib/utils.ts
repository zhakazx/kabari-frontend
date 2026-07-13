import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  CheckInStatus,
  EventStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RsvpStatus,
  TemplateStatus,
  UserRole,
} from "@/lib/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function toNumber(
  value: string | number | null | undefined,
): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatRupiah(value: number | string): string {
  const n = toNumber(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  pelanggan: "Pelanggan",
  kreator: "Kreator",
  penerima_tamu: "Penerima Tamu",
  admin: "Admin",
};

export const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  draft: "Draf",
  pending_review: "Menunggu Tinjauan",
  published: "Dipublikasikan",
  rejected: "Ditolak",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draf",
  active: "Aktif",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const RSVP_LABELS: Record<RsvpStatus, string> = {
  pending: "Menunggu",
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
};

export const CHECK_IN_LABELS: Record<CheckInStatus, string> = {
  belum_check_in: "Belum Check-in",
  sudah_check_in: "Sudah Check-in",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu",
  paid: "Dibayar",
  failed: "Gagal",
  cancelled: "Dibatalkan",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  va: "Virtual Account",
  qris: "QRIS",
  transfer: "Transfer Bank",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Menunggu",
  paid: "Dibayar",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

export type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  draft: "neutral",
  pending_review: "warning",
  published: "success",
  rejected: "danger",
  active: "info",
  completed: "success",
  cancelled: "danger",
  pending: "warning",
  hadir: "success",
  tidak_hadir: "danger",
  belum_check_in: "neutral",
  sudah_check_in: "success",
  paid: "success",
  failed: "danger",
  expired: "danger",
  queued: "warning",
  sent: "success",
  sukses: "success",
  gagal: "danger",
  tidak_terdaftar: "danger",
};

export function statusBadgeVariant(status: string): BadgeVariant {
  return STATUS_BADGE_VARIANTS[status] ?? "neutral";
}
