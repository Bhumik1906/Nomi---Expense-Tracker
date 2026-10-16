import { Currency, SplitType } from '../finance/types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  preferred_currency: Currency;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendProfile: UserProfile;
  created_at: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  userProfile: UserProfile;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  icon: string;
  currency: Currency;
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
}

export interface ExpenseSplit {
  id?: string;
  expenseId?: string;
  userId: string;
  amount: number; // minor units
  splitValue?: number; // percentage, shares count, exact amount
}

export interface Expense {
  id: string;
  groupId?: string;
  title: string;
  amount: number; // minor units
  currency: Currency;
  category: ExpenseCategory;
  paidBy: string;
  splitType: SplitType;
  notes?: string;
  date: string;
  createdAt: string;
  splits: ExpenseSplit[];
}

export interface Settlement {
  id: string;
  groupId?: string;
  payerId: string;
  receiverId: string;
  amount: number; // minor units
  currency: Currency;
  date: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Transport'
  | 'Accommodation'
  | 'General';

export interface ActivityLog {
  id: string;
  groupId?: string;
  actorId: string;
  actorName: string;
  type: 'expense_added' | 'expense_edited' | 'expense_deleted' | 'settlement_created' | 'member_added' | 'member_removed';
  description: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  actorId?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
