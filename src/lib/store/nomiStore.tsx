'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserProfile, Group, Expense, Settlement, ActivityLog, NotificationItem, ExpenseCategory } from '../types/nomi';
import { Currency, SplitType, UserBalance, PairBalance, SimplifiedDebt } from '../finance/types';
import { calculateBalances } from '../finance/calculateBalances';
import { simplifyDebts } from '../finance/simplifyDebts';
import { computeAndValidateSplit, SplitEngineInput } from '../finance/validateSplit';
import { DEFAULT_USER, INITIAL_USERS, INITIAL_GROUPS, INITIAL_EXPENSES, INITIAL_SETTLEMENTS, INITIAL_ACTIVITY, INITIAL_NOTIFICATIONS } from './sampleData';

interface AddExpenseParams {
  groupId?: string;
  title: string;
  amount: number; // in minor units
  currency?: Currency;
  category: ExpenseCategory;
  paidBy: string;
  splitType: SplitType;
  participantUserIds: string[];
  exactInputs?: { userId: string; amount: number }[];
  percentageInputs?: { userId: string; percentage: number }[];
  shareInputs?: { userId: string; shares: number }[];
  notes?: string;
  date?: string;
}

interface SettleUpParams {
  groupId?: string;
  payerId: string;
  receiverId: string;
  amount: number; // in minor units
  currency?: Currency;
  notes?: string;
}

interface CreateGroupParams {
  name: string;
  description?: string;
  icon?: string;
  currency?: Currency;
  memberUserIds: string[];
}

export interface AppInitialState {
  groups?: Group[];
  expenses?: Expense[];
  settlements?: Settlement[];
  activityLogs?: ActivityLog[];
  notifications?: NotificationItem[];
}

interface NomiContextType {
  currentUser: UserProfile;
  allUsers: Record<string, UserProfile>;
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  isAuthenticated: boolean;
  isLoaded: boolean;
  loginUser: (user: UserProfile, fullState?: AppInitialState) => void;
  logoutUser: () => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ExpenseCategory | 'All';
  setSelectedCategory: (cat: ExpenseCategory | 'All') => void;
  selectedGroupFilter: string | 'All';
  setSelectedGroupFilter: (gId: string | 'All') => void;

  // Financial Engine Derivations
  netBalance: number;
  totalOwed: number;
  totalOwes: number;
  userBalances: Record<string, UserBalance>;
  pairBalances: PairBalance[];
  simplifiedDebts: SimplifiedDebt[];
  getBalanceWithUser: (otherUserId: string) => number; // positive = other owes currentUser

