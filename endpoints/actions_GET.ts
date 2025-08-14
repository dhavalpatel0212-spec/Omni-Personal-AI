import { getServerUserSession } from '../helpers/getServerUserSession';
import { db } from '../helpers/db';
import { schema } from './actions_GET.schema';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const url = new URL(request.url);
    const queryParams = {
      status: url.searchParams.get('status') || undefined,
      priority: url.searchParams.get('priority') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc'
    };

    const validatedInput = schema.parse(queryParams);

    let query = db
      .selectFrom('standaloneActions')
      .selectAll()
      .where('userId', '=', user.id);

    if (validatedInput.status) {
      const isCompleted = validatedInput.status === 'completed';
      query = query.where('isCompleted', '=', isCompleted);
    }
    
    if (validatedInput.priority) {
      query = query.where('priority', '=', validatedInput.priority);
    }

    const sortColumn = validatedInput.sortBy;
    const sortDirection = validatedInput.sortOrder;
    query = query.orderBy(sortColumn, sortDirection);

    const actions = await query.execute();

    return new Response(superjson.stringify({ actions }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Standalone Actions GET error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return new Response(superjson.stringify({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(superjson.stringify({ error: 'Failed to retrieve standalone actions' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}