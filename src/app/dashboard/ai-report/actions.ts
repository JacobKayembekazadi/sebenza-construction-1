"use server";

import { generateFinancialReport } from "@/ai/flows/generate-financial-report";
import { invoices, expenses } from "@/lib/data";

export async function getFinancialReport(
  startDate: Date,
  endDate: Date
) {
  // Filter data based on the date range
  const filteredInvoices = invoices.filter(i => {
    const issueDate = new Date(i.issueDate);
    // Only include paid invoices for revenue calculation
    return issueDate >= startDate && issueDate <= endDate && i.status === 'Paid';
  });

  const filteredExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Call the Genkit flow
  const report = await generateFinancialReport({
    startDate,
    endDate,
    invoices: filteredInvoices,
    expenses: filteredExpenses,
  });

  return report;
}
