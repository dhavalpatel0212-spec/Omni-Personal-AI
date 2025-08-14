import { z } from "zod";
import superjson from 'superjson';
import { GoalPriorityArrayValues } from "../../helpers/schema";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const schema = z.object({
  image: z
    .instanceof(File, { message: "Image is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 10MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

export type InputType = z.infer<typeof schema>;

export const AnalyzedGoal = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  priority: z.enum(GoalPriorityArrayValues).nullable().optional(),
  dueDate: z.string().nullable().optional(), // Keep as string from AI, convert to Date on client/server
});

export type AnalyzedGoal = z.infer<typeof AnalyzedGoal>;

export type OutputType = {
  goals: AnalyzedGoal[];
} | {
  error: string;
};

export const postAnalyzeImageForGoals = async (formData: FormData, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/ai/analyze_image_for_goals`, {
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