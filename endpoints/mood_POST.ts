import { getServerUserSession } from '../helpers/getServerUserSession';
import { setServerSession } from '../helpers/getSetServerSession';
import { db } from '../helpers/db';
import { logMoodSchema } from './mood.schema';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);
    const body = await request.json();
    const { moodValue, emoji, notes } = logMoodSchema.parse(body);

    // Check if user already logged mood today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingMood = await db
      .selectFrom('moodLogs')
      .select(['id'])
      .where('userId', '=', user.id)
      .where('loggedAt', '>=', today)
      .where('loggedAt', '<', tomorrow)
      .executeTakeFirst();

    if (existingMood) {
      // Update existing mood for today
      await db
        .updateTable('moodLogs')
        .set({
          moodValue,
          emoji,
          notes,
          loggedAt: new Date()
        })
        .where('id', '=', existingMood.id)
        .execute();
    } else {
      // Create new mood entry
      await db
        .insertInto('moodLogs')
        .values({
          userId: user.id,
          moodValue,
          emoji,
          notes,
          loggedAt: new Date()
        })
        .execute();
    }

    const response = Response.json(superjson.serialize({
      success: true,
      message: 'Mood logged successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

    await setServerSession(response, {
      id: session.id,
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed.getTime(),
    });

    return response;
  } catch (error) {
    console.error('Mood logging error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return Response.json(superjson.serialize({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return Response.json(superjson.serialize({ error: 'Failed to log mood' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}