import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  conversationId: z.number().int().positive().optional(),
  userMessage: z.string().min(1, "User message cannot be empty."),
  assistantMessage: z.string().min(1, "Assistant message cannot be empty."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  conversationId: number;
  userMessageId: number;
  assistantMessageId: number;
};

export const postAiMessage = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/ai/message`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    throw new Error((errorObject?.error as string) || "Failed to save chat message");
  }

  return superjson.parse<OutputType>(await result.text());
};