import { schema, InputType, OutputType } from "./chat_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";
import OpenAI from 'openai';
import { aiModelRouter, AiRouterInput } from "../../helpers/aiModelRouter";
import { aiChatTools, executeToolCalls } from "../../helpers/aiChatTools";
import { getAiChatContext } from "../../helpers/aiChatContext";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = JSON.parse(await request.text());
    const { messages } = schema.parse(json);

    // Check if any message contains images
    const hasImages = messages.some(message => 
      Array.isArray(message.content) && 
      message.content.some(part => part.type === "image_url")
    );

    // Get AI chat context and system message
    const systemMessage = await getAiChatContext(user.id, user.displayName, hasImages);

    // Convert our message format to OpenAI format with proper discriminated union types
    const mapMessageToOpenAI = (msg: typeof messages[0]): OpenAI.Chat.Completions.ChatCompletionMessageParam => {
      if (msg.role === "user") {
        return {
          role: "user",
          content: msg.content,
        } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam;
      } else if (msg.role === "assistant") {
        return {
          role: "assistant",
          content: msg.content,
        } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
      } else {
        throw new Error(`Unsupported message role: ${msg.role}`);
      }
    };

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      systemMessage,
      ...messages.map(mapMessageToOpenAI)
    ];

    // Use AI model router for intelligent model selection
    let modelSelection;
    try {
      const routerInput: AiRouterInput = { messages };
      modelSelection = aiModelRouter(routerInput);
      
      console.log(`AI Model Router selected: ${modelSelection.model}`, {
        reason: modelSelection.reason,
        confidence: modelSelection.confidence,
        userId: user.id,
        messageCount: messages.length,
        hasImages,
      });
    } catch (error) {
      console.error('AI Model Router failed, falling back to gpt-4o:', error);
      // Fallback to gpt-4o with default config
      modelSelection = {
        model: 'gpt-4o' as const,
        config: { temperature: 0.7, max_tokens: 2048 },
        confidence: 0.5,
        reason: 'Fallback due to router error',
      };
    }

    // Prepare OpenAI completion parameters with router-selected model and config
    const completionParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
      model: modelSelection.model,
      messages: openaiMessages,
      tools: aiChatTools,
      stream: true,
      ...modelSelection.config, // Apply router's configuration
    };

    // Create streaming completion
    const stream = await openai.chat.completions.create(completionParams);

    let fullText = '';
    let toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [];

    // Create a ReadableStream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            
            if (delta?.content) {
              fullText += delta.content;
              // Send content chunk
              controller.enqueue(encoder.encode(`0:${JSON.stringify(delta.content)}\n`));
            }
            
            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                if (!toolCalls[toolCall.index]) {
                  toolCalls[toolCall.index] = {
                    id: toolCall.id || '',
                    type: 'function',
                    function: { name: '', arguments: '' }
                  };
                }
                
                if (toolCall.function?.name) {
                  toolCalls[toolCall.index].function.name = toolCall.function.name;
                }
                if (toolCall.function?.arguments) {
                  toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
                }
              }
            }
          }
          
          // Execute tool calls and save conversation
          if (toolCalls.length > 0) {
            await executeToolCalls(toolCalls, user.id);
          }
          
          await saveConversation(user.id, messages, fullText);
          
          controller.close();
        } catch (error) {
          console.error('Error in streaming:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Error in AI chat endpoint:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}

async function saveConversation(
  userId: number,
  messages: any[],
  assistantText: string
) {
  try {
    // Get the last user message from the messages array
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (lastUserMessage) {
      // Find or create conversation
      let conversationId: number;
      
      // Try to find the user's most recent conversation
      const latestConversation = await db
        .selectFrom("chatConversations")
        .select("id")
        .where("userId", "=", userId)
        .orderBy("updatedAt", "desc")
        .limit(1)
        .executeTakeFirst();

      if (latestConversation) {
        conversationId = latestConversation.id;
      } else {
        // Create a new conversation
        const newConversation = await db
          .insertInto("chatConversations")
          .values({ userId, title: "New Conversation" })
          .returning("id")
          .executeTakeFirstOrThrow();
        conversationId = newConversation.id;
      }

      // Save both messages in a transaction
      await db.transaction().execute(async (trx) => {
        // Convert content to string for storage
        const userContent = typeof lastUserMessage.content === 'string' 
          ? lastUserMessage.content 
          : JSON.stringify(lastUserMessage.content);

        const messagesToInsert = [
          {
            conversationId,
            role: "user" as const,
            content: userContent,
          },
          {
            conversationId,
            role: "assistant" as const,
            content: assistantText,
          },
        ];

        await trx
          .insertInto("chatMessages")
          .values(messagesToInsert)
          .execute();
        
        // Update conversation's updatedAt timestamp
        await trx
          .updateTable('chatConversations')
          .set({ updatedAt: new Date() })
          .where('id', '=', conversationId)
          .execute();
      });
    }
  } catch (error) {
    console.error("Error saving chat messages:", error);
  }
}