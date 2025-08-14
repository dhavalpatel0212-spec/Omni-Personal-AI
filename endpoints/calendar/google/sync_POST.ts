// This is a simplified implementation. A production version would need more robust error handling,
// token refresh logic, and pagination for fetching events.

import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./sync_POST.schema";
import { GoogleCalendarOAuthProvider } from "../../../helpers/GoogleCalendarOAuthProvider";
import superjson from "superjson";
import { addMonths, subMonths } from 'date-fns';

async function getValidAccessToken(userId: number, connectionId: number): Promise<string> {
  const connection = await db
    .selectFrom('calendarConnections')
    .selectAll()
    .where('id', '=', connectionId)
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow();

  if (connection.expiresAt && new Date(connection.expiresAt) > new Date()) {
    return connection.accessToken;
  }

  if (!connection.refreshToken) {
    throw new Error('No refresh token available. Please reconnect your account.');
  }

  const provider = new GoogleCalendarOAuthProvider(''); // redirectUri not needed for refresh
  const newTokens = await provider.refreshToken(connection.refreshToken);

  await db
    .updateTable('calendarConnections')
    .set({
      accessToken: newTokens.accessToken,
      expiresAt: new Date(Date.now() + (newTokens.expiresIn || 3600) * 1000),
      updatedAt: new Date(),
    })
    .where('id', '=', connectionId)
    .execute();

  return newTokens.accessToken;
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const connection = await db
      .selectFrom('calendarConnections')
      .selectAll()
      .where('userId', '=', user.id)
      .where('provider', '=', 'google_calendar')
      .executeTakeFirst();

    if (!connection) {
      throw new Error('Google Calendar is not connected.');
    }

    const accessToken = await getValidAccessToken(user.id, connection.id);
    const calendarId = connection.calendarId || 'primary';

    const timeMin = subMonths(new Date(), 1).toISOString();
    const timeMax = addMonths(new Date(), 3).toISOString();

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`);
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch events from Google: ${errorData.error.message}`);
    }

    const data = await response.json();
    const events = data.items || [];

    let syncedCount = 0;
    if (events.length > 0) {
      const eventRecords = events.map((event: any) => ({
        userId: user.id,
        connectionId: connection.id,
        googleEventId: event.id,
        title: event.summary || 'No Title',
        description: event.description,
        startTime: new Date(event.start.dateTime || event.start.date),
        endTime: new Date(event.end.dateTime || event.end.date),
        isAllDay: !!event.start.date,
        location: event.location,
        attendees: event.attendees?.map((a: any) => a.email) || [],
        meetingUrl: event.hangoutLink,
        status: event.status,
      }));

      // Upsert events based on googleEventId
      for (const record of eventRecords) {
        await db
          .insertInto('calendarEvents')
          .values(record)
          .onConflict(oc => oc
            .column('googleEventId')
            .doUpdateSet({
              title: record.title,
              description: record.description,
              startTime: record.startTime,
              endTime: record.endTime,
              isAllDay: record.isAllDay,
              location: record.location,
              attendees: record.attendees,
              meetingUrl: record.meetingUrl,
              status: record.status,
              updatedAt: new Date(),
            })
          )
          .execute();
      }
      syncedCount = events.length;
    }
    
    await db.updateTable('calendarConnections').set({ lastSyncAt: new Date() }).where('id', '=', connection.id).execute();

    const output: OutputType = { syncedEventsCount: syncedCount };
    return new Response(superjson.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error syncing Google Calendar:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}