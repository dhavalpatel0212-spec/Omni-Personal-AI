import { z } from "zod";
import superjson from "superjson";

// Support OpenAI's message format with content arrays
const TextContent = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const ImageUrlContent = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string(), // This will be a data URL with base64 encoded image
  }),
});

const ContentPart = z.union([TextContent, ImageUrlContent]);

const MessageContent = z.union([
  z.string(), // Legacy format for text-only messages
  z.array(ContentPart), // New format supporting text and images
]);

const Message = z.object({
  role: z.enum(["user", "assistant"]),
  content: MessageContent,
});

export const schema = z.object({
  messages: z.array(Message),
});

export type InputType = z.infer<typeof schema>;

// The output is a stream, so we don't define a specific Zod schema for it.
// The helper will return the raw Response object for the client to handle.
export type OutputType = Response;

export const postAiChat = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/ai/chat`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || "Unknown error occurred");
  }

  // For streaming responses, we return the raw Response object
  return result;
};