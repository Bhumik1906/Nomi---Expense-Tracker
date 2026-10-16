import { ExpenseSplitItem } from './types';

export interface ShareSplitInput {
  userId: string;
  shares: number; // e.g. 2, 1, 1
}

/**
 * Splits total minor amount proportionally by shares.
 * Allocates remainder cents/paise deterministically based on fractional remainders.
 */
export function splitShares(
  totalMinorAmount: number,
  inputs: ShareSplitInput[]
): { splits: ExpenseSplitItem[]; isValid: boolean; error?: string } {
  if (!inputs.length) {
    return { splits: [], isValid: false, error: 'At least one participant is required.' };
  }

  const totalShares = inputs.reduce((sum, item) => sum + item.shares, 0);

  if (totalShares <= 0) {
    return {
      splits: [],
      isValid: false,
      error: 'Total shares must be greater than 0.',
    };
  }

  const calculated = inputs.map((item) => {
    const exactShare = (totalMinorAmount * item.shares) / totalShares;
    const baseAmount = Math.floor(exactShare);
    const remainder = exactShare - baseAmount;
    return {
      userId: item.userId,
      shares: item.shares,
      baseAmount,
      remainder,
    };
  });

  const sumBase = calculated.reduce((acc, curr) => acc + curr.baseAmount, 0);
  const missingCents = totalMinorAmount - sumBase;

  // Sort by remainder descending
  const indices = calculated
    .map((item, idx) => ({ idx, remainder: item.remainder }))
    .sort((a, b) => b.remainder - a.remainder);

  const finalAmounts = new Array<number>(inputs.length).fill(0);
  calculated.forEach((item, idx) => {
    finalAmounts[idx] = item.baseAmount;
  });

  for (let i = 0; i < missingCents; i++) {
    const targetIdx = indices[i % indices.length].idx;
    finalAmounts[targetIdx] += 1;
  }

  const splits: ExpenseSplitItem[] = calculated.map((item, idx) => ({
    userId: item.userId,
    amount: finalAmounts[idx],
    splitValue: item.shares,
  }));

  return { splits, isValid: true };
}
