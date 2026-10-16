import { toMinorUnits, toMajorUnits, formatMoney } from '../money';
import { splitEqual } from '../splitEqual';
import { splitExact } from '../splitExact';
import { splitPercentage } from '../splitPercentage';
import { splitShares } from '../splitShares';
import { calculateBalances } from '../calculateBalances';
import { simplifyDebts } from '../simplifyDebts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

export function runFinancialTests() {
  console.log('🧪 Starting Financial Engine Tests...');

  // 1. Money Conversions
  assert(toMinorUnits(100.5) === 10050, 'toMinorUnits(100.50) should be 10050');
  assert(toMinorUnits('45.99') === 4599, 'toMinorUnits("45.99") should be 4599');
  assert(toMajorUnits(10050) === 100.5, 'toMajorUnits(10050) should be 100.50');
  assert(formatMoney(10050, 'INR') === '₹100.50', 'formatMoney should format INR correctly');
  assert(formatMoney(-5000, 'USD') === '-$50.00', 'formatMoney should handle negative USD correctly');

  // 2. Equal Splits & Uneven Remainder
  const equalSplits = splitEqual(10000, ['user1', 'user2', 'user3']);
  const sumEqual = equalSplits.reduce((acc, s) => acc + s.amount, 0);
  assert(sumEqual === 10000, 'Sum of equal splits must equal 10000 paise (₹100)');
  assert(equalSplits[0].amount === 3334, 'First person gets remainder 1 paise extra (3334)');
  assert(equalSplits[1].amount === 3333, 'Second person gets 3333');
  assert(equalSplits[2].amount === 3333, 'Third person gets 3333');

  // 3. Exact Splits & Invalid Exact
  const validExact = splitExact(10000, [
    { userId: 'u1', amount: 4000 },
    { userId: 'u2', amount: 3500 },
    { userId: 'u3', amount: 2500 },
  ]);
  assert(validExact.isValid === true, 'Valid exact split should pass');

  const invalidExact = splitExact(10000, [
    { userId: 'u1', amount: 4000 },
    { userId: 'u2', amount: 3000 },
  ]);
  assert(invalidExact.isValid === false, 'Invalid exact split sum should fail');

  // 4. Percentage Splits & Rounding
  const pctSplits = splitPercentage(10000, [
    { userId: 'u1', percentage: 33.33 },
    { userId: 'u2', percentage: 33.33 },
    { userId: 'u3', percentage: 33.34 },
  ]);
  assert(pctSplits.isValid === true, 'Percentage split totalling 100% should pass');
  const sumPct = pctSplits.splits.reduce((acc, s) => acc + s.amount, 0);
  assert(sumPct === 10000, 'Sum of percentage splits must equal 10000');

  // 5. Share Splits
  const shareSplits = splitShares(10000, [
    { userId: 'u1', shares: 2 },
    { userId: 'u2', shares: 1 },
    { userId: 'u3', shares: 1 },
  ]);
  assert(shareSplits.isValid === true, 'Share split should be valid');
  assert(shareSplits.splits[0].amount === 5000, 'u1 gets 50% (5000)');
  assert(shareSplits.splits[1].amount === 2500, 'u2 gets 25% (2500)');
  assert(shareSplits.splits[2].amount === 2500, 'u3 gets 25% (2500)');

  // 6. Balance Calculation & Partial Settlement
  const expenses = [
    {
      id: 'e1',
      paidBy: 'alice',
      amount: 3000, // ₹30.00
      splitType: 'equal' as const,
      splits: [
        { userId: 'alice', amount: 1000 },
        { userId: 'bob', amount: 1000 },
        { userId: 'charlie', amount: 1000 },
      ],
    },
  ];

  const settlements = [
    {
      id: 's1',
      payerId: 'bob',
      receiverId: 'alice',
      amount: 400, // partial settlement of ₹4.00 out of ₹10.00 owed
    },
  ];

  const balances = calculateBalances(expenses, settlements, ['alice', 'bob', 'charlie']);
  assert(balances.netBalanceForUser('alice').netBalance === 1600, 'Alice net balance should be +1600 (+2000 - 400)');
  assert(balances.netBalanceForUser('bob').netBalance === -600, 'Bob net balance should be -600 (-1000 + 400)');
  assert(balances.netBalanceForUser('charlie').netBalance === -1000, 'Charlie net balance should be -1000');

  // 7. Debt Simplification (A owes B 500, B owes C 500 -> A owes C 500)
  const simplifyTestMap = {
    userA: { userId: 'userA', netBalance: -5000, totalOwed: 0, totalOwes: 5000 },
    userB: { userId: 'userB', netBalance: 0, totalOwed: 5000, totalOwes: 5000 },
    userC: { userId: 'userC', netBalance: 5000, totalOwed: 5000, totalOwes: 0 },
  };

  const simplified = simplifyDebts(simplifyTestMap);
  assert(simplified.length === 1, 'Debt simplification should yield exactly 1 transaction');
  assert(simplified[0].payerId === 'userA', 'Payer should be userA');
  assert(simplified[0].receiverId === 'userC', 'Receiver should be userC');
  assert(simplified[0].amount === 5000, 'Amount should be 5000');

  console.log('✅ ALL FINANCIAL ENGINE TESTS PASSED SUCCESSFULLY!');
}

if (require.main === module) {
  runFinancialTests();
}
