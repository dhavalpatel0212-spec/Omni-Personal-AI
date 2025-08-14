import { schema, OutputType } from "./analyze_goals_POST.schema";
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

    const goals = await db
      .selectFrom("goals")
      .selectAll()
      .where("userId", "=", user.id)
      .execute();

    if (goals.length === 0) {
      return new Response(
        superjson.stringify({
          analysis:
            "You don't have any goals yet. Add some goals so I can provide insights!",
        } satisfies OutputType)
      );
    }

    const goalsString = JSON.stringify(
      goals.map((g) => ({
        title: g.title,
        description: g.description,
        status: g.status,
        priority: g.priority,
        progress: g.progress,
        dueDate: g.dueDate,
      }))
    );

    const prompt = `
      The user "${user.displayName}" has provided their list of goals.
      Analyze these goals and provide actionable insights, suggestions, and motivational feedback.
      Your analysis should be concise, helpful, and encouraging. Structure your response in Markdown.

      Your analysis should cover:
      1.  **Overall Summary:** A brief overview of their current goals.
      2.  **Potential Conflicts or Overlaps:** Identify any goals that might compete for the same resources or time.
      3.  **Suggestions for Improvement:** Suggest ways to make goals more specific, measurable, achievable, relevant, and time-bound (SMART).
      4.  **Prioritization Advice:** Based on due dates and priorities, suggest what they might want to focus on next.
      5.  **Motivational Message:** End with a positive and encouraging note.

      Here are the user's goals in JSON format:
      ${goalsString}
    `;

    // Use aiModelRouter to select optimal model for goal analysis
    const messages = [
      {
        role: "system" as const,
        content:
          "You are a productivity expert analyzing a user's goals. Provide clear, structured, and actionable feedback in Markdown format.",
      },
      { role: "user" as const, content: prompt },
    ];

    const modelSelection = aiModelRouter({ messages });
    
    // Log model selection for analytics
    console.log(`AI Goal Analysis - Model Selection:`, {
      model: modelSelection.model,
      confidence: modelSelection.confidence,
      reason: modelSelection.reason,
      userId: user.id,
      goalCount: goals.length,
    });

    const response = await openai.chat.completions.create({
      model: modelSelection.model,
      messages,
      ...modelSelection.config,
    });

    const analysis = response.choices[0].message.content ?? "No insights generated.";

    return new Response(superjson.stringify({ analysis } satisfies OutputType));
  } catch (error) {
    console.error("Error in AI goal analysis endpoint:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}