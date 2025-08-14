import { z } from "zod";
import superjson from "superjson";
import { UserRole } from "../../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  bio: string | null;
  phone: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  location: string | null;
  timezone: string | null;
  emoji: string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  billingCycle: string | null;
};

export const getUserProfile = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/user/profile`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as any)?.error || "Failed to fetch user profile");
  }
  return superjson.parse<OutputType>(await result.text());
};