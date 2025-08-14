import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./actions_POST.schema";
import superjson from "superjson";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const validatedInput = schema.parse(json);

    // Verify the user owns the goal before adding an action
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

    const newAction = await db
      .insertInto("goalActions")
      .values({
        goalId: validatedInput.goalId,
        title: validatedInput.title,
        description: validatedInput.description,
        dueDate: validatedInput.dueDate ? new Date(validatedInput.dueDate) : null,
        priority: validatedInput.priority || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const output: OutputType = {
      id: newAction.id,
      title: newAction.title,
      description: newAction.description,
      isCompleted: newAction.isCompleted ?? false,
      createdAt: newAction.createdAt,
      dueDate: newAction.dueDate,
      priority: newAction.priority,
    };

    return new Response(superjson.stringify(output), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating goal action:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}