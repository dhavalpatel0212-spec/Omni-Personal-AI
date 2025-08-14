import { getServerUserSession } from '../helpers/getServerUserSession';
import { setServerSession } from '../helpers/getSetServerSession';
import { db } from '../helpers/db';
import { schema } from './goals_POST.schema';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);
    
    // Validate request size (1MB limit)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return Response.json(superjson.serialize({ error: 'Request too large' }), { 
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const bodyText = await request.text();
    if (bodyText.length > 1024 * 1024) {
      return Response.json(superjson.serialize({ error: 'Request too large' }), { 
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = superjson.parse(bodyText);

    // Validate input
    const validatedInput = schema.parse(body);

    // Create new goal
    const newGoal = await db
      .insertInto('goals')
      .values({
        userId: user.id,
        title: validatedInput.title,
        description: validatedInput.description || null,
        priority: validatedInput.priority || 'medium',
        dueDate: validatedInput.dueDate || null,
        status: 'not_started',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const response = Response.json(superjson.serialize(newGoal), {
      status: 201,
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
    console.error('Goals POST error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return Response.json(superjson.serialize({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      const errorMessage = zodError.errors?.[0]?.message || 'Invalid input data';
      return Response.json(superjson.serialize({ error: errorMessage }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (error instanceof SyntaxError) {
      return Response.json(superjson.serialize({ error: 'Invalid JSON format' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return Response.json(superjson.serialize({ error: 'Failed to create goal' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}