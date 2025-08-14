import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./settings_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const accountId = parseInt(input.accountId, 10);

    // Verify the calendar integration belongs to the user
    const integration = await db
      .selectFrom("calendarIntegrations")
      .select(["id"])
      .where("id", "=", accountId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (!integration) {
      return new Response(
        superjson.stringify({
          error: "Calendar integration not found or you do not have permission to modify it.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update the calendar integration settings
    await db
      .updateTable("calendarIntegrations")
      .set({
        syncEnabled: input.isSyncEnabled,
        updatedAt: new Date(),
      })
      .where("id", "=", accountId)
      .where("userId", "=", user.id)
      .execute();

    const response: OutputType = {
      success: true,
      message: "Calendar settings updated successfully.",
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating calendar settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}