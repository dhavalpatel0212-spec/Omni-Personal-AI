import { getServerUserSession } from '../helpers/getServerUserSession';
import { db } from '../helpers/db';
import { schema, OutputType } from './actions_POST.schema';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const body = superjson.parse(await request.text());

    const validatedInput = schema.parse(body);

    const newAction = await db
      .insertInto('standaloneActions')
      .values({
        userId: user.id,
        title: validatedInput.title,
        description: validatedInput.description,
        priority: validatedInput.priority,
        dueDate: validatedInput.dueDate,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newAction satisfies OutputType), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Standalone Action POST error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return new Response(superjson.stringify({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return new Response(superjson.stringify({ error: 'Invalid input data' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(superjson.stringify({ error: 'Failed to create action' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}