  // Actions
  addExpense: (params: AddExpenseParams) => { success: boolean; error?: string };
  updateExpense: (id: string, params: AddExpenseParams) => { success: boolean; error?: string };
  deleteExpense: (id: string) => void;
  settleUp: (params: SettleUpParams) => { success: boolean; error?: string };
  createGroup: (params: CreateGroupParams) => Group;
  addGroupMember: (groupId: string, userId: string) => void;
  removeGroupMember: (groupId: string, userId: string) => void;
  addFriend: (name: string, email?: string) => UserProfile;
  removeFriend: (friendId: string) => void;
  markNotificationRead: (id: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const NomiContext = createContext<NomiContextType | undefined>(undefined);

const STORAGE_KEY = 'nomi_user_state_v2';

export const NomiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>(INITIAL_USERS);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [settlements, setSettlements] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [isLoaded, setIsLoaded] = useState(false);

  // UX State
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | 'All'>('All');

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated) {
          setIsAuthenticated(true);
          if (parsed.currentUser) setCurrentUser(parsed.currentUser);
          if (parsed.allUsers) setAllUsers(parsed.allUsers);
          if (parsed.groups) setGroups(parsed.groups);
          if (parsed.expenses) setExpenses(parsed.expenses);
          if (parsed.settlements) setSettlements(parsed.settlements);
          if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.currency) setCurrencyState(parsed.currency);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      setIsAuthenticated(false);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to localStorage whenever changed
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        isAuthenticated,
        currentUser,
        allUsers,
        groups,
        expenses,
        settlements,
        activityLogs,
        notifications,
        currency,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [isAuthenticated, currentUser, allUsers, groups, expenses, settlements, activityLogs, notifications, currency, isLoaded]);

  const loginUser = (user: UserProfile, fullState?: AppInitialState) => {
    setCurrentUser(user);
    setAllUsers((prev) => ({ ...prev, [user.id]: user }));
    if (fullState) {
      if (fullState.groups) setGroups(fullState.groups);
      if (fullState.expenses) setExpenses(fullState.expenses);
      if (fullState.settlements) setSettlements(fullState.settlements);
      if (fullState.activityLogs) setActivityLogs(fullState.activityLogs);
      if (fullState.notifications) setNotifications(fullState.notifications);
    }
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
  };

  // Financial Engine Derivations
  const financialCalculation = useMemo(() => {
    const allUserIds = Object.keys(allUsers);
    
    const finExpenses = expenses.map((e) => ({
      id: e.id,
      paidBy: e.paidBy,
      amount: e.amount,
      splitType: e.splitType,
      splits: e.splits.map((s) => ({ userId: s.userId, amount: s.amount })),
    }));

    const finSettlements = settlements.map((s) => ({
      id: s.id,
      payerId: s.payerId,
      receiverId: s.receiverId,
      amount: s.amount,
    }));

    const res = calculateBalances(finExpenses, finSettlements, allUserIds);
    const simplified = simplifyDebts(res.userBalances);

    return { ...res, simplifiedDebts: simplified };
  }, [expenses, settlements, allUsers]);

  const currentUserBalance = financialCalculation.netBalanceForUser(currentUser.id);

  const getBalanceWithUser = (otherUserId: string) => {
    return financialCalculation.balanceBetween(currentUser.id, otherUserId);
  };

  // Log activity helper
  const logActivity = (type: ActivityLog['type'], description: string, groupId?: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      groupId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      type,
      description,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Expense CRUD
  const addExpense = (params: AddExpenseParams) => {
    const splitInput: SplitEngineInput = {
      totalMinorAmount: params.amount,
      splitType: params.splitType,
      participantUserIds: params.participantUserIds,
      exactInputs: params.exactInputs,
      percentageInputs: params.percentageInputs,
      shareInputs: params.shareInputs,
    };

    const computed = computeAndValidateSplit(splitInput);

    if (!computed.isValid || !computed.splits.length) {
      return { success: false, error: computed.error || 'Invalid split parameters.' };
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      groupId: params.groupId,
      title: params.title,
      amount: params.amount,
      currency: params.currency || currency,
      category: params.category,
      paidBy: params.paidBy,
      splitType: params.splitType,
      notes: params.notes,
      date: params.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      splits: computed.splits,
    };

    // Auto-register any participant not yet in allUsers as a friend
    setAllUsers((prev) => {
      const updated = { ...prev };
      params.participantUserIds.forEach((uId) => {
        if (!updated[uId]) {
          // Unknown participant ID — shouldn't happen in normal flow
          return;
        }
      });
      return updated;
    });

    setExpenses((prev) => [newExpense, ...prev]);
    logActivity('expense_added', `added "${params.title}"`, params.groupId);

    return { success: true };
  };

  const updateExpense = (id: string, params: AddExpenseParams) => {
    const splitInput: SplitEngineInput = {
      totalMinorAmount: params.amount,
      splitType: params.splitType,
      participantUserIds: params.participantUserIds,
      exactInputs: params.exactInputs,
      percentageInputs: params.percentageInputs,
      shareInputs: params.shareInputs,
    };

    const computed = computeAndValidateSplit(splitInput);

    if (!computed.isValid || !computed.splits.length) {
      return { success: false, error: computed.error || 'Invalid split parameters.' };
    }

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              groupId: params.groupId,
              title: params.title,
              amount: params.amount,
              currency: params.currency || e.currency,
              category: params.category,
              paidBy: params.paidBy,
              splitType: params.splitType,
              notes: params.notes,
              date: params.date || e.date,
              splits: computed.splits,
            }
          : e
      )
    );

    logActivity('expense_edited', `updated "${params.title}"`, params.groupId);
    return { success: true };
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (target) {
      logActivity('expense_deleted', `deleted expense "${target.title}"`, target.groupId);
    }
  };

  // Settlement Flow
  const settleUp = (params: SettleUpParams) => {
    if (params.amount <= 0) {
      return { success: false, error: 'Settlement amount must be greater than 0.' };
    }

    const payer = allUsers[params.payerId]?.name || 'Someone';
    const receiver = allUsers[params.receiverId]?.name || 'Someone';

    const newSettlement: Settlement = {
      id: `set-${Date.now()}`,
      groupId: params.groupId,
      payerId: params.payerId,
      receiverId: params.receiverId,
      amount: params.amount,
      currency: params.currency || currency,
      date: new Date().toISOString().split('T')[0],
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    logActivity(
      'settlement_created',
      `settled money with ${params.payerId === currentUser.id ? receiver : payer}`,
      params.groupId
    );

    // Push notification to receiver if user is receiver
    if (params.receiverId !== currentUser.id) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: params.receiverId,
        actorId: currentUser.id,
        type: 'settlement_received',
        title: 'Settlement Received 💰',
        message: `${currentUser.name} settled money with you.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return { success: true };
  };

  // Group Management
  const createGroup = (params: CreateGroupParams): Group => {
    const gId = `g-${Date.now()}`;
    const membersList = Array.from(new Set([currentUser.id, ...params.memberUserIds])).map((uId) => ({
      id: `gm-${gId}-${uId}`,
      groupId: gId,
      userId: uId,
      userProfile: allUsers[uId] || {
        id: uId,
        name: 'Member',
        email: 'member@nomi.app',
        preferred_currency: 'INR',
        theme: 'system',
        created_at: new Date().toISOString(),
      },
      role: (uId === currentUser.id ? 'admin' : 'member') as 'admin' | 'member',
      joinedAt: new Date().toISOString(),
    }));

    const newGroup: Group = {
      id: gId,
      name: params.name,
      description: params.description,
      icon: params.icon || 'users',
      currency: params.currency || currency,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      members: membersList,
    };

    setGroups((prev) => [newGroup, ...prev]);
    logActivity('member_added', `created group "${params.name}"`, gId);

    return newGroup;
  };

  const addGroupMember = (groupId: string, userId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.members.some((m) => m.userId === userId)) return g;

        const newMember = {
          id: `gm-${groupId}-${userId}`,
          groupId,
          userId,
          userProfile: allUsers[userId],
          role: 'member' as const,
          joinedAt: new Date().toISOString(),
        };

        return { ...g, members: [...g.members, newMember] };
      })
    );

    const userName = allUsers[userId]?.name || 'Member';
    logActivity('member_added', `added ${userName} to group`, groupId);
  };

  const removeGroupMember = (groupId: string, userId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, members: g.members.filter((m) => m.userId !== userId) };
      })
    );

    const userName = allUsers[userId]?.name || 'Member';
    logActivity('member_removed', `removed ${userName} from group`, groupId);
  };

  // Friends Management
  const addFriend = (name: string, email?: string): UserProfile => {
    const fId = `u-friend-${Date.now()}`;
    const newFriendProfile: UserProfile = {
      id: fId,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}.nomi@local`,
      avatar_url: null,
      preferred_currency: currency,
      theme: 'light',
      created_at: new Date().toISOString(),
    };

    setAllUsers((prev) => ({ ...prev, [fId]: newFriendProfile }));
    return newFriendProfile;
  };

  const removeFriend = (friendId: string) => {
    setAllUsers((prev) => {
      const next = { ...prev };
      delete next[friendId];
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    setAllUsers((prev) => ({
      ...prev,
      [currentUser.id]: { ...prev[currentUser.id], ...updates },
    }));
  };

  return (
    <NomiContext.Provider
      value={{
        currentUser,
        allUsers,
        groups,
        expenses,
        settlements,
        activityLogs,
        notifications,
        currency,
        setCurrency,
        isAuthenticated,
        isLoaded,
        loginUser,
        logoutUser,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedGroupFilter,
        setSelectedGroupFilter,
        netBalance: currentUserBalance.netBalance,
        totalOwed: currentUserBalance.totalOwed,
        totalOwes: currentUserBalance.totalOwes,
        userBalances: financialCalculation.userBalances,
        pairBalances: financialCalculation.pairBalances,
        simplifiedDebts: financialCalculation.simplifiedDebts,
        getBalanceWithUser,
        addExpense,
        updateExpense,
        deleteExpense,
        settleUp,
        createGroup,
        addGroupMember,
        removeGroupMember,
        addFriend,
        removeFriend,
        markNotificationRead,
        updateUserProfile,
      }}
    >
      {children}
    </NomiContext.Provider>
  );
};

export const useNomi = () => {
  const context = useContext(NomiContext);
  if (!context) {
    throw new Error('useNomi must be used within a NomiProvider');
  }
  return context;
};
