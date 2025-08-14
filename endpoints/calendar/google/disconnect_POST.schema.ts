import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  connectionId: z.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
};

export { postDisconnectGoogleCalendar };

const postDisconnectGoogleCalendar = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/calendar/google/disconnect`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || 'An unexpected error occurred');
  }
  return superjson.parse<OutputType>(await result.text());
};