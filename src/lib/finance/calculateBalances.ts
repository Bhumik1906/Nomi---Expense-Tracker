import { FinancialExpense, FinancialSettlement, UserBalance, PairBalance } from './types';

export interface CalculatedBalancesResult {
  userBalances: Record<string, UserBalance>;
  pairBalances: PairBalance[];
  netBalanceForUser: (userId: string) => UserBalance;
  balanceBetween: (userA: string, userB: string) => number; // positive = B owes A, negative = A owes B
}

/**
 * Calculates net balances for all users across expenses and settlements.
 * Also computes pairwise balances between users.
 */
export function calculateBalances(
  expenses: FinancialExpense[],
  settlements: FinancialSettlement[],
  allUserIds: string[] = []
): CalculatedBalancesResult {
  // Map user ID -> { netBalance, totalOwed, totalOwes }
  const userBalancesMap: Record<string, { net: number; owed: number; owes: number }> = {};
  
  // Matrix map userA -> userB -> net balance from userA perspective (positive = B owes A)
  const pairMatrix: Record<string, Record<string, number>> = {};

  const ensureUser = (uId: string) => {
    if (!userBalancesMap[uId]) {
      userBalancesMap[uId] = { net: 0, owed: 0, owes: 0 };
    }
    if (!pairMatrix[uId]) {
      pairMatrix[uId] = {};
    }
  };

  allUserIds.forEach(ensureUser);

  // Helper to record debt: borrower owes lender 'amount'
  const recordDebt = (borrowerId: string, lenderId: string, amount: number) => {
    if (borrowerId === lenderId || amount <= 0) return;
    
    ensureUser(borrowerId);
    ensureUser(lenderId);

    // borrower owes lender
    pairMatrix[borrowerId][lenderId] = (pairMatrix[borrowerId][lenderId] || 0) - amount;
    pairMatrix[lenderId][borrowerId] = (pairMatrix[lenderId][borrowerId] || 0) + amount;
  };

  // 1. Process Expenses
  for (const exp of expenses) {
    ensureUser(exp.paidBy);

    for (const split of exp.splits) {
      ensureUser(split.userId);
      if (split.userId !== exp.paidBy) {
        // split.userId owes exp.paidBy 'split.amount'
        recordDebt(split.userId, exp.paidBy, split.amount);
      }
    }
  }

  // 2. Process Settlements
  for (const set of settlements) {
    ensureUser(set.payerId);
    ensureUser(set.receiverId);

    // Settlement means payer paid receiver. This reduces payer's debt to receiver.
    // Equivalent to receiver owing payer 'set.amount' (or reducing payer debt).
    recordDebt(set.receiverId, set.payerId, set.amount);
  }

  // 3. Compute overall user net, totalOwed, totalOwes from pairwise matrix
  const finalUserBalances: Record<string, UserBalance> = {};
  const processedPairs = new Set<string>();
  const pairBalances: PairBalance[] = [];

  const userList = Object.keys(userBalancesMap);

  for (const uId of userList) {
    let totalOwed = 0;
    let totalOwes = 0;
    let net = 0;

    const row = pairMatrix[uId] || {};
    for (const targetId of Object.keys(row)) {
      const pairNet = row[targetId]; // positive = targetId owes uId, negative = uId owes targetId
      if (pairNet > 0) {
        totalOwed += pairNet;
      } else if (pairNet < 0) {
        totalOwes += Math.abs(pairNet);
      }
      net += pairNet;

      // Add to pairBalances once per unordered pair
      const pairKey = [uId, targetId].sort().join(':');
      if (!processedPairs.has(pairKey) && uId !== targetId && pairNet !== 0) {
        processedPairs.add(pairKey);
        pairBalances.push({
          userA: uId,
          userB: targetId,
          amount: pairNet,
        });
      }
    }

    finalUserBalances[uId] = {
      userId: uId,
      netBalance: net,
      totalOwed,
      totalOwes,
    };
  }

  return {
    userBalances: finalUserBalances,
    pairBalances,
    netBalanceForUser: (userId: string) =>
      finalUserBalances[userId] || { userId, netBalance: 0, totalOwed: 0, totalOwes: 0 },
    balanceBetween: (userA: string, userB: string) => pairMatrix[userA]?.[userB] || 0,
  };
}
