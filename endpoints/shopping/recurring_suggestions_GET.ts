import { db } from "../../helpers/db";
import { authorize, NotAuthorizedError } from "../../helpers/authorize";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { OutputType, SuggestedItem } from "./recurring_suggestions_GET.schema";
import superjson from "superjson";
import { getRecurringSuggestions } from "../../helpers/getRecurringSuggestions";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await authorize(request);

    const recurringSuggestions = await getRecurringSuggestions(user.id);
    
    // Transform the helper results to match the expected output format
    // For now, we'll provide placeholder values for the additional fields since the helper
    // doesn't return them yet. In a future iteration, the helper should be updated to
    // return all the required analysis data.
    const suggestions: SuggestedItem[] = recurringSuggestions.map(item => ({
      name: item.name,
      category: item.category,
      lastPurchasedAt: new Date(), // Placeholder - should come from helper
      purchaseIntervalDays: 30, // Placeholder - should come from helper
      confidenceScore: 0.8, // Placeholder - should come from helper
      reason: `This item appears to be purchased regularly based on your shopping history.`
    }));

    const result: OutputType = { suggestions };

    return new Response(superjson.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 401 });
    }
    if (error instanceof NotAuthorizedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 403 });
    }
    if (error instanceof Error) {
      console.error("Error fetching recurring suggestions:", error);
      return new Response(superjson.stringify({ error: "An internal error occurred." }), { status: 500 });
    }
    console.error("An unknown error occurred:", error);
    return new Response(superjson.stringify({ error: "An unknown error occurred." }), { status: 500 });
  }
}