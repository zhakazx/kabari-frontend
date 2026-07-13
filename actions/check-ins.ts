"use server";

import { z } from "zod";

import { ApiError, apiJson } from "@/lib/api-client";
import { requireRole } from "@/lib/dal";
import type { CheckInResult, FormState } from "@/lib/types";

const CheckInSchema = z.object({
  qr_code_token: z
    .string({ message: "Token QR wajib diisi" })
    .trim()
    .min(1, "Token QR tidak boleh kosong")
    .max(2048, "Token QR tidak valid"),
});

export type CheckInState = (FormState & {
  result?: CheckInResult;
}) | undefined;

/**
 * Records a guest check-in for the gate scanner. The endpoint
 * `POST /check-ins` only takes `qr_code_token` — the event is implicit
 * in the invitation that the QR resolves to. Returns the human-readable
 * `CheckInResult` so the client can render the success / duplicate /
 * unknown card.
 *
 * We never throw on a backend failure: the gate UI shows a friendly
 * "Gagal melakukan check-in" message and re-arms the scanner for the
 * next guest. Real errors are rethrown so Next surfaces them.
 */
export async function checkIn(
  _state: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  const session = await requireRole("penerima_tamu");

  const parsed = CheckInSchema.safeParse({
    qr_code_token: formData.get("qr_code_token"),
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      errors: fieldErrors,
      message: fieldErrors.qr_code_token?.[0] ?? "Token QR tidak valid",
    };
  }

  try {
    const { data } = await apiJson<CheckInResult>(
      "/check-ins",
      "POST",
      { qr_code_token: parsed.data.qr_code_token },
      session.accessToken,
    );
    return { result: data };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        message: err.messages.join(", ") || "Gagal melakukan check-in",
      };
    }
    throw err;
  }
}
