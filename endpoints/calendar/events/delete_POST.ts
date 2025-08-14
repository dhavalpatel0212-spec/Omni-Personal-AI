import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";

// Simplified implementation. A real version would interact with the Google Calendar API.
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { eventId } = schema.parse(superjson.parse(await request.text()));

    const result = await db
      .deleteFrom('calendarEvents')
      .where('id', '=', eventId)
      .where('userId', '=', user.id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(superjson.stringify({ error: "Event not found or permission denied." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response: OutputType = { success: true };
    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}