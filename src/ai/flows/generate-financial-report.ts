'use server';
/**
 * @fileOverview Generates a financial summary report (Profit & Loss).
 *
 * - generateFinancialReport - A function that handles report generation.
 * - GenerateFinancialReportInput - The input type for the function.
 * - GenerateFinancialReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Invoice, Expense } from '@/lib/data';

// Simplified schemas for the flow input, as we can't pass complex objects directly easily.
// The data will be pre-processed in the server action.
const GenerateFinancialReportInputSchema = z.object({
  reportData: z.string().describe("A JSON string containing filtered invoices and expenses for the reporting period."),
  startDate: z.string().describe("The start date of the report period in ISO format."),
  endDate: z.string().describe("The end date of the report period in ISO format."),
});
export type GenerateFinancialReportInput = z.infer<typeof GenerateFinancialReportInputSchema>;

const GenerateFinancialReportOutputSchema = z.object({
  title: z.string().describe("The title of the report, e.g., 'Profit & Loss Statement'."),
  period: z.string().describe("The reporting period, e.g., 'January 1, 2024 - June 30, 2024'."),
  summary: z.string().describe("A narrative summary of the financial performance during the period. Should be 2-3 paragraphs long."),
  totalRevenue: z.number().describe("The total revenue from paid invoices."),
  totalExpenses: z.number().describe("The total of all expenses."),
  netProfit: z.number().describe("The calculated net profit (Revenue - Expenses)."),
  recommendations: z.string().describe("Actionable recommendations based on the financial data. Provide as a bulleted list in markdown format (using '-' or '*' for bullets)."),
});
export type GenerateFinancialReportOutput = z.infer<typeof GenerateFinancialReportOutputSchema>;

// This is the function the UI will call via a server action.
export async function generateFinancialReport(
  input: { startDate: Date, endDate: Date, invoices: Invoice[], expenses: Expense[] }
): Promise<GenerateFinancialReportOutput> {
    const dataForFlow = {
        startDate: input.startDate.toISOString(),
        endDate: input.endDate.toISOString(),
        reportData: JSON.stringify({
            invoices: input.invoices.map(i => ({ date: i.issueDate, amount: i.total, status: i.status })),
            expenses: input.expenses.map(e => ({ date: e.date, amount: e.amount, category: e.category }))
        }),
    };
  return generateFinancialReportFlow(dataForFlow);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialReportPrompt',
  input: {schema: GenerateFinancialReportInputSchema},
  output: {schema: GenerateFinancialReportOutputSchema},
  prompt: `You are an expert financial analyst for a construction project management company.
  Your task is to generate a clear and insightful Profit & Loss style report based on the provided financial data.

  The report is for the period from {{startDate}} to {{endDate}}.

  Here is the financial data for the period, in JSON format:
  {{{reportData}}}

  Analyze the provided invoices and expenses. For revenue, only consider invoices with a status of 'Paid'.
  Calculate the total revenue, total expenses, and the resulting net profit.

  Based on your analysis, provide a concise narrative summary of the company's performance, highlighting key trends or significant figures.
  Also, provide a few actionable recommendations in a bulleted list to help the business improve its financial health.

  Structure your entire output according to the provided JSON schema.
  The 'period' field should be a human-readable string like 'January 1, 2024 - June 30, 2024'.
  `,
});

const generateFinancialReportFlow = ai.defineFlow(
  {
    name: 'generateFinancialReportFlow',
    inputSchema: GenerateFinancialReportInputSchema,
    outputSchema: GenerateFinancialReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
