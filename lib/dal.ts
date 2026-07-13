import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import type { Session, UserRole } from "@/lib/types";

export const verifySession = cache(async (): Promise<Session> => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});

export async function requireRole(
  ...roles: UserRole[]
): Promise<Session> {
  const session = await verifySession();
  if (!roles.includes(session.role)) redirect("/dashboard");
  return session;
}

export const getCurrentUser = cache(async (): Promise<Session> => {
  const session = await verifySession();
  return session;
});

/**
 * Reads the session cookie if present. Returns `null` when the visitor is
 * anonymous. Used by public surfaces (landing, template catalog, invitation
 * pages) that adapt to a logged-in user without redirecting.
 */
export const getSessionOrNull = cache(async (): Promise<Session | null> => {
  return getSession();
});
