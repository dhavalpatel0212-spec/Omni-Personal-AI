import { z } from "zod";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./items_POST.schema";
import superjson from 'superjson';


export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Verify user owns the shopping list
    const list = await db
      .selectFrom('shoppingLists')
      .select('id')
      .where('id', '=', input.shoppingListId)
      .where('userId', '=', user.id)
      .executeTakeFirst();

    if (!list) {
      return new Response(superjson.stringify({ error: "Shopping list not found or access denied." }), { status: 404 });
    }

    const itemsToInsert = input.items.map(item => ({
      shoppingListId: input.shoppingListId,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      priority: item.priority,
      notes: item.notes,
      addedVia: item.addedVia,
    }));

    if (itemsToInsert.length === 0) {
      return new Response(superjson.stringify({ items: [] }), { status: 200 });
    }

    const newItems = await db
      .insertInto('shoppingItems')
      .values(itemsToInsert)
      .returningAll()
      .execute();

    const output: OutputType = { items: newItems };
    return new Response(superjson.stringify(output), { status: 201 });
  } catch (error) {
    console.error("Error adding shopping items:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: error instanceof z.ZodError ? 400 : 500 });
  }
}