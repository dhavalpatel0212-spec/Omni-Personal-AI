import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType } from "./password_info_GET.schema";
import superjson from "superjson";

const PASSWORD_CHANGE_COOLDOWN_DAYS = 90;

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const passwordInfo = await db
      .selectFrom("userPasswords")
      .select("createdAt")
      .where("userId", "=", user.id)
      .orderBy("createdAt", "desc")
      .limit(1)
      .executeTakeFirst();

    if (!passwordInfo || !passwordInfo.createdAt) {
      // This case should ideally not happen for a password-based user
      // but is a good safeguard.
      return new Response(
        superjson.stringify({ error: "Password information not found." }),
        { status: 404 }
      );
    }

    const lastPasswordChange = new Date(passwordInfo.createdAt);
    const now = new Date();
    const nextChangeDate = new Date(lastPasswordChange.getTime());
    nextChangeDate.setDate(
      nextChangeDate.getDate() + PASSWORD_CHANGE_COOLDOWN_DAYS
    );

    const canChangePassword = now >= nextChangeDate;

    const response: OutputType = {
      lastPasswordChange,
      canChangePassword,
      nextChangeDate,
    };

    return new Response(superjson.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to get password info:", error);
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return new Response(superjson.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }
    return new Response(
      superjson.stringify({ error: "An internal error occurred." }),
      { status: 500 }
    );
  }
}