import { ExpenseSplitItem } from './types';

export interface PercentageSplitInput {
  userId: string;
  percentage: number; // e.g., 33.33
}

/**
 * Splits total minor amount by percentage.
 * Validates percentages sum to 100%, and allocates remainders to ensure exact sum.
 */
export function splitPercentage(
  totalMinorAmount: number,
  inputs: PercentageSplitInput[]
): { splits: ExpenseSplitItem[]; isValid: boolean; error?: string } {
  if (!inputs.length) {
    return { splits: [], isValid: false, error: 'At least one participant is required.' };
  }

  const totalPercentage = inputs.reduce((sum, item) => sum + item.percentage, 0);
  
  // Allow slight floating precision variance for sum check (99.99 to 100.01)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return {
      splits: [],
      isValid: false,
      error: `Total percentage must equal 100% (currently ${totalPercentage.toFixed(2)}%).`,
    };
  }

  // Calculate raw amounts and fractional remainders
  const calculated = inputs.map((item) => {
    const exactShare = (totalMinorAmount * item.percentage) / 100;
    const baseAmount = Math.floor(exactShare);
    const remainder = exactShare - baseAmount;
    return {
      userId: item.userId,
      percentage: item.percentage,
      baseAmount,
      remainder,
    };
  });

  const sumBase = calculated.reduce((acc, curr) => acc + curr.baseAmount, 0);
  const missingCents = totalMinorAmount - sumBase;

  // Sort by remainder descending to give extra cents/paise to highest remainders
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
    splitValue: item.percentage,
  }));

  return { splits, isValid: true };
}
