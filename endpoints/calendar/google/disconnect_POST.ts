import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./disconnect_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const input = schema.parse(superjson.parse(await request.text()));

    // Also delete associated events
    await db
      .deleteFrom('calendarEvents')
      .where('connectionId', '=', input.connectionId)
      .where('userId', '=', user.id)
      .execute();

    const result = await db
      .deleteFrom("calendarConnections")
      .where("id", "=", input.connectionId)
      .where("userId", "=", user.id)
      .where("provider", "=", "google_calendar")
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(
        superjson.stringify({ error: "Connection not found or permission denied." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const response: OutputType = { success: true };
    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}