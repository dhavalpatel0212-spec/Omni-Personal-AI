import { z } from "zod";
import superjson from "superjson";
import { User } from "../../helpers/User";

export const schema = z.object({
  displayName: z.string().trim().min(1, "Display name cannot be empty.").max(50, "Display name must be 50 characters or less").optional(),
  bio: z.string().trim().max(500, "Bio must be 500 characters or less").optional(),
  phoneCountryCode: z.string().trim().max(10, "Phone country code must be 10 characters or less").optional(),
  phoneNumber: z.string().trim().max(20, "Phone number must be 20 characters or less").optional(),
  location: z.string().trim().max(100, "Location must be 100 characters or less").optional(),
  timezone: z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, "Invalid timezone format").optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = User;

export const postUserProfile = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/user/profile`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as any)?.error || "Failed to update user profile");
  }
  return superjson.parse<OutputType>(await result.text());
};