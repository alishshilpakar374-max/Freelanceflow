import { z } from "zod";
import { roundMoney } from "@/lib/money";

export const paymentFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount")
    .refine(
      (value) =>
        Number.isFinite(Number(value)) &&
        Number(value) > 0 &&
        Number(value) <= 1_000_000_000,
      "Enter an amount greater than 0",
    ),
  paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a payment date"),
  note: z.string().trim().max(500, "Keep it under 500 characters"),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function parsePaymentAmount(value: string): number {
  return roundMoney(Number(value));
}
