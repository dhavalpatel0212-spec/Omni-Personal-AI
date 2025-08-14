import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./create_POST.schema";
import superjson from "superjson";

// Simplified implementation. A real version would interact with the Google Calendar API.
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const input = schema.parse(superjson.parse(await request.text()));

    const connection = await db
      .selectFrom('calendarConnections')
      .selectAll()
      .where('userId', '=', user.id)
      .where('provider', '=', 'google_calendar')
      .executeTakeFirst();

    if (!connection) {
      throw new Error('Google Calendar not connected. Cannot create event.');
    }

    // In a real implementation, you would now call the Google Calendar API to create the event
    // and get back the googleEventId. For this example, we'll skip that and just insert locally.

    const newEvent = await db
      .insertInto('calendarEvents')
      .values({
        userId: user.id,
        connectionId: connection.id,
        googleEventId: `local_${Date.now()}`, // Placeholder ID
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        attendees: input.attendees,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const response: OutputType = newEvent;
    return new Response(superjson.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}