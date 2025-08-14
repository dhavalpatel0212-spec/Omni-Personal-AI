import { getServerUserSession } from '../helpers/getServerUserSession';
import { setServerSession } from '../helpers/getSetServerSession';
import { db } from '../helpers/db';
import { schema } from './goals_GET.schema';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);
    
    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = {
      status: url.searchParams.get('status') || undefined,
      priority: url.searchParams.get('priority') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc'
    };

    // Validate input
    const validatedInput = schema.parse(queryParams);

    // Build query
    let query = db
      .selectFrom('goals')
      .selectAll()
      .where('userId', '=', user.id);

    // Apply filters
    if (validatedInput.status) {
      query = query.where('status', '=', validatedInput.status);
    }
    
    if (validatedInput.priority) {
      query = query.where('priority', '=', validatedInput.priority);
    }

    // Apply sorting
    const sortColumn = validatedInput.sortBy;
    const sortDirection = validatedInput.sortOrder;
    query = query.orderBy(sortColumn, sortDirection);

    const goals = await query.execute();

    const response = Response.json(superjson.serialize({ goals }), {
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
    console.error('Goals GET error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return Response.json(superjson.serialize({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return Response.json(superjson.serialize({ error: 'Failed to retrieve goals' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}