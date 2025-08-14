import { z } from "zod";
import superjson from 'superjson';
import { ShoppingItemCategoryArrayValues } from "../../helpers/schema";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const schema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 10MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
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

export const postAnalyzeShoppingImage = async (formData: FormData, init?: RequestInit): Promise<OutputType> => {
  // Frontend validation can happen here before sending, but the schema is for the server.
  const result = await fetch(`/_api/ai/analyze_shopping_image`, {
    method: "POST",
    body: formData,
    ...init,
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};