import { db } from './db';
import type { OpenAI } from 'openai';

async function fetchShoppingListsContext(userId: number): Promise<string> {
  const userShoppingLists = await db
    .selectFrom('shoppingLists')
    .leftJoin('shoppingItems', 'shoppingLists.id', 'shoppingItems.shoppingListId')
    .select([
      'shoppingLists.id',
      'shoppingLists.name',
      'shoppingLists.description',
      'shoppingLists.createdAt',
      'shoppingLists.updatedAt',
      (eb) => eb.fn.count('shoppingItems.id').as('totalItems'),
      (eb) => eb.fn.count('shoppingItems.id').filterWhere('shoppingItems.isCompleted', '=', true).as('completedItems')
    ])
    .where('shoppingLists.userId', '=', userId)
    .where('shoppingLists.isArchived', '=', false)
    .groupBy(['shoppingLists.id'])
    .orderBy('shoppingLists.updatedAt', 'desc')
    .execute();

  if (userShoppingLists.length === 0) {
    return '\n\nYou currently have no shopping lists.';
  }

  return `\n\nYour current shopping lists:\n${userShoppingLists.map(list =>
    `- ${list.name} (ID: ${list.id}): ${list.description || 'No description'} - ${list.totalItems} items (${list.completedItems} completed)`
  ).join('\n')}`;
}

async function fetchGoalsContext(userId: number): Promise<string> {
  const userGoals = await db
    .selectFrom('goals')
    .leftJoin('goalActions', 'goals.id', 'goalActions.goalId')
    .select([
      'goals.id',
      'goals.title',
      'goals.description',
      'goals.status',
      'goals.priority',
      'goals.progress',
      'goals.dueDate',
      'goals.createdAt',
      (eb) => eb.fn.count('goalActions.id').as('totalActions'),
      (eb) => eb.fn.count('goalActions.id').filterWhere('goalActions.isCompleted', '=', true).as('completedActions')
    ])
    .where('goals.userId', '=', userId)
    .groupBy(['goals.id'])
    .orderBy('goals.updatedAt', 'desc')
    .limit(10)
    .execute();

  if (userGoals.length === 0) {
    return '\n\nYou currently have no goals.';
  }

  return `\n\nYour current goals:\n${userGoals.map(goal =>
    `- ${goal.title} (ID: ${goal.id}): ${goal.description || 'No description'} - Status: ${goal.status || 'not_started'}, Priority: ${goal.priority || 'medium'}, Progress: ${goal.progress || 0}% - ${goal.totalActions} actions (${goal.completedActions} completed)${goal.dueDate ? `, Due: new Date(goal.dueDate).toLocaleDateString()}` : ''}`
  ).join('\n')}`;
}

async function fetchTravelGoalsContext(userId: number): Promise<string> {
  const userTravelGoals = await db
    .selectFrom('travelGoals')
    .selectAll()
    .where('userId', '=', userId)
    .orderBy('updatedAt', 'desc')
    .limit(10)
    .execute();

  if (userTravelGoals.length === 0) {
    return '\n\nYou currently have no travel goals.';
  }

  return `\n\nYour current travel goals:\n${userTravelGoals.map(goal =>
    `- ${goal.destination} (ID: ${goal.id}): ${goal.description || 'No description'} - Budget: £${goal.budget}, Target Date: ${new Date(goal.targetDate).toLocaleDateString()}, Travelers: ${goal.travelers}, Priority: ${goal.priority}`
  ).join('\n')}`;
}

export async function getAiChatContext(
  userId: number,
  userDisplayName: string,
  hasImages: boolean
): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam> {
  const [shoppingListsContext, goalsContext, travelGoalsContext] = await Promise.all([
    fetchShoppingListsContext(userId),
    fetchGoalsContext(userId),
    fetchTravelGoalsContext(userId),
  ]);

  const baseSystemContent = `You are a world-class personal productivity assistant. Your name is Floot AI.
Your purpose is to help the user (${userDisplayName}) achieve their goals, manage their time effectively, maintain travel plans, and maintain a positive and motivated mindset.
- Be encouraging, supportive, and proactive.
- Provide clear, concise, and actionable advice.
- Help break down large goals into smaller, manageable steps.
- Offer suggestions for prioritizing tasks and goals.
- When asked, help draft plans or schedules.
- Suggest creating goals when users mention wanting to achieve something.
- Help users organize their travel plans and suggest improvements.
- Keep your responses focused on productivity, goal achievement, travel planning, and personal growth.
- Do not go off-topic.
- The current date is ${new Date().toLocaleDateString()}.

You have access to comprehensive productivity management functionality:

**Goals Management**: When users mention wanting to achieve something, learn something, or accomplish tasks, you can:
- View their current goals with progress and actions
- Create new goals with titles, descriptions, due dates, and priorities
- Add specific actions to existing goals to help break them down

**Travel Planning**: When users mention travel, trips, or destinations, you can:
- View their current travel goals
- Create new travel goals with destinations, budgets, dates, and traveler counts
- Help plan and organize their travel aspirations

**Shopping Lists**: When users mention shopping, groceries, or want to add items to lists, you can:
- View their current shopping lists
- Create new shopping lists
- Add items to existing shopping lists

${goalsContext}${travelGoalsContext}${shoppingListsContext}`;

  const visionSystemContent = `${baseSystemContent}

When analyzing images, you can help with:
- **Goals and planning**: If you see whiteboards, notes, planners, or planning documents, I can help identify actionable goals, extract tasks, and create structured goals and actions using the available tools.
- **Travel inspiration**: If you see travel photos, destination images, or travel plans, I can help create travel goals and provide planning advice.
- **Shopping lists**: If you see receipts, handwritten shopping lists, or product photos, I can help extract items and add them to shopping lists using the available tools.
- **General productivity**: For any other images, I'll provide helpful analysis and actionable advice related to productivity, goal achievement, and personal growth.

Always provide specific, actionable suggestions based on what you see in the images and proactively suggest creating goals, actions, or travel plans when appropriate.`;

  const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: 'system',
    content: hasImages ? visionSystemContent : baseSystemContent,
  };

  return systemMessage;
}