import { SimplifiedDebt, UserBalance } from './types';

/**
 * Simplifies multi-party debts using the Minimum Cash Flow algorithm.
 * Preserves exact net balances while minimizing total number of settlement transactions.
 * Operates deterministically in minor integer units.
 */
export function simplifyDebts(userBalances: Record<string, UserBalance>): SimplifiedDebt[] {
  // Extract net balance for each user
  const netBalances: { userId: string; net: number }[] = Object.values(userBalances)
    .map((b) => ({ userId: b.userId, net: b.netBalance }))
    .filter((b) => b.net !== 0);

  const debtors: { userId: string; debt: number }[] = [];
  const creditors: { userId: string; credit: number }[] = [];

  for (const b of netBalances) {
    if (b.net < 0) {
      debtors.push({ userId: b.userId, debt: Math.abs(b.net) });
    } else if (b.net > 0) {
      creditors.push({ userId: b.userId, credit: b.net });
    }
  }

  // Sort deterministically to maintain reproducible output
  debtors.sort((a, b) => b.debt - a.debt || a.userId.localeCompare(b.userId));
  creditors.sort((a, b) => b.credit - a.credit || a.userId.localeCompare(b.userId));

  const simplified: SimplifiedDebt[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.debt, creditor.credit);

    if (amount > 0) {
      simplified.push({
        payerId: debtor.userId,
        receiverId: creditor.userId,
        amount,
      });

      debtor.debt -= amount;
      creditor.credit -= amount;
    }

    if (debtor.debt === 0) {
      dIdx++;
    }
    if (creditor.credit === 0) {
      cIdx++;
    }
  }

  return simplified;
}
