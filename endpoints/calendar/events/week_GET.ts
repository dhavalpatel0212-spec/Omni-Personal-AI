import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./week_GET.schema";
import superjson from "superjson";
import { startOfWeek, endOfWeek } from 'date-fns';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const url = new URL(request.url);
    const weekOfParam = url.searchParams.get('weekOf');
    const weekOf = weekOfParam ? new Date(weekOfParam) : new Date();

    const weekStart = startOfWeek(weekOf, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(weekOf, { weekStartsOn: 1 });

    const events = await db
      .selectFrom("calendarEvents")
      .selectAll()
      .where("userId", "=", user.id)
      .where("startTime", "<=", weekEnd)
      .where("endTime", ">=", weekStart)
      .orderBy("startTime", "asc")
      .execute();

    const response: OutputType = events as unknown as OutputType;

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching week's events:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}