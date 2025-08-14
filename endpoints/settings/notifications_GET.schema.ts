import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  calendarNotifications: boolean;
  goalReminders: boolean;
  shoppingReminders: boolean;
  travelNotifications: boolean;
  notificationFrequency: string;
  quietHours: {
    enabled: boolean;
    start: string; // "HH:mm" format
    end: string; // "HH:mm" format
  };
};

export const getNotificationSettings = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/settings/notifications`, {
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
      (errorObject as any)?.error || "Failed to fetch notification settings"
    );
  }
  return superjson.parse<OutputType>(await result.text());
};