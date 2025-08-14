// adapt this to the database schema and helpers if necessary
import { db } from "../../helpers/db";
import { schema } from "./register_with_password_POST.schema";
import { randomBytes } from "crypto";
import {
  setServerSession,
  SessionExpirationSeconds,
} from "../../helpers/getSetServerSession";
import { generatePasswordHash } from "../../helpers/generatePasswordHash";

export async function handle(request: Request) {
  try {
    const json = await request.json();
    
    // Validate input size to prevent DoS attacks
    if (JSON.stringify(json).length > 10000) {
      return Response.json(
        { message: "Request payload too large" },
        { status:413 }
      );
    }
    
    const { email, password, displayName } = schema.parse(json);

    // Check if email already exists
    const existingUser = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", email)
      .limit(1)
      .execute();

    if (existingUser.length > 0) {
      return Response.json(
        { message: "email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await generatePasswordHash(password);

    // Create new user in a transaction
    const newUser = await db.transaction().execute(async (trx) => {
      // Insert the user
      const [user] = await trx
        .insertInto("users")
        .values({
          email,
          displayName,
          role: "user", // Default role
        })
        .returning(["id", "email", "displayName", "createdAt"])
        .execute();

      // Store the password hash in another table
      await trx
        .insertInto("userPasswords")
        .values({
          userId: user.id,
          passwordHash,
        })
        .execute();

      return user;
    });

    // Create a new session
    const sessionId = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SessionExpirationSeconds * 1000);

    await db
      .insertInto("sessions")
      .values({
        id: sessionId,
        userId: newUser.id,
        createdAt: now,
        lastAccessed: now,
        expiresAt,
      })
      .execute();

    // Create response with user data
    const response = Response.json({
      user: {
        ...newUser,
        role: "user" as const,
        subscriptionPlan: null,
        subscriptionStatus: null,
        subscriptionId: null,
        subscriptionEndDate: null,
      },
    });

    // Set session cookie
    await setServerSession(response, {
      id: sessionId,
      createdAt: now.getTime(),
      lastAccessed: now.getTime(),
    });

    return response;
  } catch (error: unknown) {
    console.error("Registration error:", error);
    
    // Handle validation errors with specific messages
    if (error instanceof Error && error.message.includes("Password must")) {
      return Response.json({ message: error.message }, { status: 400 });
    }
    
    if (error instanceof Error && error.message.includes("email")) {
      return Response.json({ message: error.message }, { status: 400 });
    }
    
    if (error instanceof Error && error.message.includes("Display name")) {
      return Response.json({ message: error.message }, { status: 400 });
    }
    
    // Generic error message for security - don't leak internal details
    return Response.json({ message: "Registration failed. Please check your input and try again." }, { status: 400 });
  }
}