import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType } from "./integrations_GET.schema";
import superjson from "superjson";
import { Selectable } from "kysely";
import { OauthAccounts } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const calendarProviders = ["google", "apple", "yahoo"];

    const accounts: Selectable<OauthAccounts>[] = await db
      .selectFrom("oauthAccounts")
      .selectAll()
      .where("userId", "=", user.id)
      .where("provider", "in", calendarProviders)
      .execute();

    const response: OutputType = accounts.map((acc) => ({
      id: acc.id.toString(),
      provider: acc.provider,
      email: acc.providerEmail,
      // In a real scenario, you might fetch sync status from another table.
      // Here we assume it's always active if connected.
      isSyncEnabled: true,
    }));

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching calendar integrations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}