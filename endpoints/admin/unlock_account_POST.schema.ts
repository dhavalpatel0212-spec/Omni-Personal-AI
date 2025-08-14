import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  email: z.string().email("A valid email address is required."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  message: string;
  error?: never; // Ensure error responses are typed separately
};

export type ErrorOutputType = {
  error: string;
  details?: any;
};

export const postUnlockAccount = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const response = await fetch(`/_api/admin/unlock_account`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject: ErrorOutputType = superjson.parse(await response.text());
    throw new Error(errorObject.error || "Failed to unlock account.");
  }

  return superjson.parse<OutputType>(await response.text());
};