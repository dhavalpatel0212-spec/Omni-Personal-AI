import { db } from '../../../helpers/db';
import { getServerUserSession } from '../../../helpers/getServerUserSession';
import { setServerSession } from '../../../helpers/getSetServerSession';
import { schema, OutputType } from './update_POST.schema';
import superjson from 'superjson';
import { ZodError } from 'zod';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { goalId, ...updateData } = schema.parse(json);

    if (Object.keys(updateData).length === 0) {
      return new Response(
        superjson.stringify({ error: 'No fields to update provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const valuesToUpdate: any = { ...updateData, updatedAt: new Date() };
    if (updateData.budget !== undefined) {
      valuesToUpdate.budget = updateData.budget.toString();
    }

    const updatedGoal = await db
      .updateTable('travelGoals')
      .set(valuesToUpdate)
      .where('id', '=', goalId.toString())
      .where('userId', '=', user.id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedGoal) {
      return new Response(
        superjson.stringify({ error: 'Travel goal not found or you do not have permission to update it' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = new Response(
      superjson.stringify(updatedGoal satisfies OutputType),
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
    console.error('Error updating travel goal:', error);
    if (error instanceof ZodError) {
      return new Response(
        superjson.stringify({ error: 'Invalid input data', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('Not authenticated') ? 401 : 500;
    
    return new Response(
      superjson.stringify({ error: 'Failed to update travel goal', details: errorMessage }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}