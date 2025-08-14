import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  language: string;
  theme: "light" | "dark" | "system";
};

export const getAccountSettings = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/settings/account`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as any)?.error || "Failed to fetch account settings");
  }
  return superjson.parse<OutputType>(await result.text());
};