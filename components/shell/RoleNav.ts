import type { UserRole } from "@/lib/types";

export const ICON_NAMES = [
  "bell",
  "calendar",
  "chart",
  "clipboardCheck",
  "coins",
  "gift",
  "layers",
  "receipt",
  "scan",
  "users",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

export const NAV_BY_ROLE: Record<Exclude<UserRole, "admin">, NavItem[]> = {
  pelanggan: [
    { label: "Beranda", href: "/dashboard", icon: "chart" },
    { label: "Acara", href: "/events", icon: "calendar" },
    { label: "Pesanan", href: "/orders", icon: "receipt" },
    { label: "Notifikasi", href: "/notifications", icon: "bell" },
  ],
  kreator: [
    { label: "Beranda", href: "/dashboard", icon: "chart" },
    { label: "Template Saya", href: "/kreator/templates", icon: "layers" },
    { label: "Royalti", href: "/kreator/royalties", icon: "coins" },
    { label: "Notifikasi", href: "/notifications", icon: "bell" },
  ],
  penerima_tamu: [
    { label: "Beranda", href: "/dashboard", icon: "chart" },
    { label: "Pindai Gerbang", href: "/gate", icon: "scan" },
    { label: "Riwayat Check-in", href: "/gate/history", icon: "clipboardCheck" },
    { label: "Notifikasi", href: "/notifications", icon: "bell" },
  ],
};

export const ADMIN_NAV: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: "chart" },
  { label: "Pengguna", href: "/admin/users", icon: "users" },
  { label: "Template", href: "/admin/templates", icon: "layers" },
  { label: "Analitik", href: "/admin/analytics", icon: "chart" },
];

export function navForRole(role: UserRole): NavItem[] {
  if (role === "admin") return ADMIN_NAV;
  return NAV_BY_ROLE[role];
}
