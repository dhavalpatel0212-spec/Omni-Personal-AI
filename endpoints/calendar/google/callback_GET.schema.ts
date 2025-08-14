import { z } from "zod";

// This endpoint is for server-side redirect, so it doesn't have a client-side fetch helper.
// The schema is for validating query parameters.
export const schema = z.object({
  code: z.string(),
  state: z.string(),
  scope: z.string().optional(),
  error: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

// No direct output type as it's a redirect.
export type OutputType = void;