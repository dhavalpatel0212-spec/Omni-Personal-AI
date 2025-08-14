import { z } from 'zod';
import superjson from 'superjson';

const issueTypes = ["bug_report", "feature_request", "general_feedback", "account_issue", "performance_issue", "other"] as const;
const priorities = ["low", "medium", "high", "critical"] as const;
const categories = ["goals", "shopping", "travel", "chat", "calendar", "profile", "settings", "other"] as const;

export const schema = z.object({
  issueType: z.enum(issueTypes),
  subject: z.string().min(1, "Subject is required.").max(100),
  description: z.string().min(1, "Description is required.").max(2000),
  stepsToReproduce: z.string().max(2000).optional(),
  expectedBehavior: z.string().max(1000).optional(),
  actualBehavior: z.string().max(1000).optional(),
  priority: z.enum(priorities),
  category: z.enum(categories),
  deviceInfo: z.string().optional(),
  contactPreference: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  ticketId: string;
  message: string;
};

// This function is for client-side use with react-query.
// It expects a FormData object because it handles file uploads.
export const postSubmitFeedback = async (
  formData: FormData,
  init?: RequestInit
): Promise<OutputType> => {
  // Note: We don't stringify FormData. The browser will handle it with the correct multipart/form-data header.
  const result = await fetch(`/_api/feedback/submit`, {
    method: "POST",
    body: formData,
    ...init,
    // Do not set Content-Type header, browser does it for FormData
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as any)?.error || "Failed to submit feedback");
  }
  return superjson.parse<OutputType>(await result.text());
};