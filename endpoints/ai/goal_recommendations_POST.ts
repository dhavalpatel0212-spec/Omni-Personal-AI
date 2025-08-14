import { schema, OutputType } from "./goal_recommendations_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { OpenAI } from "openai";
import { aiModelRouter } from "../../helpers/aiModelRouter";
import superjson from "superjson";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { goalId } = schema.parse(json);

    const goal = await db
      .selectFrom("goals")
      .selectAll()
      .where("userId", "=", user.id)
      .where("id", "=", goalId)
      .executeTakeFirst();

    if (!goal) {
      return new Response(
        superjson.stringify({ error: "Goal not found or you do not have permission to access it." }),
        { status: 404 }
      );
    }

    const goalDetails = JSON.stringify({
        title: goal.title,
        description: goal.description,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        dueDate: goal.dueDate,
    });

    const prompt = `
      Analyze the following user goal and generate 3-5 specific, actionable recommendations to help the user achieve it.
      The recommendations should be practical steps the user can take.
      For each recommendation, provide a short, clear title and a brief description of the action.

      User's Goal Details:
      ${goalDetails}

      Please format your response as a JSON object with a single key "recommendations", which is an array of objects.
      Each object in the array should have two keys: "title" and "description".
      Example format:
      {
        "recommendations": [
          {
            "title": "Break Down the First Step",
            "description": "Identify the very first small task you can complete in the next 24 hours to build momentum."
          },
          {
            "title": "Schedule Work Blocks",
            "description": "Block out two 45-minute sessions in your calendar this week to dedicate to this goal."
          }
        ]
      }
    `;

    const messages = [
      {
        role: "system" as const,
        content: "You are a helpful productivity assistant. You provide specific, actionable recommendations for user goals. You must respond only with the requested JSON object and nothing else.",
      },
      { role: "user" as const, content: prompt },
    ];

    const modelSelection = aiModelRouter({ messages });
    
    console.log(`AI Goal Recommendations - Model Selection:`, {
      model: modelSelection.model,
      reason: modelSelection.reason,
      userId: user.id,
      goalId: goal.id,
    });

    const response = await openai.chat.completions.create({
      model: modelSelection.model,
      messages,
      response_format: { type: "json_object" },
      ...modelSelection.config,
    });

    const content = response.choices[0].message.content;
    if (!content) {
        throw new Error("AI failed to generate recommendations.");
    }

    // The AI is instructed to return a JSON object, so we parse it.
    const recommendations = JSON.parse(content);

    return new Response(superjson.stringify(recommendations satisfies OutputType));
  } catch (error) {
    console.error("Error in AI goal recommendations endpoint:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}