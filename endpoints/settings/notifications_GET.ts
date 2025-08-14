import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType } from "./notifications_GET.schema";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    // Query the notification_settings table for the user
    const notificationSettings = await db
      .selectFrom("notificationSettings")
      .selectAll()
      .where("userId", "=", session.user.id)
      .executeTakeFirst();

    // Provide sensible defaults if no record exists
    const response: OutputType = {
      pushNotifications: notificationSettings?.pushNotifications ?? true,
      emailNotifications: notificationSettings?.emailNotifications ?? true,
      calendarNotifications: notificationSettings?.calendarNotifications ?? true,
      goalReminders: notificationSettings?.goalReminders ?? true,
      shoppingReminders: notificationSettings?.shoppingReminders ?? true,
      travelNotifications: notificationSettings?.travelNotifications ?? true,
      notificationFrequency: notificationSettings?.notificationFrequency ?? "daily",
      quietHours: {
        enabled: notificationSettings?.quietHoursEnabled ?? false,
        start: notificationSettings?.quietHoursStart ?? "22:00",
        end: notificationSettings?.quietHoursEnd ?? "08:00",
      },
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}