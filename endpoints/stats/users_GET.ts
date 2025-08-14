import { db } from '../../helpers/db';
import superjson from 'superjson';
import { OutputType } from './users_GET.schema';

export async function handle(request: Request) {
  try {
    const result = await db
      .selectFrom('users')
      .select(db.fn.count<string>('id').as('userCount')) // postgres-js returns count as a string
      .executeTakeFirst();

    const totalUsers = Number(result?.userCount || 0);

    const responseData: OutputType = {
      totalUsers,
    };

    return new Response(superjson.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    const errorResponse = { error: 'Failed to retrieve user statistics' };
    return new Response(superjson.stringify(errorResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}