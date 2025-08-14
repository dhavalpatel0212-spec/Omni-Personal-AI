import { db } from "../../helpers/db";
import { authorize, NotAuthorizedError } from "../../helpers/authorize";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { schema, InputType, OutputType, CorrectionItem } from "./category_correction_POST.schema";
import superjson from "superjson";
import { Insertable } from "kysely";
import { DB } from "../../helpers/schema";

// This is a hypothetical type definition.
// In a real-world scenario, this would be generated in helpers/schema.tsx after a database migration.
type ShoppingItemCategoryCorrections = {
  id: number;
  userId: number;
  itemName: string;
  originalCategory: 'bakery' | 'beverages' | 'dairy' | 'frozen' | 'household' | 'meat_seafood' | 'other' | 'pantry' | 'personal_care' | 'produce' | 'snacks';
  correctedCategory: 'bakery' | 'beverages' | 'dairy' | 'frozen' | 'household' | 'meat_seafood' | 'other' | 'pantry' | 'personal_care' | 'produce' | 'snacks';
  correctionContext: string | null;
  createdAt: Date;
};

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await authorize(request, { allowedRoles: ["user", "admin"] });
    const json = superjson.parse(await request.text()) as InputType;
    const { corrections } = schema.parse(json);

    if (corrections.length === 0) {
      return new Response(superjson.stringify({ error: "No corrections provided." }), { status: 400 });
    }

    const correctionsToInsert: Insertable<DB['shoppingItemCategoryCorrections']>[] = corrections.map((correction: CorrectionItem) => ({
      userId: user.id.toString(),
      itemName: correction.itemName.toLowerCase().trim(), // Normalize item name
      originalCategory: correction.originalCategory,
      correctedCategory: correction.correctedCategory,
      correctionContext: correction.context,
    }));

    // The table 'shoppingItemCategoryCorrections' is assumed to exist.
    // A database migration would be required to add this table.
    const result = await db
      .insertInto('shoppingItemCategoryCorrections' as any) // Using 'as any' because the table is not in the generated schema
      .values(correctionsToInsert)
      .returning('id')
      .execute();

    console.log(`User ${user.id} submitted ${result.length} category corrections.`);

    const output: OutputType = {
      success: true,
      message: `${result.length} category correction(s) submitted successfully.`,
      submittedCount: result.length,
    };

    return new Response(superjson.stringify(output), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in category_correction_POST:", error);

    if (error instanceof NotAuthenticatedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 401 });
    }
    if (error instanceof NotAuthorizedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 403 });
    }
    if (error instanceof Error && 'issues' in error) { // Zod validation error
      return new Response(superjson.stringify({ error: "Invalid input.", issues: (error as any).issues }), { status: 400 });
    }
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 500 });
    }
    
    return new Response(superjson.stringify({ error: "An internal server error occurred." }), { status: 500 });
  }
}