import { getServerUserSession } from '../../helpers/getServerUserSession';
import { db } from '../../helpers/db';
import { schema, OutputType } from './update_POST.schema';
import superjson from 'superjson';
import { Updateable } from 'kysely';
import { StandaloneActions } from '../../helpers/schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const body = superjson.parse(await request.text());

    const { actionId, ...updates } = schema.parse(body);

    const existingAction = await db
      .selectFrom('standaloneActions')
      .select('id')
      .where('id', '=', actionId)
      .where('userId', '=', user.id)
      .executeTakeFirst();

    if (!existingAction) {
      return new Response(superjson.stringify({ error: 'Action not found or access denied' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (Object.keys(updates).length === 0) {
        return new Response(superjson.stringify({ error: 'No update fields provided' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const updateData: Updateable<StandaloneActions> = {
      ...updates,
      updatedAt: new Date()
    };

    const updatedAction = await db
      .updateTable('standaloneActions')
      .set(updateData)
      .where('id', '=', actionId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(updatedAction satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Standalone Action update POST error:', error);
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
    return new Response(superjson.stringify({ error: 'Failed to update action' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}