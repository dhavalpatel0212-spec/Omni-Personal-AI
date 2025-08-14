import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./avatar_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // In a real application, you would handle file upload to a blob storage (e.g., S3, GCS)
    // and get a URL. This endpoint assumes the client has already uploaded the avatar
    // and is providing the final URL.
    // A file upload service is required for direct uploads.

    // Update the user's avatar
    await db
      .updateTable("users")
      .set({ avatarUrl: input.avatarUrl, updatedAt: new Date() })
      .where("id", "=", user.id)
      .execute();

    // Fetch the updated user data with subscription info from userProfiles
    const updatedUser = await db
      .selectFrom("users")
      .leftJoin("userProfiles", "users.id", "userProfiles.userId")
      .select([
        "users.id",
        "users.email", 
        "users.displayName", 
        "users.avatarUrl", 
        "users.role",
        "userProfiles.subscriptionPlan",
        "userProfiles.subscriptionStatus"
      ])
      .where("users.id", "=", user.id)
      .executeTakeFirstOrThrow();

    const response: OutputType = {
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      subscriptionPlan: updatedUser.subscriptionPlan || null,
      subscriptionStatus: updatedUser.subscriptionStatus || null,
      subscriptionId: null, // Not stored in database yet
      subscriptionEndDate: null, // Not stored in database yet
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user avatar:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}