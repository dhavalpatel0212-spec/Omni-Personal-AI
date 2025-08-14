import { z } from 'zod';

// Define the types for our models and their configurations
export type ModelName = 'gpt-4o-mini' | 'gpt-4o';

export type ModelConfig = {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
};

export type ModelSelection = {
  model: ModelName;
  config: ModelConfig;
  confidence: number;
  reason: string;
};

// Define query intents
export type QueryIntent =
  | 'mood_logging'
  | 'goal_planning'
  | 'travel_planning'
  | 'shopping_list'
  | 'image_analysis'
  | 'simple_question'
  | 'complex_reasoning'
  | 'general_chat'
  | 'unknown';

// Schema for message content, mirroring chat endpoint schema
const TextContent = z.object({
  type: z.literal('text'),
  text: z.string(),
});

const ImageUrlContent = z.object({
  type: z.literal('image_url'),
  image_url: z.object({
    url: z.string(),
  }),
});

const ContentPart = z.union([TextContent, ImageUrlContent]);

const MessageContent = z.union([z.string(), z.array(ContentPart)]);

const Message = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: MessageContent,
});

export type AiRouterInput = {
  messages: z.infer<typeof Message>[];
};

// Keywords for intent classification
const intentKeywords: Record<QueryIntent, string[]> = {
  mood_logging: ['mood', 'feel', 'feeling', 'felt', 'sad', 'happy', 'anxious', 'stressed', 'log my mood'],
  goal_planning: ['goal', 'plan', 'objective', 'milestone', 'achieve', 'deadline', 'progress', 'set a goal'],
  travel_planning: ['travel', 'trip', 'vacation', 'itinerary', 'booking', 'fly', 'hotel', 'destination'],
  shopping_list: ['shopping', 'groceries', 'buy', 'add to list', 'purchase', 'market', 'store', 'receipt'],
  image_analysis: [], // This is handled by checking for image content
  simple_question: ['what is', 'who is', 'when is', 'where is', 'how to', 'define'],
  complex_reasoning: ['why', 'explain', 'compare', 'contrast', 'analyze', 'what if', 'how does'],
  general_chat: ['hello', 'hi', 'how are you', 'thanks', 'thank you'],
  unknown: [],
};

/**
 * Extracts text content from a message.
 * @param content - The message content.
 * @returns A single string of all text parts.
 */
const extractTextFromMessage = (content: z.infer<typeof MessageContent>): string => {
  if (typeof content === 'string') {
    return content;
  }
  return content
    .filter((part) => part.type === 'text')
    .map((part) => (part as z.infer<typeof TextContent>).text)
    .join(' ');
};

/**
 * Classifies the intent of the user's query based on keywords and content.
 * @param lastUserMessageText - The text of the last user message.
 * @returns The classified query intent.
 */
const classifyIntent = (lastUserMessageText: string): QueryIntent => {
  const text = lastUserMessageText.toLowerCase();
  for (const intent in intentKeywords) {
    if (intentKeywords[intent as QueryIntent].some(keyword => text.includes(keyword))) {
      return intent as QueryIntent;
    }
  }
  return 'general_chat';
};

/**
 * AI Model Router to select the optimal model and configuration for a given query.
 * This function should be used on the server-side.
 *
 * @param {AiRouterInput} input - The user's message history.
 * @returns {ModelSelection} The selected model, its configuration, and the selection reasoning.
 */
export const aiModelRouter = (input: AiRouterInput): ModelSelection => {
  const { messages } = input;
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();

  if (!lastUserMessage) {
    // Default for safety, though this case should be rare.
    return {
      model: 'gpt-4o-mini',
      config: { temperature: 0.7, max_tokens: 1024 },
      confidence: 0.5,
      reason: 'No user message found, defaulting to cost-effective model.',
    };
  }

  const hasImages = Array.isArray(lastUserMessage.content) && lastUserMessage.content.some(part => part.type === 'image_url');

  // Rule 1: If images are present, always use gpt-4o for its vision capabilities.
  if (hasImages) {
    return {
      model: 'gpt-4o',
      config: { temperature: 0.5, max_tokens: 2048 },
      confidence: 1.0,
      reason: 'Image analysis requires gpt-4o vision capabilities.',
    };
  }

  const lastUserMessageText = extractTextFromMessage(lastUserMessage.content);
  const intent = classifyIntent(lastUserMessageText);
  const conversationLength = messages.length;

  // Rule 2: Route based on classified intent.
  switch (intent) {
    case 'goal_planning':
    case 'travel_planning':
    case 'complex_reasoning':
      return {
        model: 'gpt-4o',
        config: { temperature: 0.7, max_tokens: 2048 },
        confidence: 0.9,
        reason: `Complex task detected (intent: ${intent}), requires gpt-4o.`,
      };

    case 'mood_logging':
    case 'shopping_list':
    case 'simple_question':
    case 'general_chat':
      // If the conversation is long, upgrade to a more capable model to maintain context.
      if (conversationLength > 10) {
        return {
          model: 'gpt-4o',
          config: { temperature: 0.7, max_tokens: 1500 },
          confidence: 0.75,
          reason: `Long conversation history (${conversationLength} messages) warrants using gpt-4o for better context handling.`,
        };
      }
      return {
        model: 'gpt-4o-mini',
        config: { temperature: 0.7, max_tokens: 1024 },
        confidence: 0.85,
        reason: `Simple task detected (intent: ${intent}), routed to gpt-4o-mini for speed and cost-efficiency.`,
      };

    default:
      return {
        model: 'gpt-4o-mini',
        config: { temperature: 0.7, max_tokens: 1024 },
        confidence: 0.6,
        reason: 'Unknown intent, defaulting to cost-effective model.',
      };
  }
};