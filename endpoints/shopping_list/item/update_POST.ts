import { z } from "zod";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { schema, OutputType } from "./update_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const { itemId, ...updateData } = input;

    // Verify user owns the item via the shopping list
    const item = await db
      .selectFrom('shoppingItems')
      .innerJoin('shoppingLists', 'shoppingItems.shoppingListId', 'shoppingLists.id')
      .select('shoppingItems.id')
      .where('shoppingItems.id', '=', itemId)
      .where('shoppingLists.userId', '=', user.id)
      .executeTakeFirst();

    if (!item) {
      return new Response(superjson.stringify({ error: "Shopping item not found or access denied." }), { status: 404 });
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(superjson.stringify({ error: "No update data provided." }), { status: 400 });
    }

    const [updatedItem] = await db
      .updateTable('shoppingItems')
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where('id', '=', itemId)
      .returningAll()
      .execute();

    const output: OutputType = { item: updatedItem };
    return new Response(superjson.stringify(output));
  } catch (error) {
    console.error("Error updating shopping item:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: error instanceof z.ZodError ? 400 : 500 });
  }
}