import { z } from "zod";
import { OpenAI } from 'openai';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, OutputType, AnalyzedItem } from './parse_voice_shopping_POST.schema';
import superjson from 'superjson';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to get current season
function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

// Helper function to get seasonal context
function getSeasonalContext(season: string): string {
  const seasonalItems = {
    spring: "spring vegetables (asparagus, artichokes, peas), fresh herbs, strawberries, spring cleaning supplies, Easter items",
    summer: "summer fruits (berries, stone fruits, melons), barbecue items, sunscreen, cooling beverages, fresh salads, camping supplies",
    fall: "fall produce (pumpkins, squash, apples), back-to-school items, warming spices, comfort foods, Halloween items",
    winter: "winter vegetables (root vegetables, citrus), holiday items, warm beverages, comfort foods, cold/flu remedies, winter gear"
  };
  
  return seasonalItems[season as keyof typeof seasonalItems] || "";
}

export async function handle(request: Request): Promise<Response> {
  try {
    await getServerUserSession(request); // Authenticate user
    const json = superjson.parse(await request.text());
    const { text } = schema.parse(json);

    const currentSeason = getCurrentSeason();
    const seasonalContext = getSeasonalContext(currentSeason);

    const enhancedPrompt = `You are an expert shopping assistant analyzing voice shopping requests. Parse the spoken text to extract shopping items with intelligent categorization and context awareness.

CURRENT CONTEXT:
- Season: ${currentSeason}
- Common ${currentSeason} items: ${seasonalContext}

CATEGORIES WITH DETAILED DEFINITIONS:
- produce: Fresh fruits, vegetables, herbs, salads (e.g., apples, bananas, lettuce, tomatoes, onions, fresh herbs, avocados)
- dairy: Milk, cheese, yogurt, butter, eggs, cream products (e.g., whole milk, cheddar cheese, Greek yogurt, heavy cream)
- meat_seafood: Fresh/frozen meat, poultry, fish, seafood, deli meats (e.g., chicken breast, ground beef, salmon, turkey slices)
- pantry: Shelf-stable foods, canned goods, grains, pasta, sauces, oils, spices, baking supplies (e.g., rice, pasta, canned tomatoes, olive oil, flour, sugar)
- frozen: Frozen foods including meals, vegetables, desserts, ice cream (e.g., frozen pizza, ice cream, frozen peas, frozen dinners)
- bakery: Fresh bread, pastries, cakes, bagels, baked goods (e.g., sourdough bread, croissants, dinner rolls, muffins)
- beverages: All drinks including water, juice, soda, coffee, tea, alcohol (e.g., orange juice, sparkling water, coffee beans, wine)
- snacks: Chips, crackers, nuts, candy, cookies, granola bars (e.g., potato chips, trail mix, chocolate bars, pretzels)
- household: Cleaning supplies, paper products, laundry items, batteries, light bulbs (e.g., dish soap, toilet paper, paper towels, trash bags)
- personal_care: Health, beauty, hygiene products, medicines, vitamins (e.g., shampoo, toothpaste, vitamins, band-aids, soap)
- other: Items that don't fit other categories (e.g., pet food, flowers, gift cards, office supplies)

VOICE PARSING INSTRUCTIONS:

1. ITEM NAME RECOGNITION:
   - Handle common colloquialisms: "pop" = soda, "veggies" = vegetables, "sammies" = sandwiches
   - Recognize abbreviations: "OJ" = orange juice, "TP" = toilet paper, "PB&J" = peanut butter and jelly
   - Include brand names when mentioned: "Coke", "Pepsi", "Tide", "Kleenex", "Band-Aid"
   - Popular brands to recognize: Coca-Cola, Pepsi, Kraft, Kellogg's, General Mills, Tide, Clorox, Tylenol, etc.
   - Standardize names for clarity: "whole milk" not just "milk", "ground beef" not just "beef"

2. QUANTITY ESTIMATION FROM NATURAL LANGUAGE:
   - Numbers: "two", "three", "five" → 2, 3, 5
   - Approximations: "a few" = 3, "some" = 2, "several" = 4, "a bunch" = 5, "a couple" = 2
   - Units: "dozen" = 12, "half dozen" = 6, "pair" = 2
   - Packages: "pack", "box", "bag", "bottle", "can", "jar" = 1 (unless number specified)
   - Bulk references: "2 pounds", "3 liters", "5 bags" → use the number as quantity
   - Default to 1 if no quantity mentioned

3. CONTEXTUAL CATEGORY SELECTION:
   - Consider seasonal context: pumpkins in fall likely produce, Christmas cookies in winter likely bakery
   - Use common preparation context: "chicken" for cooking = meat_seafood, "chicken soup" = pantry if canned
   - Consider storage context: "frozen chicken" = frozen, "fresh chicken" = meat_seafood

4. HANDLING COMPLEX VOICE INPUTS:
   - Multiple items in one phrase: "milk, bread, and some apples" → separate items
   - Compound items: "peanut butter and jelly" → two separate items unless clearly one product
   - Lists with "and": properly separate each item
   - Unclear pronunciations: make best reasonable interpretation based on context

5. EDGE CASES AND REGIONAL VARIATIONS:
   - Regional terms: "soda" vs "pop" vs "soft drink", "shopping cart" vs "buggy"
   - Slang terms: "grub" = food items, "brewskis" = beer
   - Common mispronunciations: handle phonetically similar words
   - Generic vs specific: prefer specific when context allows

6. BRAND AND PRODUCT RECOGNITION:
   - Common brand pronunciations and variations
   - Store brand indicators: "generic", "store brand", "house brand"
   - Size indicators: "large", "small", "family size", "travel size"

RESPONSE FORMAT:
Respond with a JSON object containing an "items" key with an array of objects. Each object should have:
- "name": string (clear, specific name, include brand if mentioned)
- "quantity": number (estimated from natural language)
- "category": string (from the defined categories above)

Example voice inputs and responses:
- "I need some milk and a dozen eggs" → {"items": [{"name": "milk", "quantity": 2, "category": "dairy"}, {"name": "eggs", "quantity": 12, "category": "dairy"}]}
- "Get me Tide detergent and a few apples" → {"items": [{"name": "Tide laundry detergent", "quantity": 1, "category": "household"}, {"name": "apples", "quantity": 3, "category": "produce"}]}
- "I want some OJ, TP, and a couple bananas" → {"items": [{"name": "orange juice", "quantity": 2, "category": "beverages"}, {"name": "toilet paper", "quantity": 1, "category": "household"}, {"name": "bananas", "quantity": 2, "category": "produce"}]}

Parse this voice input now:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: enhancedPrompt
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsedContent = JSON.parse(content);
    const items = parsedContent.items || [];

    const analyzedItemsSchema = z.array(AnalyzedItem);
    const validatedItems = analyzedItemsSchema.parse(items);

    const output: OutputType = { items: validatedItems };
    return new Response(superjson.stringify(output));

  } catch (error) {
    console.error("Error parsing voice shopping text:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: error instanceof z.ZodError ? 400 : 500 });
  }
}