import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  goalId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

const Recommendation = z.object({
  title: z.string(),
  description: z.string(),
});

export const OutputSchema = z.object({
  recommendations: z.array(Recommendation),
});

export type OutputType = z.infer<typeof OutputSchema>;

export const postAiGoalRecommendations = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/ai/goal_recommendations`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || "Unknown error occurred while fetching recommendations.");
  }
  
  const responseData = superjson.parse<OutputType>(await result.text());
  
  // Validate the structure of the received data
  const validationResult = OutputSchema.safeParse(responseData);
  if (!validationResult.success) {
    console.error("Invalid response structure from goal_recommendations endpoint:", validationResult.error);
    throw new Error("Received invalid data format from the server.");
  }

  return validationResult.data;
};