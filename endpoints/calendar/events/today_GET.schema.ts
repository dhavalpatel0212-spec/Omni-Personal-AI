import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../../../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<CalendarEvents>[];

export const getTodayEvents = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/calendar/events/today`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};