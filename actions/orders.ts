"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiError, apiJson } from "@/lib/api-client";
import { requireRole } from "@/lib/dal";
import { PACKAGE_PRICE } from "@/lib/pricing";
import type {
  FormState,
  Order,
  PaymentCreationResult,
} from "@/lib/types";

const CreateOrderSchema = z.object({
  event_id: z.string().min(1, "Acara tidak ditemukan"),
  preferred_payment_method: z
    .enum(["va", "qris", "transfer"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const CreatePaymentSchema = z.object({
  order_id: z.string().min(1, "Pesanan tidak ditemukan"),
  payment_method: z.enum(["va", "qris", "transfer"]),
});

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

export async function createOrder(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("pelanggan");

  const parsed = CreateOrderSchema.safeParse({
    event_id: formData.get("event_id") ?? undefined,
    preferred_payment_method: formData.get("preferred_payment_method") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  const body: Record<string, unknown> = {
    event_id: parsed.data.event_id,
    package_type: "basic",
    total_amount: PACKAGE_PRICE,
  };
  if (parsed.data.preferred_payment_method) {
    body.preferred_payment_method = parsed.data.preferred_payment_method;
  }

  let order: Order;
  try {
    const result = await apiJson<Order>("/orders", "POST", body, session.accessToken);
    order = result.data;
  } catch (err) {
    if (err instanceof ApiError) {
      return { message: err.messages.join(", ") || "Gagal membuat pesanan" };
    }
    throw err;
  }

  revalidatePath("/orders");
  revalidatePath(`/events/${parsed.data.event_id}/orders`);
  redirect(`/orders/${order.id}`);
}

export type PaymentActionState = (FormState & {
  payment?: PaymentCreationResult;
}) | undefined;

export async function createPayment(
  _state: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const session = await requireRole("pelanggan");

  const parsed = CreatePaymentSchema.safeParse({
    order_id: formData.get("order_id") ?? undefined,
    payment_method: formData.get("payment_method") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  let payment: PaymentCreationResult;
  try {
    const result = await apiJson<PaymentCreationResult>(
      "/orders/payments",
      "POST",
      parsed.data,
      session.accessToken,
    );
    payment = result.data;
  } catch (err) {
    if (err instanceof ApiError) {
      return { message: err.messages.join(", ") || "Gagal membuat pembayaran" };
    }
    throw err;
  }

  revalidatePath(`/orders/${parsed.data.order_id}`);
  return { message: "Instruksi pembayaran dibuat", payment };
}
