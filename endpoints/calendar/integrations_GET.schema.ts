import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type CalendarIntegration = {
  id: string;
  provider: string;
  email: string;
  isSyncEnabled: boolean;
};

export type OutputType = CalendarIntegration[];

export const getCalendarIntegrations = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/calendar/integrations`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error(
      (errorObject as any)?.error || "Failed to fetch calendar integrations"
    );
  }
  return superjson.parse<OutputType>(await result.text());
};