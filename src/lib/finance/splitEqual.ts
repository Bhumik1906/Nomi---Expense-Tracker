import { ExpenseSplitItem } from './types';

/**
 * Splits total minor amount equally among participants.
 * Handles integer division remainder deterministically so sum(splits) === totalMinorAmount.
 */
export function splitEqual(
  totalMinorAmount: number,
  participantUserIds: string[]
): ExpenseSplitItem[] {
  if (!participantUserIds.length || totalMinorAmount <= 0) {
    return [];
  }

  const count = participantUserIds.length;
  const baseShare = Math.floor(totalMinorAmount / count);
  let remainder = totalMinorAmount - baseShare * count;

  return participantUserIds.map((userId) => {
    let extra = 0;
    if (remainder > 0) {
      extra = 1;
      remainder -= 1;
    }
    return {
      userId,
      amount: baseShare + extra,
    };
  });
}
