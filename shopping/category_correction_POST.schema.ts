import { z } from "zod";
import superjson from 'superjson';
import { ShoppingItemCategoryArrayValues } from "../../helpers/schema";

const correctionItemSchema = z.object({
  itemName: z.string().min(1, "Item name cannot be empty."),
  originalCategory: z.enum(ShoppingItemCategoryArrayValues),
  correctedCategory: z.enum(ShoppingItemCategoryArrayValues),
  context: z.string().optional().nullable(),
});

export const schema = z.object({
  corrections: z.array(correctionItemSchema).min(1, "At least one correction is required."),
});

export type CorrectionItem = z.infer<typeof correctionItemSchema>;
export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
  message: string;
  submittedCount: number;
} | {
  success?: false;
  error: string;
  issues?: z.ZodIssue[];
};

export const postShoppingCategoryCorrection = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const response = await fetch(`/_api/shopping/category_correction`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    try {
      const errorObject = superjson.parse(text);
      if (typeof errorObject === 'object' && errorObject !== null && 'error' in errorObject) {
        throw new Error(errorObject.error as string || "An unknown error occurred");
      }
      throw new Error("An unknown error occurred");
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error("An unknown error occurred during category correction submission.");
    }
  }

  return superjson.parse<OutputType>(text);
};