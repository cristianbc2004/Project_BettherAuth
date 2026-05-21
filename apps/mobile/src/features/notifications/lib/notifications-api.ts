import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "TRANSFER",
  "BIZUM_REQUEST",
  "BIZUM_SENT",
  "BIZUM_RECEIVED",
  "ALERT",
]);

export const notificationActionPayloadSchema = z.object({
  bizumRequestId: z.string().optional(),
});

export const notificationsGetResponseSchema = z.object({
  notifications: z.array(
    z.object({
      actionPayload: notificationActionPayloadSchema.nullable().optional(),
      bizumRequestId: z.string().nullable().optional(),
      body: z.string().nullable().optional(),
      createdAt: z.string(),
      emisorName: z.string().nullable().optional(),
      id: z.string(),
      isUnread: z.boolean(),
      timestamp: z.string(),
      title: z.string(),
      type: notificationTypeSchema,
    }),
  ),
});

export const notificationRequestDetailResponseSchema = z.object({
  amountCents: z.number(),
  concept: z.string().nullable().optional(),
  id: z.string(),
  isPayable: z.boolean(),
  requester: z.object({
    id: z.string(),
    initials: z.string(),
    name: z.string(),
  }),
});

export type NotificationActionPayload = z.infer<typeof notificationActionPayloadSchema>;
export type NotificationRequestDetailResponse = z.infer<typeof notificationRequestDetailResponseSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationResponseItem = z.infer<typeof notificationsGetResponseSchema>["notifications"][number];
