import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { ShoppingItems, ShoppingItemCategoryArrayValues, ShoppingItemPriorityArrayValues } from "../../helpers/schema";

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().optional().nullable(),
  category: z.enum(ShoppingItemCategoryArrayValues).optional().nullable(),
  priority: z.enum(ShoppingItemPriorityArrayValues).optional().nullable(),
  notes: z.string().optional().nullable(),
  addedVia: z.string().optional().nullable(),
});

export const schema = z.object({
  shoppingListId: z.string(),
  items: z.array(itemSchema),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  items: Selectable<ShoppingItems>[];
} | {
  error: string;
};

export const postShoppingListItems = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/shopping_list/items`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};