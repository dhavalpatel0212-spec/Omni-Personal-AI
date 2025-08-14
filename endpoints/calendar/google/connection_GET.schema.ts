import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  id: number;
  provider: string;
  calendarId: string | null;
  calendarName: string | null;
  isActive: boolean;
} | null;

export const getGoogleConnection = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/calendar/google/connection`, {
    method: "GET",
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