import { z } from "zod";
import superjson from "superjson";
import { User } from "../../helpers/User";

// This schema expects a URL to the avatar.
// Direct file upload would require a multipart/form-data endpoint and a file storage service.
export const schema = z.object({
  avatarUrl: z.string().url("Must be a valid URL."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = User;

export const postUserAvatar = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/user/avatar`, {
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
    throw new Error((errorObject as any)?.error || "Failed to update avatar");
  }
  return superjson.parse<OutputType>(await result.text());
};