import { z } from "zod";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./details_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const url = new URL(request.url);
    const shoppingListId = url.searchParams.get('shoppingListId');

    const input = schema.parse({ shoppingListId });

    const list = await db
      .selectFrom('shoppingLists')
      .selectAll()
      .where('id', '=', input.shoppingListId)
      .where('userId', '=', user.id)
      .where('isArchived', '=', false)
      .executeTakeFirst();

    if (!list) {
      return new Response(superjson.stringify({ error: "Shopping list not found." }), { status: 404 });
    }

    const items = await db
      .selectFrom('shoppingItems')
      .selectAll()
      .where('shoppingListId', '=', input.shoppingListId)
      .orderBy('createdAt', 'desc')
      .execute();

    const output: OutputType = {
      shoppingList: {
        ...list,
        items: items.map(item => ({
          ...item,
          estimatedPrice: item.estimatedPrice ? Number(item.estimatedPrice) : null,
          actualPrice: item.actualPrice ? Number(item.actualPrice) : null,
        })),
      }
    };
    
    return new Response(superjson.stringify(output));
  } catch (error) {
    console.error("Error fetching shopping list details:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: error instanceof z.ZodError ? 400 : 500 });
  }
}