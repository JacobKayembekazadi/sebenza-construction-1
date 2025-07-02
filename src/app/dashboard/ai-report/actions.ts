"use server";

import { generateProjectProgressSummary } from "@/ai/flows/generate-project-progress-summary";
import { z } from "zod";

const ReportSchema = z.object({
  projectUpdates: z.string().min(10, {
    message: "Project updates must be at least 10 characters long.",
  }),
});

type State = {
  summary?: string;
  progress?: string;
  errors?: {
    projectUpdates?: string[];
  };
  message?: string | null;
};

export async function getAiReport(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = ReportSchema.safeParse({
    projectUpdates: formData.get("projectUpdates"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your input.",
    };
  }
  
  try {
    const result = await generateProjectProgressSummary({
      projectUpdates: validatedFields.data.projectUpdates,
    });
    return { summary: result.summary, progress: result.progress };
  } catch (e) {
    return { message: "Failed to generate report. Please try again." };
  }
}
