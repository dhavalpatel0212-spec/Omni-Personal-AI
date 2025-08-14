import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./account_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const updateData: any = {};

    if (input.language !== undefined) {
      updateData.language = input.language;
    }
    // Note: theme is not stored in accountSettings table in current schema
    // It would typically be handled client-side or require schema update

    if (Object.keys(updateData).length === 0) {
      return new Response(
        superjson.stringify({ error: "No fields to update." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use UPSERT to handle cases where account settings don't exist yet
    await db
      .insertInto("accountSettings")
      .values({
        userId: user.id,
        ...updateData,
        updatedAt: new Date(),
      })
      .onConflict((oc) =>
        oc.column("userId").doUpdateSet({
          ...updateData,
          updatedAt: new Date(),
        })
      )
      .execute();

    const response: OutputType = {
      success: true,
      message: "Account settings updated successfully.",
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating account settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}