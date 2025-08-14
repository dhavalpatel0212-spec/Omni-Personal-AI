import { OutputType } from "./performance_metrics_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    // For now, we return mock data as requested.
    // In the future, this will be replaced with a database query to an AI logging table.
    const mockData: OutputType = {
      totalOperations: 1337,
      averageDuration: 420,
      modelPerformance: [
        {
          model: 'gpt-4o-mini',
          usage: 1024,
          averageDuration: 250,
          successRate: 98.5,
        },
        {
          model: 'gpt-4o',
          usage: 313,
          averageDuration: 850,
          successRate: 99.2,
        },
      ],
    };

    return new Response(superjson.stringify(mockData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching AI performance metrics:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 500 });
  }
}