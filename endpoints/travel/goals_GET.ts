import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { setServerSession } from '../../helpers/getSetServerSession';
import { schema, OutputType } from './goals_GET.schema';
import superjson from 'superjson';
import { ZodError } from 'zod';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);

    const url = new URL(request.url);
    const queryParams = {
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
    };

    const validatedInput = schema.parse(queryParams);

    const travelGoals = await db
      .selectFrom('travelGoals')
      .selectAll()
      .where('userId', '=', user.id)
      .orderBy(validatedInput.sortBy, validatedInput.sortOrder)
      .execute();

    const response = new Response(
      superjson.stringify({ travelGoals } satisfies OutputType),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    await setServerSession(response, {
      id: session.id,
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed.getTime(),
    });

    return response;
  } catch (error) {
    console.error('Error fetching travel goals:', error);
    if (error instanceof ZodError) {
      return new Response(
        superjson.stringify({ error: 'Invalid input data', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('Not authenticated') ? 401 : 500;
    
    return new Response(
      superjson.stringify({ error: 'Failed to retrieve travel goals', details: errorMessage }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}