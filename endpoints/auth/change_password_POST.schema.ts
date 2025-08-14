import { z } from "zod";
import superjson from "superjson";

// Password complexity validation function
const passwordComplexityRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .max(128, "Password must not exceed 128 characters")
  .refine((password) => passwordComplexityRegex.test(password), {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)",
  });

export const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"], // path of error
  });

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  message: string;
  newPasswordChangeDate: Date;
};

export const postChangePassword = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/auth/change_password`, {
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
    throw new Error(errorObject.error || "Failed to change password");
  }

  return superjson.parse<OutputType>(await result.text());
};