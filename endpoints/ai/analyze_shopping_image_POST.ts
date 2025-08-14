import { z } from "zod";
import { OpenAI } from 'openai';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, OutputType, AnalyzedItem } from './analyze_shopping_image_POST.schema';
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
    spring: "spring vegetables (asparagus, artichokes, peas), fresh herbs, strawberries, spring cleaning supplies",
    summer: "summer fruits (berries, stone fruits, melons), barbecue items, sunscreen, cooling beverages, fresh salads",
    fall: "fall produce (pumpkins, squash, apples), back-to-school items, warming spices, comfort foods",
    winter: "winter vegetables (root vegetables, citrus), holiday items, warm beverages, comfort foods, cold/flu remedies"
  };
  
  return seasonalItems[season as keyof typeof seasonalItems] || "";
}

export async function handle(request: Request): Promise<Response> {
  try {
    await getServerUserSession(request); // Authenticate user
    const formData = await request.formData();
    const validatedInput = schema.parse({
      image: formData.get('image'),
    });

    const imageFile = validatedInput.image;
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imageFile.type;

    const currentSeason = getCurrentSeason();
    const seasonalContext = getSeasonalContext(currentSeason);

    const enhancedPrompt = `You are an expert shopping assistant analyzing images of shopping lists, receipts, or product photos. Extract each item with precise categorization and intelligent analysis.

CURRENT CONTEXT:
- Season: ${currentSeason}
- Common ${currentSeason} items: ${seasonalContext}

CATEGORIES WITH DETAILED DEFINITIONS:
- produce: Fresh fruits, vegetables, herbs, salads (e.g., apples, bananas, lettuce, tomatoes, onions, fresh herbs)
- dairy: Milk, cheese, yogurt, butter, eggs, cream products (e.g., whole milk, cheddar cheese, Greek yogurt)
- meat_seafood: Fresh/frozen meat, poultry, fish, seafood, deli meats (e.g., chicken breast, ground beef, salmon, turkey slices)
- pantry: Shelf-stable foods, canned goods, grains, pasta, sauces, oils, spices (e.g., rice, pasta, canned tomatoes, olive oil, flour)
- frozen: Frozen foods including meals, vegetables, desserts (e.g., frozen pizza, ice cream, frozen peas)
- bakery: Fresh bread, pastries, cakes, bagels, baked goods (e.g., sourdough bread, croissants, dinner rolls)
- beverages: All drinks including water, juice, soda, coffee, tea, alcohol (e.g., orange juice, sparkling water, coffee beans)
- snacks: Chips, crackers, nuts, candy, cookies, granola bars (e.g., potato chips, trail mix, chocolate bars)
- household: Cleaning supplies, paper products, laundry items, light bulbs (e.g., dish soap, toilet paper, paper towels)
- personal_care: Health, beauty, hygiene products, medicines (e.g., shampoo, toothpaste, vitamins, band-aids)
- other: Items that don't fit other categories (e.g., batteries, pet food, flowers, gift cards)

ANALYSIS INSTRUCTIONS:
1. ITEM NAME: Use specific, recognizable names. Include brand names when clearly visible (e.g., "Coca-Cola" not just "soda"). For generic items, use common descriptive names (e.g., "whole milk" not just "milk").

2. QUANTITY ESTIMATION:
   - Look for explicit quantities (numbers, "dozen", "pack of X", "lb", "kg", etc.)
   - For bulk items or large packages, estimate reasonable household quantities
   - Default to 1 if no quantity is apparent
   - Consider context: receipts often show actual quantities, lists may imply 1
   - Handle units intelligently: "2 lbs bananas" = quantity 2, "bananas 2 lbs" = quantity 2

3. CATEGORY SELECTION:
   - Use seasonal context to inform decisions (e.g., pumpkins in fall likely for cooking/decoration)
   - Consider preparation context (e.g., "chicken" could be meat_seafood for raw or pantry for canned)
   - When uncertain between categories, choose the most common use case

4. BRAND RECOGNITION:
   - Include brand names when clearly visible and recognizable
   - Popular brands to watch for: Coca-Cola, Pepsi, Kraft, Kellogg's, General Mills, Tide, Clorox, etc.
   - Don't guess brands if unclear

5. PRICE ESTIMATION (for receipts only):
   - Include price if clearly visible on receipt items
   - Use exact amount shown, including cents (e.g., 3.49 for $3.49)
   - Leave null if no price visible or if image is not a receipt

6. EDGE CASES:
   - Multi-packs: "12-pack soda" = name: "Coca-Cola 12-pack", quantity: 1, category: "beverages"
   - Bulk items: "5 lb bag rice" = name: "rice", quantity: 5, category: "pantry"
   - Generic vs specific: prefer specific when determinable
   - Handwritten ambiguity: make best reasonable interpretation
   - Cross-category items: choose primary use (e.g., cooking wine = beverages, not pantry)

RESPONSE FORMAT:
Return a JSON object with "items" key containing an array. Each item should have:
- "name": string (specific, include brand if visible)
- "quantity": number (estimated or explicit)
- "category": string (from defined categories)
- "estimated_price": number or null (only for receipts with visible prices)

Example responses:
For shopping list: {"items": [{"name": "Tide laundry detergent", "quantity": 1, "category": "household", "estimated_price": null}]}
For receipt: {"items": [{"name": "bananas", "quantity": 3, "category": "produce", "estimated_price": 2.47}]}

Analyze the image now:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: enhancedPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    // The response is a stringified JSON, so we need to parse it.
    // It's often wrapped in a root key, e.g. { "items": [...] }
    const parsedContent = JSON.parse(content);
    const items = parsedContent.items || parsedContent; // Handle both { "items": [...] } and [...]

    // Validate the structure of the parsed items
    const analyzedItemsSchema = z.array(AnalyzedItem);
    const validatedItems = analyzedItemsSchema.parse(items);

    const output: OutputType = { items: validatedItems };
    return new Response(superjson.stringify(output));

  } catch (error) {
    console.error("Error analyzing shopping image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: error instanceof z.ZodError ? 400 : 500 });
  }
}