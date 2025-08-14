import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../../../helpers/schema';
import { calendarEventSchema } from '../../../helpers/calendarEventSchema';

export const schema = calendarEventSchema;

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<CalendarEvents>;

export const postCreateEvent = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/calendar/events/create`, {
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
    throw new Error(errorObject.error || 'Unknown error');
  }
  return superjson.parse<OutputType>(await result.text());
};