import { db } from "../../../helpers/db";
import { getOAuthProvider } from "../../../helpers/getOAuthProvider";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { GoogleCalendarOAuthProvider } from '../../../helpers/GoogleCalendarOAuthProvider';
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      throw new Error('Missing code or state from OAuth provider.');
    }

    const oauthState = await db
      .selectFrom('oauthStates')
      .selectAll()
      .where('state', '=', state)
      .where('provider', '=', 'google_calendar')
      .executeTakeFirst();

    if (!oauthState || oauthState.expiresAt < new Date()) {
      await db.deleteFrom('oauthStates').where('state', '=', state).execute();
      throw new Error('Invalid or expired state. Please try connecting again.');
    }
    
    // Clean up the state
    await db.deleteFrom('oauthStates').where('id', '=', oauthState.id).execute();

    const redirectUri = new URL('/_api/calendar/google/callback', request.url).toString();
    const provider = getOAuthProvider('google_calendar', redirectUri) as GoogleCalendarOAuthProvider;

    const tokens = await provider.exchangeCodeForTokens(code, redirectUri, oauthState.codeVerifier);
    const userInfo = await provider.fetchUserInfo(tokens);
    const standardUserData = provider.mapUserData(userInfo);

    // Use primary calendar by default
    const calendarId = 'primary';

    await db
      .insertInto('calendarConnections')
      .values({
        userId: user.id,
        provider: 'google_calendar',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + (tokens.expiresIn || 3600) * 1000),
        calendarId: calendarId,
        calendarName: standardUserData.email,
      })
      .onConflict((oc) => oc
        .column('userId')
        .where('provider', '=', 'google_calendar')
        .doUpdateSet({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + (tokens.expiresIn || 3600) * 1000),
          calendarId: calendarId,
          calendarName: standardUserData.email,
          updatedAt: new Date(),
        })
      )
      .execute();

    // Redirect user back to the app, ideally to the settings page
    const finalRedirectUrl = new URL(oauthState.redirectUrl || '/settings/integrations', request.url);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': finalRedirectUrl.toString(),
      },
    });

  } catch (error) {
    console.error("Google Calendar OAuth callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    const errorPageUrl = new URL('/error', request.url);
    errorPageUrl.searchParams.set('message', `Failed to connect Google Calendar: ${errorMessage}`);
    return new Response(null, {
        status: 302,
        headers: { 'Location': errorPageUrl.toString() },
    });
  }
}