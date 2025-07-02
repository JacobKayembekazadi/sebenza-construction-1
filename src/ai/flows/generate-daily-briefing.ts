'use server';
/**
 * @fileOverview Generates a personalized daily briefing for a project manager.
 *
 * - generateDailyBriefing - A function that analyzes project data to create a summary.
 * - DailyBriefingInput - The input type for the generateDailyBriefing function.
 * - DailyBriefingOutput - The return type for the generateDailyBriefing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type Project, type Task } from '@/lib/data';

const DailyBriefingInputSchema = z.object({
  userName: z.string().describe('The name of the project manager.'),
  currentDate: z.string().describe('The current date in ISO format.'),
  projects: z.any().describe('A JSON string of all projects.'),
  tasks: z.any().describe('A JSON string of all tasks.'),
});
export type DailyBriefingInput = z.infer<typeof DailyBriefingInputSchema>;

const DailyBriefingOutputSchema = z.object({
  greeting: z.string().describe('A personalized greeting for the user.'),
  keyPriorities: z.array(z.string()).describe('A list of the most important action items or tasks for the day.'),
  potentialRisks: z.array(z.string()).describe('A list of potential risks or issues that need attention.'),
  positiveUpdates: z.array(z.string()).describe("A list of positive updates or milestones recently achieved.")
});
export type DailyBriefingOutput = z.infer<typeof DailyBriefingOutputSchema>;

export async function generateDailyBriefing(
  input: { userName: string; projects: Project[], tasks: Task[] }
): Promise<DailyBriefingOutput> {
  const flowInput = {
      ...input,
      currentDate: new Date().toISOString(),
      projects: JSON.stringify(input.projects, null, 2),
      tasks: JSON.stringify(input.tasks.map(t => ({...t, assignee: t.assignee.name})), null, 2)
  }
  return generateDailyBriefingFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'dailyBriefingPrompt',
  input: {schema: DailyBriefingInputSchema},
  output: {schema: DailyBriefingOutputSchema},
  prompt: `You are an expert project management assistant named 'Sebenza AI'. 
  Your goal is to provide a clear, concise, and actionable daily briefing for a project manager.
  
  Today's Date: {{{currentDate}}}
  Project Manager: {{{userName}}}
  
  Analyze the following project and task data. Identify the most critical priorities, upcoming deadlines, potential risks (e.g., overdue tasks, off-track projects), and recent positive accomplishments.
  
  - For 'keyPriorities', focus on the most urgent tasks assigned to {{{userName}}} and critical project-level actions needed. Be specific and actionable.
  - For 'potentialRisks', identify projects that are 'At Risk' or 'Off Track', and any tasks that are overdue. Mention the number of overdue days.
  - For 'positiveUpdates', highlight any tasks recently completed or projects that are performing well. This is for morale.
  - Keep each item in the arrays as a short, single sentence.
  - The greeting should be friendly and mention the user by name.

  Project Data:
  \`\`\`json
  {{{projects}}}
  \`\`\`
  
  Task Data:
  \`\`\`json
  {{{tasks}}}
  \`\`\`
  `,
});

const generateDailyBriefingFlow = ai.defineFlow(
  {
    name: 'generateDailyBriefingFlow',
    inputSchema: DailyBriefingInputSchema,
    outputSchema: DailyBriefingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
