import { getServerUserSession } from '../../helpers/getServerUserSession';
import { setServerSession } from '../../helpers/getSetServerSession';
import { db } from '../../helpers/db';
import { schema } from './update_POST.schema';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);
    
    // Parse request body
    const bodyText = await request.text();
    const body = superjson.parse(bodyText);

    // Validate input
    const validatedInput = schema.parse(body);

    // Check if goal exists and belongs to user
    const existingGoal = await db
      .selectFrom('goals')
      .selectAll()
      .where('id', '=', validatedInput.goalId)
      .where('userId', '=', user.id)
      .executeTakeFirst();

    if (!existingGoal) {
      return Response.json(superjson.serialize({ error: 'Goal not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (validatedInput.title !== undefined) {
      updateData.title = validatedInput.title;
    }
    if (validatedInput.description !== undefined) {
      updateData.description = validatedInput.description;
    }
    if (validatedInput.status !== undefined) {
      updateData.status = validatedInput.status;
    }
    if (validatedInput.priority !== undefined) {
      updateData.priority = validatedInput.priority;
    }
    if (validatedInput.progress !== undefined) {
      updateData.progress = validatedInput.progress;
    }
    if (validatedInput.dueDate !== undefined) {
      updateData.dueDate = validatedInput.dueDate;
    }

    // Update goal
    const updatedGoal = await db
      .updateTable('goals')
      .set(updateData)
      .where('id', '=', validatedInput.goalId)
      .where('userId', '=', user.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    // Log progress change if progress was updated
    if (validatedInput.progress !== undefined && validatedInput.progress !== existingGoal.progress) {
      await db
        .insertInto('goalProgress')
        .values({
          goalId: validatedInput.goalId,
          progress: validatedInput.progress,
          notes: `Progress updated from ${existingGoal.progress}% to ${validatedInput.progress}%`,
          loggedAt: new Date()
        })
        .execute();
    }

    const response = Response.json(superjson.serialize(updatedGoal), {
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
    console.error('Goals update POST error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return Response.json(superjson.serialize({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(superjson.serialize({ error: 'Invalid input data' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return Response.json(superjson.serialize({ error: 'Failed to update goal' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}