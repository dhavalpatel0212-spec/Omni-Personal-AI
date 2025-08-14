import { schema, InputType, OutputType } from "./message_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";
import { z } from "zod";
import { Transaction } from "kysely";
import { DB } from "../../helpers/schema";

async function createNewConversation(userId: number, trx: Transaction<DB>): Promise<number> {
  const newConversation = await trx
    .insertInto("chatConversations")
    .values({ userId, title: "New Conversation" }) // A default title
    .returning("id")
    .executeTakeFirstOrThrow();
  return newConversation.id;
}

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const {
      conversationId: requestedConversationId,
      userMessage,
      assistantMessage,
    } = schema.parse(json);

    const output = await db.transaction().execute(async (trx) => {
      let conversationId = requestedConversationId;

      // 1. Determine Conversation ID
      if (conversationId) {
        // Verify the user owns the conversation
        const conversation = await trx
          .selectFrom("chatConversations")
          .select("id")
          .where("id", "=", conversationId)
          .where("userId", "=", user.id)
          .executeTakeFirst();

        if (!conversation) {
          throw new Error("Conversation not found or access denied.");
        }
      } else {
        // Create a new conversation
        conversationId = await createNewConversation(user.id, trx);
      }

      // 2. Insert user and assistant messages
      const messagesToInsert = [
        {
          conversationId,
          role: "user" as const,
          content: userMessage,
        },
        {
          conversationId,
          role: "assistant" as const,
          content: assistantMessage,
        },
      ];

      const insertedMessages = await trx
        .insertInto("chatMessages")
        .values(messagesToInsert)
        .returning(["id", "role"])
        .execute();
      
      // 3. Update conversation's updatedAt timestamp
      await trx
        .updateTable('chatConversations')
        .set({ updatedAt: new Date() })
        .where('id', '=', conversationId)
        .execute();

      const userMessageResult = insertedMessages.find(m => m.role === 'user');
      const assistantMessageResult = insertedMessages.find(m => m.role === 'assistant');

      if (!userMessageResult || !assistantMessageResult) {
          throw new Error("Failed to save one or more messages.");
      }

      return {
        conversationId,
        userMessageId: userMessageResult.id,
        assistantMessageId: assistantMessageResult.id,
      } satisfies OutputType;
    });

    return new Response(superjson.stringify(output), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
    const errorMessage =
      error instanceof z.ZodError
        ? "Invalid input data."
        : error instanceof Error
        ? error.message
        : "An unknown error occurred.";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}