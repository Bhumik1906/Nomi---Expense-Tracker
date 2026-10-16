import { ExpenseSplitItem, SplitType } from './types';
import { splitEqual } from './splitEqual';
import { splitExact, ExactSplitInput } from './splitExact';
import { splitPercentage, PercentageSplitInput } from './splitPercentage';
import { splitShares, ShareSplitInput } from './splitShares';

export interface SplitEngineInput {
  totalMinorAmount: number;
  splitType: SplitType;
  participantUserIds: string[];
  exactInputs?: ExactSplitInput[];
  percentageInputs?: PercentageSplitInput[];
  shareInputs?: ShareSplitInput[];
}

export function computeAndValidateSplit(input: SplitEngineInput): {
  splits: ExpenseSplitItem[];
  isValid: boolean;
  error?: string;
} {
  const { totalMinorAmount, splitType, participantUserIds } = input;

  if (totalMinorAmount <= 0) {
    return { splits: [], isValid: false, error: 'Expense amount must be greater than 0.' };
  }

  if (!participantUserIds.length) {
    return { splits: [], isValid: false, error: 'At least one participant must be selected.' };
  }

  switch (splitType) {
    case 'equal': {
      const splits = splitEqual(totalMinorAmount, participantUserIds);
      return { splits, isValid: true };
    }

    case 'exact': {
      if (!input.exactInputs) {
        return { splits: [], isValid: false, error: 'Exact amounts are required.' };
      }
      return splitExact(totalMinorAmount, input.exactInputs);
    }

    case 'percentage': {
      if (!input.percentageInputs) {
        return { splits: [], isValid: false, error: 'Percentages are required.' };
      }
      return splitPercentage(totalMinorAmount, input.percentageInputs);
    }

    case 'shares': {
      if (!input.shareInputs) {
        return { splits: [], isValid: false, error: 'Shares are required.' };
      }
      return splitShares(totalMinorAmount, input.shareInputs);
    }

    default:
      return { splits: [], isValid: false, error: 'Invalid split type.' };
  }
}
