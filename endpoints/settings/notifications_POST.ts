import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./notifications_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const updateData: any = {};

    if (input.dailySummary !== undefined) {
      updateData.emailNotifications = input.dailySummary;
    }
    if (input.goalReminders !== undefined) {
      updateData.goalReminders = input.goalReminders;
    }
    if (input.calendarReminders !== undefined) {
      updateData.calendarNotifications = input.calendarReminders;
    }
    if (input.travelReminders !== undefined) {
      updateData.travelNotifications = input.travelReminders;
    }
    if (input.quietHours !== undefined) {
      updateData.quietHoursEnabled = input.quietHours.enabled;
      if (input.quietHours.enabled) {
        updateData.quietHoursStart = input.quietHours.start;
        updateData.quietHoursEnd = input.quietHours.end;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(
        superjson.stringify({ error: "No fields to update." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use UPSERT to handle cases where notification settings don't exist yet
    await db
      .insertInto("notificationSettings")
      .values({
        userId: user.id,
        ...updateData,
        updatedAt: new Date(),
      })
      .onConflict((oc) =>
        oc.column("userId").doUpdateSet({
          ...updateData,
          updatedAt: new Date(),
        })
      )
      .execute();

    const response: OutputType = {
      success: true,
      message: "Notification settings updated successfully.",
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}