import { z } from "zod";
import superjson from "superjson";

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const schema = z.object({
  dailySummary: z.boolean().optional(),
  goalReminders: z.boolean().optional(),
  calendarReminders: z.boolean().optional(),
  travelReminders: z.boolean().optional(),
  quietHours: z
    .object({
      enabled: z.boolean(),
      start: z.string().regex(timeRegex, "Invalid start time format. Use HH:mm"),
      end: z.string().regex(timeRegex, "Invalid end time format. Use HH:mm"),
    })
    .optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
};

export const postNotificationSettings = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/settings/notifications`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error(
      (errorObject as any)?.error || "Failed to update notification settings"
    );
  }
  return superjson.parse<OutputType>(await result.text());
};