import { z } from "zod";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const result = await db
      .updateTable('shoppingLists')
      .set({ isArchived: true })
      .where('id', '=', input.shoppingListId)
      .where('userId', '=', user.id)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      return new Response(superjson.stringify({ error: "Shopping list not found or access denied." }), { status: 404 });
    }

    const output: OutputType = { success: true };
    return new Response(superjson.stringify(output));
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: error instanceof z.ZodError ? 400 : 500 });
  }
}