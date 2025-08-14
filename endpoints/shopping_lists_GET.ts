import { db } from '../helpers/db';
import { getServerUserSession } from '../helpers/getServerUserSession';
import { schema, OutputType } from "./shopping_lists_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);

    const lists = await db.
    selectFrom('shoppingLists').
    leftJoin('shoppingItems', 'shoppingLists.id', 'shoppingItems.shoppingListId').
    select([
    'shoppingLists.id',
    'shoppingLists.name',
    'shoppingLists.description',
    'shoppingLists.createdAt',
    'shoppingLists.updatedAt',
    'shoppingLists.userId',
    'shoppingLists.isArchived',
    (eb) => eb.fn.count('shoppingItems.id').as('totalItems'),
    (eb) => eb.fn.count('shoppingItems.id').filterWhere('shoppingItems.isCompleted', '=', true).as('completedItems')]
    ).
    where('shoppingLists.userId', '=', user.id).
    where('shoppingLists.isArchived', '=', false).
    groupBy(['shoppingLists.id']).
    orderBy('shoppingLists.updatedAt', 'desc').
    execute();

    const output: OutputType = {
      shoppingLists: lists.map((list) => ({
        ...list,
        totalItems: Number(list.totalItems),
        completedItems: Number(list.completedItems)
      }))
    };

    return new Response(superjson.stringify(output));
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 500 });
  }
}