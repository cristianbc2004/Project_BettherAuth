import { z } from "zod";

import type { BizumActionMode } from "@/features/finance/lib/bizum-api";

export function formatBizumCents(value: number) {
  return `${(value / 100).toFixed(2).replace(".", ",")} EUR`;
}

export function formatBizumAmount(value: number) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

export function normalizeBizumAmount(value: string) {
  return Number(value.replace(",", "."));
}

export function buildBizumSchema(mode: BizumActionMode, availableBalanceCents: number) {
  return z
    .object({
      amount: z.string().trim().min(1, "Enter an amount."),
      concept: z.string().trim().max(42, "The concept cannot exceed 42 characters."),
      contactId: z.string().trim().min(1, "Choose a contact."),
    })
    .superRefine((values, context) => {
      const parsedAmount = normalizeBizumAmount(values.amount);
      const amountCents = Math.round(parsedAmount * 100);

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid amount.",
          path: ["amount"],
        });
        return;
      }

      if (amountCents < 50) {
        context.addIssue({
          code: "custom",
          message: "The minimum amount is 0.50 EUR.",
          path: ["amount"],
        });
      }

      if (amountCents > 100000) {
        context.addIssue({
          code: "custom",
          message: "The maximum amount per Bizum is 1,000.00 EUR.",
          path: ["amount"],
        });
      }

      if (mode === "send" && amountCents > availableBalanceCents) {
        context.addIssue({
          code: "custom",
          message: "You do not have enough balance to send that Bizum.",
          path: ["amount"],
        });
      }
    });
}

export type BizumFormValues = z.infer<ReturnType<typeof buildBizumSchema>>;
