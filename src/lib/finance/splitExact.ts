import { ExpenseSplitItem } from './types';

export interface ExactSplitInput {
  userId: string;
  amount: number; // in minor units
}

/**
 * Validates and formats exact split input.
 */
export function splitExact(
  totalMinorAmount: number,
  splitsInput: ExactSplitInput[]
): { splits: ExpenseSplitItem[]; isValid: boolean; error?: string } {
  if (!splitsInput.length) {
    return { splits: [], isValid: false, error: 'At least one participant is required.' };
  }

  let sum = 0;
  const splits: ExpenseSplitItem[] = [];

  for (const item of splitsInput) {
    if (item.amount < 0) {
      return { splits: [], isValid: false, error: 'Split amount cannot be negative.' };
    }
    sum += item.amount;
    splits.push({
      userId: item.userId,
      amount: item.amount,
      splitValue: item.amount,
    });
  }

  if (sum !== totalMinorAmount) {
    const diff = totalMinorAmount - sum;
    const diffText = diff > 0 ? `${diff / 100} remaining` : `${Math.abs(diff) / 100} over total`;
    return {
      splits: [],
      isValid: false,
      error: `Sum of exact splits does not equal total expense amount (${diffText}).`,
    };
  }

  return { splits, isValid: true };
}
