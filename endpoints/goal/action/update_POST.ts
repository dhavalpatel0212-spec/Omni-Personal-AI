import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./update_POST.schema";
import superjson from "superjson";
import { Updateable } from "kysely";
import { GoalActions } from "../../../helpers/schema";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { actionId, ...updates } = schema.parse(json);

    if (Object.keys(updates).length === 0) {
      return new Response(
        superjson.stringify({ error: "No update fields provided." }),
        { status: 400 }
      );
    }

    // Verify the user owns the goal associated with the action
    const existingAction = await db
      .selectFrom("goalActions")
      .innerJoin("goals", "goals.id", "goalActions.goalId")
      .select("goalActions.id")
      .where("goalActions.id", "=", actionId)
      .where("goals.userId", "=", user.id)
      .executeTakeFirst();

    if (!existingAction) {
      return new Response(
        superjson.stringify({ error: "Action not found or access denied." }),
        { status: 404 }
      );
    }

    const updateData: Updateable<GoalActions> = {
      ...updates,
      dueDate: updates.dueDate !== undefined ? (updates.dueDate ? new Date(updates.dueDate) : null) : undefined,
      updatedAt: new Date(),
    };

    const updatedAction = await db
      .updateTable("goalActions")
      .set(updateData)
      .where("id", "=", actionId)
      .returningAll()
      .executeTakeFirstOrThrow();

    const output: OutputType = {
      id: updatedAction.id,
      title: updatedAction.title,
      description: updatedAction.description,
      isCompleted: updatedAction.isCompleted ?? false,
      createdAt: updatedAction.createdAt,
      dueDate: updatedAction.dueDate,
      priority: updatedAction.priority,
    };

    return new Response(superjson.stringify(output), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating goal action:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}