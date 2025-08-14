import { z } from "zod";

export const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type OutputType =
  | {
      success: boolean;
      message: string;
    }
  | {
      error: string;
    };

export const postPasswordResetRequest = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/auth/password_reset_request`, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  const data = await result.json();
  
  if (!result.ok) {
    throw new Error(data.error || "Failed to send password reset email");
  }
  
  return data;
};