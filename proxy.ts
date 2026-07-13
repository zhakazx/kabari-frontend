import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/session";

// Paths that any visitor (logged in or not) can access. Everything else is
// either an authenticated surface (`/dashboard/*`, `/admin/*`, `/gate/*`,
// `/kreator/*`, `/events/*`, `/orders/*`, `/notifications`) which the proxy
// guards, or a public asset handled by the matcher exclusion.
const PUBLIC_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/login\/?$/,
  /^\/register\/?$/,
  /^\/templates(\/.*)?$/,
  /^\/invite\/[^/]+(\/(rsvp|qr))?\/?$/,
];

function isPublic(path: string): boolean {
  return PUBLIC_PATTERNS.some((re) => re.test(path));
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip the public matcher early to avoid the cookie read on every request.
  // We still need the session for the redirect-logged-in-away-from-auth check.
  if (path === "/login" || path === "/register") {
    const session = await getSession();
    if (session) {
      return NextResponse.redirect(
        new URL("/dashboard", req.nextUrl),
      );
    }
    return NextResponse.next();
  }

  if (isPublic(path)) return NextResponse.next();

  // Anything else is an authenticated surface.
  const session = await getSession();
  const isAdminArea = path.startsWith("/admin");

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isAdminArea && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
