import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { ShoppingLists } from '../helpers/schema';

export const schema = z.object({
  name: z.string().trim().min(1, "List name cannot be empty.").max(100, "List name must be 100 characters or less"),
  description: z.string().trim().max(500, "Description must be 500 characters or less").optional()
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  shoppingList: Selectable<ShoppingLists>;
} | {
  error: string;
};

export const postShoppingLists = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/shopping_lists`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};