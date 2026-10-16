export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
};

export interface ExpenseSplitItem {
  userId: string;
  amount: number; // in minor units (paise/cents)
  splitValue?: number; // percentage, shares count, exact amount
}

export interface UserBalance {
  userId: string;
  netBalance: number; // in minor units (positive = owed to user, negative = user owes)
  totalOwed: number;  // amount owed to user
  totalOwes: number;  // amount user owes
}

export interface PairBalance {
  userA: string;
  userB: string;
  amount: number; // net balance from userA perspective (positive = B owes A, negative = A owes B)
}

export interface SimplifiedDebt {
  payerId: string;
  receiverId: string;
  amount: number; // in minor units
}

export interface FinancialExpense {
  id: string;
  paidBy: string;
  amount: number; // in minor units
  splitType: SplitType;
  splits: ExpenseSplitItem[];
}

export interface FinancialSettlement {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number; // in minor units
}
