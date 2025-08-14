import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./change_password_POST.schema";
import { compare } from "bcryptjs";
import { generatePasswordHash } from "../../helpers/generatePasswordHash";
import superjson from "superjson";

const PASSWORD_CHANGE_COOLDOWN_DAYS = 90;

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { currentPassword, newPassword } = schema.parse(json);

    if (currentPassword === newPassword) {
      return new Response(
        superjson.stringify({
          error: "New password cannot be the same as the current password.",
        }),
        { status: 400 }
      );
    }

    const passwordRecord = await db
      .selectFrom("userPasswords")
      .select(["passwordHash", "createdAt"])
      .where("userId", "=", user.id)
      .orderBy("createdAt", "desc")
      .limit(1)
      .executeTakeFirst();

    if (!passwordRecord || !passwordRecord.passwordHash || !passwordRecord.createdAt) {
      return new Response(
        superjson.stringify({ error: "User password record not found." }),
        { status: 404 }
      );
    }

    // Check cooldown period
    const lastPasswordChange = new Date(passwordRecord.createdAt);
    const now = new Date();
    const nextChangeDate = new Date(lastPasswordChange.getTime());
    nextChangeDate.setDate(
      nextChangeDate.getDate() + PASSWORD_CHANGE_COOLDOWN_DAYS
    );

    if (now < nextChangeDate) {
      return new Response(
        superjson.stringify({
          error: `You can change your password again after ${nextChangeDate.toLocaleDateString()}.`,
        }),
        { status: 429 }
      );
    }

    // Verify current password
    const isPasswordCorrect = await compare(
      currentPassword,
      passwordRecord.passwordHash
    );
    if (!isPasswordCorrect) {
      return new Response(
        superjson.stringify({ error: "Incorrect current password." }),
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await generatePasswordHash(newPassword);

    // Update password in DB
    const newChangeDate = new Date();
    await db
      .updateTable("userPasswords")
      .set({
        passwordHash: newPasswordHash,
        createdAt: newChangeDate,
      })
      .where("userId", "=", user.id)
      .execute();

    const response: OutputType = {
      success: true,
      message: "Password changed successfully.",
      newPasswordChangeDate: newChangeDate,
    };

    return new Response(superjson.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to change password:", error);
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return new Response(superjson.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(
      superjson.stringify({ error: "An internal error occurred." }),
      { status: 500 }
    );
  }
}