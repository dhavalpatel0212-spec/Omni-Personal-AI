import { z } from "zod";
import superjson from 'superjson';
import { ShoppingItemCategoryArrayValues } from "../../helpers/schema";

export const schema = z.object({
  text: z.string().min(1, "Text cannot be empty."),
});

export type InputType = z.infer<typeof schema>;

export const AnalyzedItem = z.object({
  name: z.string(),
  quantity: z.number().optional().default(1),
  category: z.enum(ShoppingItemCategoryArrayValues).optional().default('other'),
  estimated_price: z.number().nullable().optional().default(null),
});

export type AnalyzedItem = z.infer<typeof AnalyzedItem>;

export type OutputType = {
  items: AnalyzedItem[];
} | {
  error: string;
};

export const postParseVoiceShopping = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/ai/parse_voice_shopping`, {
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