import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType } from "./profile_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    const userProfile = await db
      .selectFrom("users")
      .leftJoin("userProfiles", "users.id", "userProfiles.userId")
      .select([
        "users.id",
        "users.email",
        "users.displayName",
        "users.avatarUrl",
        "users.role",
        "userProfiles.bio",
        "userProfiles.phone",
        "userProfiles.phoneCountryCode",
        "userProfiles.phoneNumber",
        "userProfiles.location",
        "userProfiles.timezone",
        "userProfiles.emoji",
        "userProfiles.subscriptionPlan",
        "userProfiles.subscriptionStatus",
        "userProfiles.billingCycle"
      ])
      .where("users.id", "=", session.user.id)
      .executeTakeFirst();

    if (!userProfile) {
      return new Response(
        superjson.stringify({ error: "User profile not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response: OutputType = {
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.displayName,
      avatarUrl: userProfile.avatarUrl,
      role: userProfile.role,
      bio: userProfile.bio,
      phone: userProfile.phone,
      phoneCountryCode: userProfile.phoneCountryCode,
      phoneNumber: userProfile.phoneNumber,
      location: userProfile.location,
      timezone: userProfile.timezone,
      emoji: userProfile.emoji,
      subscriptionPlan: userProfile.subscriptionPlan,
      subscriptionStatus: userProfile.subscriptionStatus,
      billingCycle: userProfile.billingCycle,
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}