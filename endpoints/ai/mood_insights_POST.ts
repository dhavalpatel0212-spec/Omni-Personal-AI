import { schema, OutputType } from "./mood_insights_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";
import OpenAI from 'openai';
import { aiModelRouter } from "../../helpers/aiModelRouter";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    // Fetch the last 30 days of mood logs for the user
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moodLogs = await db
      .selectFrom('moodLogs')
      .select(['moodValue', 'notes', 'loggedAt'])
      .where('userId', '=', user.id)
      .where('loggedAt', '>=', thirtyDaysAgo)
      .orderBy('loggedAt', 'desc')
      .limit(30)
      .execute();

    if (moodLogs.length < 3) {
      return new Response(
        superjson.stringify({ error: "Not enough mood data to generate insights. Please log your mood for at least 3 days." }),
        { status: 400 }
      );
    }

    const formattedMoodLogs = moodLogs.map(log => {
      const logDate = log.loggedAt ? new Date(log.loggedAt).toLocaleDateString() : 'Unknown date';
      return `- On ${logDate}, mood was ${log.moodValue}/5. Notes: ${log.notes || 'N/A'}`;
    }).join('\n');

    const systemPrompt = `You are an empathetic and insightful AI wellness coach. Your goal is to analyze a user's mood logs to provide encouraging, actionable, and personalized feedback. The user's mood is rated on a scale of 1 (very negative) to 5 (very positive).

Analyze the following mood data for the user "${user.displayName}":
${formattedMoodLogs}

Based on this data, provide two sets of insights in a JSON object format with two keys: "positiveObservations" and "improvementSuggestions".
- "positiveObservations": Identify and praise positive patterns, consistencies, or high points. Be specific and encouraging. Frame these as things the user is doing well.
- "improvementSuggestions": Offer gentle, practical, and actionable advice to help improve their mood or manage low points. If there are potential correlations (e.g., low moods on weekends), mention them as a point of reflection. Avoid being preachy or overly clinical.

Rules:
- The output MUST be a valid JSON object.
- Each key should contain an array of strings, with each string being a distinct point.
- Provide 2-3 points for each category.
- Keep the tone supportive and positive, even when giving suggestions.
- Do not include any text outside of the JSON object.
`;

    const modelSelection = aiModelRouter({
      messages: [{ role: "system", content: systemPrompt }],
    });

    console.log(`AI Model Router selected for mood insights: ${modelSelection.model}`, {
      reason: modelSelection.reason,
      userId: user.id,
    });

    const response = await openai.chat.completions.create({
      model: modelSelection.model,
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    const insights = JSON.parse(content) as OutputType;

    // Basic validation of the parsed object
    if (!Array.isArray(insights.positiveObservations) || !Array.isArray(insights.improvementSuggestions)) {
        throw new Error("OpenAI returned an invalid JSON structure.");
    }

    return new Response(superjson.stringify(insights satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in AI mood insights endpoint:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}