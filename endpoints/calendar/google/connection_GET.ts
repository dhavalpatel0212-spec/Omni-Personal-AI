import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { OutputType } from "./connection_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const connection = await db
      .selectFrom("calendarConnections")
      .selectAll()
      .where("userId", "=", user.id)
      .where("provider", "=", "google_calendar")
      .executeTakeFirst();

    if (!connection) {
      return new Response(superjson.stringify(null), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response: OutputType = {
      id: connection.id,
      provider: connection.provider,
      calendarId: connection.calendarId,
      calendarName: connection.calendarName,
      isActive: connection.isActive ?? false,
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching Google Calendar connection:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}