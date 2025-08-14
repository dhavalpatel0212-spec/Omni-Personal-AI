import { z } from "zod";
import { OpenAI } from 'openai';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, OutputType, AnalyzedGoal } from './analyze_image_for_goals_POST.schema';
import { GoalPriorityArrayValues } from '../../helpers/schema';
import superjson from 'superjson';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handle(request: Request): Promise<Response> {
  try {
    await getServerUserSession(request); // Authenticate user
    const formData = await request.formData();
    const validatedInput = schema.parse({
      image: formData.get('image'),
    });

    const imageFile = validatedInput.image;
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imageFile.type;

    const prompt = `
      Analyze the provided image, which could be a screenshot of a plan, a photo of a whiteboard, a document, or handwritten notes.
      Extract any actionable goals, tasks, or objectives.
      For each item found, create a structured goal object with the following fields:
      - "title": A concise title for the goal. This is required.
      - "description": A detailed description. Optional.
      - "priority": The goal's priority. Must be one of: ${GoalPriorityArrayValues.join(", ")}. Optional.
      - "dueDate": The estimated due date in "YYYY-MM-DD" format. Infer this from any dates mentioned in the image. Optional.

      Today's date is ${new Date().toISOString().split("T")[0]}.
      Respond with a single JSON object containing a "goals" key, which holds an array of these goal objects.
      Example: {"goals": [{"title": "Launch new feature", "description": "Finalize and deploy the user profile page.", "priority": "high", "dueDate": "2024-12-15"}]}
      If no goals are found, return an empty "goals" array.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsedContent = JSON.parse(content);
    const goals = parsedContent.goals || [];

    // Validate the structure of the parsed goals
    const analyzedGoalsSchema = z.array(AnalyzedGoal);
    const validatedGoals = analyzedGoalsSchema.parse(goals);

    const output: OutputType = { goals: validatedGoals };
    return new Response(superjson.stringify(output));

  } catch (error) {
    console.error("Error analyzing image for goals:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: error instanceof z.ZodError ? 400 : 500 });
  }
}