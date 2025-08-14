import { z } from "zod";
import superjson from "superjson";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

// Define the shape of a single locked account object in the response
export type LockedAccount = {
  email: string;
  failedAttempts: number;
  lastAttemptAt: Date;
};

// The output is an array of these objects
export type OutputType = LockedAccount[];

/**
 * Client-side fetcher to get the list of permanently locked accounts.
 * This should only be called from admin-only sections of the application.
 * @param init Optional request initializations.
 * @returns A promise that resolves to an array of locked account details.
 */
export const getLockedAccounts = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/locked_accounts`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    try {
      const errorObject = superjson.parse(await result.text());
      const errorMessage = typeof errorObject === 'object' && errorObject !== null && 'error' in errorObject 
        ? String(errorObject.error) 
        : "Failed to fetch locked accounts";
      throw new Error(errorMessage);
    } catch (e) {
      // Fallback if parsing fails
      throw new Error(`Failed to fetch locked accounts: ${result.statusText}`);
    }
  }

  // Use superjson to correctly deserialize dates and other special types
  return superjson.parse<OutputType>(await result.text());
};