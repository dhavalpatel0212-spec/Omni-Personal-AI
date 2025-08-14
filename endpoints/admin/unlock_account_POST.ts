import { db } from "../../helpers/db";
import { authorize, NotAuthorizedError } from "../../helpers/authorize";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { schema, OutputType } from "./unlock_account_POST.schema";
import superjson from 'superjson';
import { z } from "zod";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user: adminUser } = await authorize(request, { allowedRoles: ['admin'] });

    const json = superjson.parse(await request.text());
    const { email } = schema.parse(json);
    const normalizedEmail = email.toLowerCase();

    // Check if the user exists to provide a more specific error message.
    const targetUser = await db.selectFrom('users')
      .select('id')
      .where(db.fn('lower', ['email']), '=', normalizedEmail)
      .executeTakeFirst();

    if (!targetUser) {
      return new Response(superjson.stringify({ error: "User with the specified email not found." }), { status: 404 });
    }

    // Clear all failed login attempts for the specified email.
    const { numDeletedRows } = await db.deleteFrom('loginAttempts')
      .where('email', '=', normalizedEmail)
      .where('success', '=', false)
      .executeTakeFirst();

    // Log the unlock action for auditing.
    console.log({
      message: "Admin action: User account unlock attempt.",
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      targetEmail: normalizedEmail,
      clearedAttempts: Number(numDeletedRows),
      timestamp: new Date().toISOString(),
    });

    const responsePayload: OutputType = { message: "User account unlocked successfully. Any existing failed login attempts have been cleared." };
    return new Response(superjson.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(superjson.stringify({ error: "Invalid input.", details: error.errors }), { status: 400 });
    }
    if (error instanceof NotAuthenticatedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 401 });
    }
    if (error instanceof NotAuthorizedError) {
      return new Response(superjson.stringify({ error: error.message }), { status: 403 });
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Error in unlock_account_POST endpoint:", error);
    return new Response(superjson.stringify({ error: "An internal server error occurred.", details: errorMessage }), { status: 500 });
  }
}