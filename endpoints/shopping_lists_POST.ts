import { z } from "zod";
import { db } from '../helpers/db';
import { getServerUserSession } from '../helpers/getServerUserSession';
import { schema, OutputType } from "./shopping_lists_POST.schema";
import superjson from 'superjson';


export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const bodyText = await request.text();
    const json = superjson.parse(bodyText);
    
    const input = schema.parse(json);

    const [newList] = await db.
    insertInto('shoppingLists').
    values({
      userId: user.id,
      name: input.name,
      description: input.description
    }).
    returningAll().
    execute();

    if (!newList) {
      throw new Error("Failed to create shopping list.");
    }

    const output: OutputType = { shoppingList: newList };
    return new Response(superjson.stringify(output), { status: 201 });
  } catch (error) {
    console.error("Error creating shopping list:", error);
    
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return new Response(superjson.stringify({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid input data';
      return new Response(superjson.stringify({ error: errorMessage }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (error instanceof SyntaxError) {
      return new Response(superjson.stringify({ error: 'Invalid JSON format' }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}