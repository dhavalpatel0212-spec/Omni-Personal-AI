import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { setServerSession } from '../../helpers/getSetServerSession';
import { schema, OutputType } from './goals_POST.schema';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { nanoid } from 'nanoid';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const validatedInput = schema.parse(json);

    const newTravelGoal = await db
      .insertInto('travelGoals')
      .values({
        id: nanoid(),
        userId: user.id,
        destination: validatedInput.destination,
        description: validatedInput.description || null,
        budget: validatedInput.budget.toString(),
        targetDate: validatedInput.targetDate,
        travelers: validatedInput.travelers,
        priority: validatedInput.priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const response = new Response(
      superjson.stringify(newTravelGoal satisfies OutputType),
      {
        status: 201,
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
    console.error('Error creating travel goal:', error);
    if (error instanceof ZodError) {
      return new Response(
        superjson.stringify({ error: 'Invalid input data', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('Not authenticated') ? 401 : 500;
    
    return new Response(
      superjson.stringify({ error: 'Failed to create travel goal', details: errorMessage }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}