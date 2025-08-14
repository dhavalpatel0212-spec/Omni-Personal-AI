import { db } from './db';
import { sql } from 'kysely';
import { Selectable } from 'kysely';
import { ShoppingItems } from './schema';

// This is a server-only helper. Do not import on the client.

const MIN_PURCHASE_COUNT = 3; // An item must be purchased at least 3 times to be considered for suggestions.
const SUGGESTION_WINDOW_DAYS = 90; // Look at purchases in the last 90 days.
const FREQUENCY_THRESHOLD_DAYS = 35; // Suggest if not bought in the last 35 days but was bought frequently before.

export type RecurringSuggestion = Pick<Selectable<ShoppingItems>, 'name' | 'category' | 'unit'>;

/**
 * Analyzes a user's shopping history to generate recurring shopping item suggestions.
 * This function is intended for server-side use only as it directly queries the database.
 *
 * The logic is as follows:
 * 1. Fetches all completed shopping items for the user from the last `SUGGESTION_WINDOW_DAYS`.
 * 2. Groups items by name (case-insensitive) and counts the number of times each item was purchased.
 * 3. Filters for items purchased at least `MIN_PURCHASE_COUNT` times.
 * 4. Calculates the average purchase interval for these recurring items.
 * 5. Suggests an item if it hasn't been purchased recently (i.e., last purchase is older than the average interval)
 *    and the average interval is less than `FREQUENCY_THRESHOLD_DAYS`.
 *
 * @param userId The ID of the user for whom to generate suggestions.
 * @returns A promise that resolves to an array of `RecurringSuggestion` objects.
 */
export async function getRecurringSuggestions(userId: number): Promise<RecurringSuggestion[]> {
  try {
    const suggestionWindow = new Date();
    suggestionWindow.setDate(suggestionWindow.getDate() - SUGGESTION_WINDOW_DAYS);

    const items = await db
      .selectFrom('shoppingItems')
      .innerJoin('shoppingLists', 'shoppingLists.id', 'shoppingItems.shoppingListId')
      .select([
        'shoppingItems.name',
        'shoppingItems.createdAt',
        'shoppingItems.category',
        'shoppingItems.unit',
      ])
      .where('shoppingLists.userId', '=', userId)
      .where('shoppingItems.isCompleted', '=', true)
      .where('shoppingItems.createdAt', '>=', suggestionWindow)
      .orderBy('shoppingItems.createdAt', 'asc')
      .execute();

    if (items.length < MIN_PURCHASE_COUNT) {
      return [];
    }

    const itemGroups: Record<string, {
      purchases: Date[];
      category: Selectable<ShoppingItems>['category'];
      unit: Selectable<ShoppingItems>['unit'];
    }> = {};

    for (const item of items) {
      const normalizedName = item.name.trim().toLowerCase();
      if (!itemGroups[normalizedName]) {
        itemGroups[normalizedName] = { purchases: [], category: item.category, unit: item.unit };
      }
      itemGroups[normalizedName].purchases.push(new Date(item.createdAt));
    }

    const suggestions: RecurringSuggestion[] = [];
    const now = new Date();

    for (const name in itemGroups) {
      const group = itemGroups[name];
      if (group.purchases.length < MIN_PURCHASE_COUNT) {
        continue;
      }

      const intervals: number[] = [];
      for (let i = 1; i < group.purchases.length; i++) {
        const diff = group.purchases[i].getTime() - group.purchases[i - 1].getTime();
        intervals.push(diff / (1000 * 60 * 60 * 24)); // difference in days
      }

      if (intervals.length === 0) continue;

      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      
      if (avgInterval > FREQUENCY_THRESHOLD_DAYS) {
        continue;
      }

      const lastPurchase = group.purchases[group.purchases.length - 1];
      const daysSinceLastPurchase = (now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastPurchase > avgInterval) {
        // Find the original casing of the name from the last purchase
        const originalItem = items.find(it => it.name.trim().toLowerCase() === name && new Date(it.createdAt).getTime() === lastPurchase.getTime());
        
        suggestions.push({
          name: originalItem ? originalItem.name : name,
          category: group.category,
          unit: group.unit,
        });
      }
    }

    return suggestions;
  } catch (error) {
    console.error("Failed to get recurring suggestions:", error);
    // In case of an error, return an empty array to avoid breaking the calling feature.
    return [];
  }
}