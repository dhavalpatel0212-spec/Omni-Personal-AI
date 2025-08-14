import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./profile_POST.schema";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users, UserProfiles } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const bodyText = await request.text();
    const json = superjson.parse(bodyText);
    
    const input = schema.parse(json);

    const userUpdateData: Partial<Pick<Selectable<Users>, "displayName">> = {};
    const profileUpdateData: Partial<Pick<Selectable<UserProfiles>, "bio" | "timezone" | "location" | "phone" | "phoneCountryCode" | "phoneNumber">> = {};

    if (input.displayName && input.displayName.length > 0) {
      userUpdateData.displayName = input.displayName;
    }

    // Handle profile fields
    if (input.bio !== undefined) {
      profileUpdateData.bio = input.bio;
    }
    if (input.timezone !== undefined) {
      profileUpdateData.timezone = input.timezone;
    }
    if (input.location !== undefined) {
      profileUpdateData.location = input.location;
    }
    if (input.phoneCountryCode !== undefined) {
      profileUpdateData.phoneCountryCode = input.phoneCountryCode;
    }
    if (input.phoneNumber !== undefined) {
      profileUpdateData.phoneNumber = input.phoneNumber;
    }


    if (Object.keys(userUpdateData).length === 0 && Object.keys(profileUpdateData).length === 0) {
      return new Response(
        superjson.stringify({ error: "No fields to update." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update users table if needed
    if (Object.keys(userUpdateData).length > 0) {
      await db
        .updateTable("users")
        .set({ ...userUpdateData, updatedAt: new Date() })
        .where("id", "=", user.id)
        .execute();
    }

    // Update or create user profile if needed
    if (Object.keys(profileUpdateData).length > 0) {
      await db
        .insertInto("userProfiles")
        .values({
          userId: user.id,
          ...profileUpdateData,
          updatedAt: new Date(),
        })
        .onConflict((oc) =>
          oc.column("userId").doUpdateSet({
            ...profileUpdateData,
            updatedAt: new Date(),
          })
        )
        .execute();
    }

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
    console.error("Error updating user profile:", error);
    
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return new Response(superjson.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      const errorMessage = zodError.errors?.[0]?.message || 'Invalid input data';
      return new Response(superjson.stringify({ error: errorMessage }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (error instanceof SyntaxError) {
      return new Response(superjson.stringify({ error: 'Invalid JSON format' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}