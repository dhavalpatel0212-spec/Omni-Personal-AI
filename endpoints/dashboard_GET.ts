import { getServerUserSession } from '../helpers/getServerUserSession';
import { setServerSession } from '../helpers/getSetServerSession';
import { db } from '../helpers/db';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);

    // Get goal summary by status
    const goalSummaryResults = await db
      .selectFrom('goals')
      .select([
        'status',
        db.fn.count<number>('id').as('count')
      ])
      .where('userId', '=', user.id)
      .groupBy('status')
      .execute();

    const goalSummary = {
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      paused: 0,
      total: 0
    };

    goalSummaryResults.forEach(result => {
      const count = Number(result.count);
      goalSummary.total += count;
      
      switch (result.status) {
        case 'completed':
          goalSummary.completed = count;
          break;
        case 'in_progress':
          goalSummary.inProgress = count;
          break;
        case 'not_started':
          goalSummary.notStarted = count;
          break;
        case 'paused':
          goalSummary.paused = count;
          break;
      }
    });

    // Get recent activities (last 10 progress entries)
    const recentActivities = await db
      .selectFrom('goalProgress')
      .innerJoin('goals', 'goalProgress.goalId', 'goals.id')
      .select([
        'goalProgress.id',
        'goalProgress.goalId',
        'goalProgress.progress',
        'goalProgress.notes',
        'goalProgress.loggedAt',
        'goals.title as goalTitle'
      ])
      .where('goals.userId', '=', user.id)
      .orderBy('goalProgress.loggedAt', 'desc')
      .limit(10)
      .execute();

    // Get productivity stats
    const productivityResults = await db
      .selectFrom('goals')
      .select([
        db.fn.avg<number>('progress').as('avgProgress'),
        db.fn.count<number>('id').as('totalGoals')
      ])
      .where('userId', '=', user.id)
      .executeTakeFirst();

    const productivityStats = {
      overallProgress: Math.round(Number(productivityResults?.avgProgress || 0)),
      goalsCompleted: goalSummary.completed,
      goalsInProgress: goalSummary.inProgress
    };

    const dashboardData = {
      goalSummary,
      recentActivities,
      productivityStats
    };

    const response = Response.json(superjson.serialize(dashboardData), {
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
    console.error('Dashboard GET error:', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return Response.json(superjson.serialize({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return Response.json(superjson.serialize({ error: 'Failed to retrieve dashboard data' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}