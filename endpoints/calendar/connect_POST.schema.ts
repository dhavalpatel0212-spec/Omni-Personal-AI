import { z } from "zod";
import superjson from "superjson";
import { oauthProviders } from "../../helpers/OAuthProvider";

export const schema = z.object({
  provider: z.enum(oauthProviders),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  authorizeUrl: string;
};

export const postConnectCalendar = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/calendar/connect`, {
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
    throw new Error((errorObject as any)?.error || "Failed to connect calendar");
  }
  return superjson.parse<OutputType>(await result.text());
};