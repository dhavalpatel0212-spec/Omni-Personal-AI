import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  syncedEventsCount: number;
};

export const postSyncGoogleCalendar = async (body?: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/calendar/google/sync`, {
    method: "POST",
    body: superjson.stringify(body || {}),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || 'Unknown error');
  }
  return superjson.parse<OutputType>(await result.text());
};