import { z } from "zod";
import { User } from "../../helpers/User";

// Password complexity validation function
const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .max(128, "Password must not exceed 128 characters")
  .refine(
    (password) => passwordComplexityRegex.test(password),
    {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)"
    }
  );

export const schema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long")
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must not exceed 50 characters")
    .trim()
    .refine(
      (name) => name.length > 0,
      { message: "Display name cannot be empty or only whitespace" }
    ),
});

export type OutputType = {
  user: User;
};

export const postRegister = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/auth/register_with_password`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include", // Important for cookies to be sent and received
  });

  if (!result.ok) {
    const errorData = await result.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return result.json();
};