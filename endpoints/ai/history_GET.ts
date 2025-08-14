import { schema, OutputType } from "./history_GET.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";
import { z } from "zod";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const url = new URL(request.url);

    // Manually parse and validate query params
    const params = {
      limit: url.searchParams.get("limit")
        ? parseInt(url.searchParams.get("limit")!, 10)
        : undefined,
      cursor: url.searchParams.get("cursor")
        ? parseInt(url.searchParams.get("cursor")!, 10)
        : undefined,
      conversationId: url.searchParams.get("conversationId")
        ? parseInt(url.searchParams.get("conversationId")!, 10)
        : undefined,
    };

    const { limit, cursor, conversationId: requestedConversationId } = schema.parse(params);

    let conversationId = requestedConversationId;

    // If no conversationId is provided, find the user's most recent one.
    if (!conversationId) {
      const latestConversation = await db
        .selectFrom("chatConversations")
        .select("id")
        .where("userId", "=", user.id)
        .orderBy("updatedAt", "desc")
        .limit(1)
        .executeTakeFirst();

      if (!latestConversation) {
        // No conversations yet, return empty history.
        return new Response(
          superjson.stringify({
            messages: [],
            nextCursor: null,
            conversationId: null,
          } satisfies OutputType)
        );
      }
      conversationId = latestConversation.id;
    } else {
      // If a conversationId is provided, verify it belongs to the user.
      const conversationOwner = await db
        .selectFrom("chatConversations")
        .select("userId")
        .where("id", "=", conversationId)
        .executeTakeFirst();

      if (!conversationOwner || conversationOwner.userId !== user.id) {
        return new Response(
          superjson.stringify({ error: "Conversation not found or access denied." }),
          { status: 404 }
        );
      }
    }

    let query = db
      .selectFrom("chatMessages")
      .select(["id", "role", "content", "createdAt"])
      .where("conversationId", "=", conversationId)
      .orderBy("createdAt", "asc") // Order ascending for correct display order
      .limit(limit);

    if (cursor) {
      query = query.where("id", "<", cursor);
    }

    const messages = await query.execute();

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null;

    const output: OutputType = {
      messages: messages.map(m => ({...m, role: m.role as 'user' | 'assistant'})), // Already ordered correctly by SQL
      nextCursor,
      conversationId,
    };

    return new Response(superjson.stringify(output), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    const errorMessage =
      error instanceof z.ZodError
        ? "Invalid query parameters."
        : error instanceof Error
        ? error.message
        : "An unknown error occurred.";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}