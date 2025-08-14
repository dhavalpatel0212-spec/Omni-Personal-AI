import { schema, InputType, OutputType } from "./create_goal_from_text_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { GoalPriorityArrayValues } from "../../helpers/schema";
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
    const { text } = schema.parse(json);

    const prompt = `
      Parse the following user request to create a structured goal object.
      The user's request is: "${text}"

      Extract the following fields and return them in a JSON object:
      - title: A concise, clear title for the goal. This is required.
      - description: A more detailed description of the goal. This is optional.
      - priority: The goal's priority. Must be one of: ${GoalPriorityArrayValues.join(
        ", "
      )}. This is optional.
      - dueDate: The suggested due date for the goal in "YYYY-MM-DD" format. Infer this from the text if possible (e.g., "next Friday", "end of the month"). This is optional.

      Today's date is ${new Date().toISOString().split("T")[0]}.
      If no specific information is provided for a field, omit it from the JSON object, except for the title which is mandatory.
    `;

    // Use aiModelRouter to select optimal model for text parsing
    const messages = [
      {
        role: "system" as const,
        content:
          "You are an expert at parsing natural language and converting it into structured JSON data for goal creation. Only return the JSON object.",
      },
      { role: "user" as const, content: prompt },
    ];

    const modelSelection = aiModelRouter({ messages });
    
    // Log model selection for analytics
    console.log(`AI Create Goal From Text - Model Selection:`, {
      model: modelSelection.model,
      confidence: modelSelection.confidence,
      reason: modelSelection.reason,
      userId: user.id,
      textLength: text.length,
    });

    const response = await openai.chat.completions.create({
      model: modelSelection.model,
      response_format: { type: "json_object" },
      messages,
      ...modelSelection.config,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("AI did not return any content.");
    }

    const parsedJson = JSON.parse(content);

    // Validate and transform the AI's output
    const goalData: OutputType = {
      title: parsedJson.title || "Untitled Goal",
      description: parsedJson.description || null,
      priority: GoalPriorityArrayValues.includes(parsedJson.priority)
        ? parsedJson.priority
        : null,
      dueDate: parsedJson.dueDate ? new Date(parsedJson.dueDate) : null,
    };

    return new Response(superjson.stringify(goalData));
  } catch (error) {
    console.error("Error in AI create goal from text endpoint:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}