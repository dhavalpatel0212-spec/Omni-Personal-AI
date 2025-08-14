import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { OutputType } from "./today_GET.schema";
import superjson from "superjson";
import { startOfDay, endOfDay } from 'date-fns';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const events = await db
      .selectFrom("calendarEvents")
      .selectAll()
      .where("userId", "=", user.id)
      .where("startTime", "<=", todayEnd)
      .where("endTime", ">=", todayStart)
      .orderBy("startTime", "asc")
      .execute();

    const response: OutputType = events as unknown as OutputType;

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching today's events:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}