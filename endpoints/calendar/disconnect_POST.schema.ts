import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  accountId: z.string(), // This is the ID from the 'oauth_accounts' table
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
};

export const postDisconnectCalendar = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/calendar/disconnect`, {
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
    throw new Error((errorObject as any)?.error || "Failed to disconnect calendar");
  }
  return superjson.parse<OutputType>(await result.text());
};