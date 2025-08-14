import { getServerUserSession } from '../../helpers/getServerUserSession';
import { setServerSession } from '../../helpers/getSetServerSession';
import { db } from '../../helpers/db';
import { sql } from 'kysely';
import { schema } from './today_GET.schema';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);
    
    // Validate input (empty object for GET with no params)
    const validatedInput = schema.parse({});

    // Query actions due today using SQL date functions to avoid timezone issues
    const actions = await db
      .selectFrom('goalActions')
      .innerJoin('goals', 'goalActions.goalId', 'goals.id')
      .select([
        'goalActions.id',
        'goalActions.title',
        'goalActions.description',
        'goalActions.isCompleted',
        'goalActions.createdAt',
        'goalActions.dueDate',
        'goalActions.priority',
        'goalActions.goalId',
        'goalActions.updatedAt',
        'goals.title as goalTitle'
      ])
      .where('goals.userId', '=', user.id)
      .where(sql`goal_actions.due_date >= date_trunc('day', now() at time zone 'UTC')`)
      .where(sql`goal_actions.due_date < date_trunc('day', now() at time zone 'UTC') + interval '1 day'`)
      .where('goalActions.isCompleted', '=', false)
      .orderBy('goalActions.dueDate', 'asc')
      .orderBy('goalActions.priority', 'desc')
      .execute();

    const response = Response.json(superjson.serialize({ actions }), {
      headers: { 'Content-Type': 'application/json' }
    });

    // Update session cookie
    await setServerSession(response, {
      id: session.id,
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed.getTime(),
    });

    return response;
  } catch (error) {
    console.error('Actions today GET error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return Response.json(superjson.serialize({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return Response.json(superjson.serialize({ error: 'Failed to fetch today\'s actions' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}