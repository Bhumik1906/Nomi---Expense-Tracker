import { UserProfile, Group, Expense, Settlement, ActivityLog, NotificationItem } from '../types/nomi';

export const DEFAULT_USER: UserProfile = {
  id: 'u-user',
  name: 'Bhumik',
  email: 'bhumik@nomi.app',
  avatar_url: null,
  preferred_currency: 'INR',
  theme: 'system',
  created_at: new Date().toISOString(),
};

export const INITIAL_USERS: Record<string, UserProfile> = {
  [DEFAULT_USER.id]: DEFAULT_USER,
};

export const INITIAL_GROUPS: Group[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_SETTLEMENTS: Settlement[] = [];
export const INITIAL_ACTIVITY: ActivityLog[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
