import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { ShoppingLists } from '../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type ShoppingListWithCounts = Selectable<ShoppingLists> & {
  totalItems: number;
  completedItems: number;
};

export type OutputType = {
  shoppingLists: ShoppingListWithCounts[];
} | {
  error: string;
};

export const getShoppingLists = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/shopping_lists`, {
    method: "GET",
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