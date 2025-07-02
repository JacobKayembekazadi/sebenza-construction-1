// src/ai/flows/generate-project-progress-summary.ts
'use server';
/**
 * @fileOverview Generates a project progress summary based on the latest project updates.
 *
 * - generateProjectProgressSummary - A function that handles the project progress summary generation.
 * - GenerateProjectProgressSummaryInput - The input type for the generateProjectProgressSummary function.
 * - GenerateProjectProgressSummaryOutput - The return type for the generateProjectProgressSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectProgressSummaryInputSchema = z.object({
  projectUpdates: z.string().describe('The latest updates for the project.'),
});
export type GenerateProjectProgressSummaryInput = z.infer<typeof GenerateProjectProgressSummaryInputSchema>;

const GenerateProjectProgressSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated project progress summary.'),
  progress: z.string().describe('A short, one-sentence summary of the progress.')
});
export type GenerateProjectProgressSummaryOutput = z.infer<typeof GenerateProjectProgressSummaryOutputSchema>;

export async function generateProjectProgressSummary(
  input: GenerateProjectProgressSummaryInput
): Promise<GenerateProjectProgressSummaryOutput> {
  return generateProjectProgressSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectProgressSummaryPrompt',
  input: {schema: GenerateProjectProgressSummaryInputSchema},
  output: {schema: GenerateProjectProgressSummaryOutputSchema},
  prompt: `You are a project manager. Generate a project progress summary based on the latest project updates provided.

Latest Project Updates: {{{projectUpdates}}}

Summary:`, 
});

const generateProjectProgressSummaryFlow = ai.defineFlow(
  {
    name: 'generateProjectProgressSummaryFlow',
    inputSchema: GenerateProjectProgressSummaryInputSchema,
    outputSchema: GenerateProjectProgressSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'The project progress summary has been generated successfully.',
    };
  }
);
