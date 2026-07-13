import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { AuthResult, Session, SessionPayload } from "@/lib/types";

const encodedKey = new TextEncoder().encode(env.SESSION_SECRET);

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: env.SESSION_MAX_AGE_SECONDS,
  };
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + env.SESSION_MAX_AGE_SECONDS;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(encodedKey);
}

export async function decrypt(
  cookieValue: string | undefined = "",
): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(authResult: AuthResult): Promise<void> {
  const expiresAt = Date.now() + env.SESSION_MAX_AGE_SECONDS * 1000;
  const payload: SessionPayload = {
    userId: authResult.user_id,
    name: authResult.name,
    role: authResult.role,
    accessToken: authResult.access_token,
    expiresAt,
  };
  const jwt = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, jwt, cookieOptions());
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  const payload = await decrypt(cookieValue);
  if (!payload) return null;
  return {
    userId: payload.userId,
    name: payload.name,
    role: payload.role,
    accessToken: payload.accessToken,
  };
}

export async function updateSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  const payload = await decrypt(cookieValue);
  if (!payload) return null;
  const refreshed: SessionPayload = {
    ...payload,
    expiresAt: Date.now() + env.SESSION_MAX_AGE_SECONDS * 1000,
  };
  const jwt = await encrypt(refreshed);
  cookieStore.set(env.SESSION_COOKIE_NAME, jwt, cookieOptions());
  return {
    userId: refreshed.userId,
    name: refreshed.name,
    role: refreshed.role,
    accessToken: refreshed.accessToken,
  };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(env.SESSION_COOKIE_NAME);
}
