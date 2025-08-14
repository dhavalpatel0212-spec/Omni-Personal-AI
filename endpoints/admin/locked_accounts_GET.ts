import { db } from "../../helpers/db";
import { authorize, NotAuthorizedError } from "../../helpers/authorize";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { OutputType } from "./locked_accounts_GET.schema";
import superjson from "superjson";

// This should match the configuration in the login endpoint
const PERMANENT_LOCKOUT_THRESHOLD = 10;
const PERMANENT_LOCKOUT_WINDOW_HOURS = 24;

export async function handle(request: Request) {
  try {
    // 1. Authorize: Ensure only admin users can access this endpoint.
    await authorize(request, { allowedRoles: ["admin"] });

    // 2. Define the time window for checking failed attempts.
    const windowStart = new Date(
      Date.now() - PERMANENT_LOCKOUT_WINDOW_HOURS * 60 * 60 * 1000
    );

    // 3. Query the database for permanently locked accounts.
    // A user is considered permanently locked if they have `PERMANENT_LOCKOUT_THRESHOLD` or more
    // failed login attempts within the `PERMANENT_LOCKOUT_WINDOW_HOURS`.
    const lockedAccounts = await db
      .selectFrom("loginAttempts")
      .select([
        "email",
        db.fn.countAll<string>().as("failedAttempts"), // Kysely count returns string with postgres
        db.fn.max("attemptedAt").as("lastAttemptAt"),
      ])
      .where("success", "=", false)
      .where("attemptedAt", ">=", windowStart)
      .groupBy("email")
      .having(db.fn.countAll(), ">=", PERMANENT_LOCKOUT_THRESHOLD)
      .orderBy("lastAttemptAt", "desc")
      .execute();

    // The kysely-postgres-js driver can return count as a string, so we parse it.
    const responseData: OutputType = lockedAccounts.map(account => ({
      ...account,
      failedAttempts: parseInt(account.failedAttempts, 10),
      // Ensure lastAttemptAt is a Date object
      lastAttemptAt: new Date(account.lastAttemptAt as string | Date),
    }));

    return new Response(superjson.stringify(responseData), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 401 });
    }
    if (error instanceof NotAuthorizedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 403 });
    }
    
    console.error("Error fetching locked accounts:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 500 });
  }
}