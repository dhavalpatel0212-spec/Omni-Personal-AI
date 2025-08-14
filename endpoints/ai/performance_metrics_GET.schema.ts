import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type ModelPerformance = {
  model: 'gpt-4o' | 'gpt-4o-mini';
  usage: number;
  averageDuration: number;
  successRate: number;
};

export type OutputType = {
  totalOperations: number;
  averageDuration: number;
  modelPerformance: ModelPerformance[];
};

export const getAiPerformanceMetrics = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/ai/performance_metrics`, {
    method: "GET",
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
  return superjson.parse<OutputType>(await result.text());
};