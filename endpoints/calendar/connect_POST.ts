import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./connect_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // This endpoint should initiate an OAuth flow.
    // The actual connection logic is handled by the OAuth callback endpoint.
    // This endpoint's role is to return the authorization URL to the client.
    // We will use the existing OAuth flow helpers.
    // The client should redirect the user to this URL.

    const authorizeUrl = new URL(
      `/_api/auth/oauth_authorize?provider=${input.provider}`,
      request.url
    );

    const response: OutputType = {
      authorizeUrl: authorizeUrl.toString(),
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error connecting calendar:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}