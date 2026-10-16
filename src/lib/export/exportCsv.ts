import { Expense, UserProfile } from '../types/nomi';
import { Currency } from '../finance/types';
import { formatMoney } from '../finance/money';

/**
 * Generates and triggers download of a CSV file containing expense details.
 */
export function exportExpensesToCSV(
  expenses: Expense[],
  allUsers: Record<string, UserProfile>,
  groupName: string = 'Nomi_Expenses',
  currency: Currency = 'INR'
) {
  if (!expenses || expenses.length === 0) return;

  const headers = ['Date', 'Category', 'Title', 'Group', 'Paid By', 'Total Amount', 'Split Type', 'Participants'];

  const rows = expenses.map((exp) => {
    const paidBy = allUsers[exp.paidBy]?.name || exp.paidBy;
    const dateStr = exp.date ? new Date(exp.date).toLocaleDateString() : '';
    const formattedAmount = formatMoney(exp.amount, currency);
    const participantNames = exp.splits.map((s) => allUsers[s.userId]?.name || s.userId).join('; ');

    return [
      `"${dateStr}"`,
      `"${exp.category || 'General'}"`,
      `"${exp.title.replace(/"/g, '""')}"`,
      `"${groupName}"`,
      `"${paidBy.replace(/"/g, '""')}"`,
      `"${formattedAmount}"`,
      `"${exp.splitType}"`,
      `"${participantNames.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileName = `${groupName.toLowerCase().replace(/\s+/g, '_')}_expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
