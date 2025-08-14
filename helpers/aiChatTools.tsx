import type { OpenAI } from 'openai';
import { db } from './db';
import { nanoid } from 'nanoid';

export const aiChatTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  // Goals Management Tools
  {
    type: 'function',
    function: {
      name: 'getGoals',
      description: "Get the user's current goals with progress and actions",
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['not_started', 'in_progress', 'paused', 'completed'],
            description: 'Filter goals by status (optional)',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Filter goals by priority (optional)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createGoal',
      description: 'Create a new goal for the user',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the goal',
          },
          description: {
            type: 'string',
            description: 'Optional description of the goal',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Priority level of the goal (optional)',
          },
          dueDate: {
            type: 'string',
            format: 'date',
            description: 'Due date for the goal in YYYY-MM-DD format (optional)',
          },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addGoalAction',
      description: 'Add actions to an existing goal to help break it down into manageable steps',
      parameters: {
        type: 'object',
        properties: {
          goalId: {
            type: 'number',
            description: 'ID of the goal to add actions to',
          },
          actions: {
            type: 'array',
            description: 'Array of actions to add to the goal',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the action',
                },
                description: {
                  type: 'string',
                  description: 'Optional description of the action',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Priority of the action (optional)',
                },
                dueDate: {
                  type: 'string',
                  format: 'date',
                  description: 'Due date for the action in YYYY-MM-DD format (optional)',
                },
              },
              required: ['title'],
            },
          },
        },
        required: ['goalId', 'actions'],
      },
    },
  },

  // Travel Goals Management Tools
  {
    type: 'function',
    function: {
      name: 'getTravelGoals',
      description: "Get the user's current travel goals",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createTravelGoal',
      description: 'Create a new travel goal for the user',
      parameters: {
        type: 'object',
        properties: {
          destination: {
            type: 'string',
            description: 'Travel destination',
          },
          description: {
            type: 'string',
            description: 'Optional description of the travel goal',
          },
          budget: {
            type: 'number',
            description: 'Budget for the trip in GBP',
          },
          targetDate: {
            type: 'string',
            format: 'date',
            description: 'Target travel date in YYYY-MM-DD format',
          },
          travelers: {
            type: 'number',
            description: 'Number of travelers',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Priority level of the travel goal',
          },
        },
        required: ['destination', 'budget', 'targetDate', 'travelers', 'priority'],
      },
    },
  },

  // Shopping List Tools
  {
    type: 'function',
    function: {
      name: 'getShoppingLists',
      description: "Get the user's current shopping lists with item counts",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createShoppingList',
      description: 'Create a new shopping list for the user',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the shopping list',
          },
          description: {
            type: 'string',
            description: 'Optional description of the shopping list',
          },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addItemsToShoppingList',
      description: 'Add items to an existing shopping list',
      parameters: {
        type: 'object',
        properties: {
          listId: {
            type: 'string',
            description: 'ID of the shopping list to add items to',
          },
          items: {
            type: 'array',
            description: 'Array of items to add',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the item',
                },
                quantity: {
                  type: 'number',
                  description: 'Quantity of the item (optional)',
                },
                category: {
                  type: 'string',
                  enum: ['produce', 'dairy', 'meat_seafood', 'pantry', 'frozen', 'bakery', 'beverages', 'snacks', 'household', 'personal_care', 'other'],
                  description: 'Category of the item (optional)',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Priority of the item (optional)',
                },
                notes: {
                  type: 'string',
                  description: 'Optional notes about the item',
                },
              },
              required: ['name'],
            },
          },
        },
        required: ['listId', 'items'],
      },
    },
  },
];

export async function executeToolCalls(
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  userId: number
) {
  for (const toolCall of toolCalls) {
    try {
      const args = JSON.parse(toolCall.function.arguments);

      // Goals Management Tool Calls
      if (toolCall.function.name === 'getGoals') {
        console.log('Tool call: getGoals executed');
      } else if (toolCall.function.name === 'createGoal') {
        const { title, description, priority, dueDate } = args as {
          title: string;
          description?: string;
          priority?: string;
          dueDate?: string;
        };

        const newGoal = await db
          .insertInto('goals')
          .values({
            userId,
            title,
            description: description || null,
            priority: priority as any || null,
            dueDate: dueDate ? new Date(dueDate) : null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        console.log('Tool call: createGoal executed, created goal:', newGoal.id);
      } else if (toolCall.function.name === 'addGoalAction') {
        const { goalId, actions } = args as {
          goalId: number;
          actions: Array<{
            title: string;
            description?: string;
            priority?: string;
            dueDate?: string;
          }>;
        };

        const goal = await db
          .selectFrom('goals')
          .select('id')
          .where('id', '=', goalId)
          .where('userId', '=', userId)
          .executeTakeFirst();

        if (goal) {
          const actionsToInsert = actions.map(action => ({
            goalId: goalId,
            title: action.title,
            description: action.description || null,
            priority: action.priority as any || null,
            dueDate: action.dueDate ? new Date(action.dueDate) : null,
          }));

          const newActions = await db
            .insertInto('goalActions')
            .values(actionsToInsert)
            .returningAll()
            .execute();

          console.log('Tool call: addGoalAction executed, added actions:', newActions.length);
        } else {
          console.error('Tool call error: Goal not found or access denied');
        }
      }
      // Travel Goals Management Tool Calls
      else if (toolCall.function.name === 'getTravelGoals') {
        console.log('Tool call: getTravelGoals executed');
      } else if (toolCall.function.name === 'createTravelGoal') {
        const { destination, description, budget, targetDate, travelers, priority } = args as {
          destination: string;
          description?: string;
          budget: number;
          targetDate: string;
          travelers: number;
          priority: string;
        };

        const newTravelGoal = await db
          .insertInto('travelGoals')
          .values({
            id: nanoid(),
            userId,
            destination,
            description: description || null,
            budget: budget.toString(),
            targetDate: new Date(targetDate),
            travelers,
            priority: priority as any,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        console.log('Tool call: createTravelGoal executed, created travel goal:', newTravelGoal.id);
      }
      // Shopping List Tool Calls
      else if (toolCall.function.name === 'getShoppingLists') {
        console.log('Tool call: getShoppingLists executed');
      } else if (toolCall.function.name === 'createShoppingList') {
        const { name, description } = args as { name: string; description?: string };
        const newList = await db
          .insertInto('shoppingLists')
          .values({
            userId,
            name,
            description: description || null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        console.log('Tool call: createShoppingList executed, created list:', newList.id);
      } else if (toolCall.function.name === 'addItemsToShoppingList') {
        const { listId, items } = args as {
          listId: string;
          items: Array<{
            name: string;
            quantity?: number;
            category?: string;
            priority?: string;
            notes?: string;
          }>;
        };

        const list = await db
          .selectFrom('shoppingLists')
          .select('id')
          .where('id', '=', listId)
          .where('userId', '=', userId)
          .executeTakeFirst();

        if (list) {
          const itemsToInsert = items.map(item => ({
            shoppingListId: listId,
            name: item.name,
            quantity: item.quantity || null,
            category: item.category as any || null,
            priority: item.priority as any || null,
            notes: item.notes || null,
            addedVia: 'ai_chat',
          }));

          const newItems = await db
            .insertInto('shoppingItems')
            .values(itemsToInsert)
            .returningAll()
            .execute();

          console.log('Tool call: addItemsToShoppingList executed, added items:', newItems.length);
        } else {
          console.error('Tool call error: Shopping list not found or access denied');
        }
      }
    } catch (error) {
      console.error('Error executing tool call:', error);
    }
  }
}