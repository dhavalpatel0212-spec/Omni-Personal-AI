import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./update_POST.schema";
import superjson from "superjson";

// Simplified implementation. A real version would interact with the Google Calendar API.
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { id, event } = schema.parse(superjson.parse(await request.text()));

    const updatedEvent = await db
      .updateTable('calendarEvents')
      .set({
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        attendees: event.attendees,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .where('userId', '=', user.id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedEvent) {
      return new Response(superjson.stringify({ error: "Event not found or permission denied." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response: OutputType = updatedEvent;
    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating event:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}