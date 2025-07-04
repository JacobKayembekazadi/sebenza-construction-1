"use server";

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

  // Calculate totals
  const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Generate a simple report
  const report = {
    summary: `Financial Report for ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}

REVENUE SUMMARY:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Number of Paid Invoices: ${filteredInvoices.length}
- Average Invoice Value: $${filteredInvoices.length > 0 ? (totalRevenue / filteredInvoices.length).toLocaleString() : '0'}

EXPENSE SUMMARY:
- Total Expenses: $${totalExpenses.toLocaleString()}
- Number of Expenses: ${filteredExpenses.length}
- Average Expense: $${filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toLocaleString() : '0'}

PROFITABILITY:
- Net Profit: $${netProfit.toLocaleString()}
- Profit Margin: ${profitMargin.toFixed(2)}%
- Financial Health: ${netProfit > 0 ? 'Profitable' : 'Loss'}

KEY INSIGHTS:
${netProfit > 0 
  ? `• Business is profitable with a ${profitMargin.toFixed(1)}% margin
• Revenue exceeds expenses by $${netProfit.toLocaleString()}`
  : `• Business is operating at a loss of $${Math.abs(netProfit).toLocaleString()}
• Expenses exceed revenue by ${Math.abs(profitMargin).toFixed(1)}%`
}
• Average project value: $${filteredInvoices.length > 0 ? (totalRevenue / filteredInvoices.length).toFixed(0) : '0'}
• Expense control: ${(totalExpenses / totalRevenue * 100).toFixed(1)}% of revenue`,

    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin
  };

  return report;
}
