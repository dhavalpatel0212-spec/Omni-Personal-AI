import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { ChatMessages } from "../../helpers/schema";

export const schema = z.object({
  limit: z.number().int().positive().optional().default(20),
  cursor: z.number().int().positive().optional(),
  conversationId: z.number().int().positive().optional(),
});

export type InputType = z.infer<typeof schema>;

type Message = Omit<Selectable<ChatMessages>, 'conversationId'> & {
  role: 'user' | 'assistant';
};

export type OutputType = {
  messages: Message[];
  nextCursor: number | null;
  conversationId: number | null;
};

export const getAiHistory = async (
  params?: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedParams = schema.parse(params || {});
  const searchParams = new URLSearchParams();

  if (validatedParams.limit) {
    searchParams.set("limit", String(validatedParams.limit));
  }
  if (validatedParams.cursor) {
    searchParams.set("cursor", String(validatedParams.cursor));
  }
  if (validatedParams.conversationId) {
    searchParams.set("conversationId", String(validatedParams.conversationId));
  }

  const result = await fetch(`/_api/ai/history?${searchParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    throw new Error((errorObject?.error as string) || "Failed to fetch chat history");
  }

  return superjson.parse<OutputType>(await result.text());
};