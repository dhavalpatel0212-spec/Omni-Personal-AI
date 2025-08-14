import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { ShoppingItems, ShoppingItemCategoryArrayValues, ShoppingItemPriorityArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  itemId: z.string(),
  shoppingListId: z.string(),
  name: z.string().min(1).optional(),
  quantity: z.number().optional().nullable(),
  category: z.enum(ShoppingItemCategoryArrayValues).optional().nullable(),
  priority: z.enum(ShoppingItemPriorityArrayValues).optional().nullable(),
  notes: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
  estimatedPrice: z.number().optional().nullable(),
  actualPrice: z.number().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  item: Selectable<ShoppingItems>;
} | {
  error: string;
};

export const postShoppingListItemUpdate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/shopping_list/item/update`, {
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