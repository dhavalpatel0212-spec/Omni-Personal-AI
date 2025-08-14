import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType } from "./account_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    // This is a placeholder implementation.
    // The database schema needs a 'user_settings' table to store account-level settings.
    // For now, returning default values.
    console.warn(
      "account_GET: 'user_settings' table not found in schema. Returning default values."
    );

    const response: OutputType = {
      language: "en-US",
      theme: "system",
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching account settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}