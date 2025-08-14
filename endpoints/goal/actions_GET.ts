import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./actions_GET.schema";
import superjson from "superjson";
import { URL } from "url";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);

    const url = new URL(request.url);
    const goalId = url.searchParams.get("goalId");

    const validatedInput = schema.parse({
      goalId: goalId ? parseInt(goalId, 10) : undefined,
    });

    // First, verify the user owns the goal
    const goal = await db
      .selectFrom("goals")
      .select("id")
      .where("id", "=", validatedInput.goalId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (!goal) {
      return new Response(
        superjson.stringify({ error: "Goal not found or access denied." }),
        { status: 404 }
      );
    }

    const actions = await db
      .selectFrom("goalActions")
      .selectAll()
      .where("goalId", "=", validatedInput.goalId)
      .orderBy("createdAt", "asc")
      .execute();

    const output: OutputType = actions.map((action) => ({
      id: action.id,
      title: action.title,
      description: action.description,
      isCompleted: action.isCompleted ?? false,
      createdAt: action.createdAt,
      dueDate: action.dueDate,
      priority: action.priority,
    }));

    return new Response(superjson.stringify(output), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching goal actions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}