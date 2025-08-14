import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./connect_POST.schema";
import { getOAuthProvider } from "../../../helpers/getOAuthProvider";
import { db } from "../../../helpers/db";
import { nanoid } from "nanoid";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const input = schema.parse(superjson.parse(await request.text()));

    const redirectUrl = new URL('/_api/calendar/google/callback', request.url).toString();
    const provider = getOAuthProvider('google_calendar', redirectUrl);

    const state = nanoid();
    const { url: authorizeUrl, codeVerifier } = provider.generateAuthorizationUrl(state);

    // Store state and code verifier to prevent CSRF and for PKCE
    await db
      .insertInto('oauthStates')
      .values({
        provider: 'google_calendar',
        state,
        codeVerifier,
        redirectUrl: input.redirectUrl || '/',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      })
      .execute();

    const response: OutputType = { authorizeUrl };

    return new Response(superjson.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error initiating Google Calendar connection:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}