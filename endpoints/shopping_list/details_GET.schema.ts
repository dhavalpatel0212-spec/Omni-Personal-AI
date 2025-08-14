import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { ShoppingLists, ShoppingItems } from "../../helpers/schema";

export const schema = z.object({
  shoppingListId: z.string(),
});

export type InputType = z.infer<typeof schema>;

export type ShoppingItem = Omit<Selectable<ShoppingItems>, 'estimatedPrice' | 'actualPrice'> & {
  estimatedPrice: number | null;
  actualPrice: number | null;
};

export type ShoppingListDetails = Selectable<ShoppingLists> & {
  items: ShoppingItem[];
};

export type OutputType = {
  shoppingList: ShoppingListDetails;
} | {
  error: string;
};

export const getShoppingListDetails = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const result = await fetch(`/_api/shopping_list/details?shoppingListId=${validatedParams.shoppingListId}`, {
    method: "GET",
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