import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  accountId: z.string(), // The oauth_accounts ID
  isSyncEnabled: z.boolean(),
  // Other settings like which specific calendars to sync could be added here
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
};

export const postCalendarSettings = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/calendar/settings`, {
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
    throw new Error((errorObject as any)?.error || "Failed to update calendar settings");
  }
  return superjson.parse<OutputType>(await result.text());
};