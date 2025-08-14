import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  lastPasswordChange: Date;
  canChangePassword: boolean;
  nextChangeDate: Date;
};

export const getPasswordInfo = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/auth/password_info`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || "Failed to fetch password info");
  }

  return superjson.parse<OutputType>(await result.text());
};