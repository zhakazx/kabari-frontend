import { redirect } from "next/navigation";

import { requireRole } from "@/lib/dal";

/**
 * The `/admin` entry point. The spec says it should redirect to the
 * analytics dashboard — that is the operator's "home" page. The
 * middleware (`proxy.ts`) has already gated this surface for the
 * `admin` role; this is a Server Component guard that double-checks
 * before issuing the redirect.
 */
export default async function AdminEntry() {
  await requireRole("admin");
  redirect("/admin/analytics");
}
