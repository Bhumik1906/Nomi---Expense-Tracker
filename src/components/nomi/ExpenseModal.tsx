'use client';

import React, { useState, useEffect } from 'react';
import { useNomi } from '@/lib/store/nomiStore';
import { ExpenseCategory } from '@/lib/types/nomi';
import { SplitType, Currency } from '@/lib/finance/types';
import { toMinorUnits, toMajorUnits, getCurrencySymbol } from '@/lib/finance/money';
import { X, Check, Utensils, Plane, ShoppingBag, Film, FileText, Bus, Building2, HelpCircle, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editExpenseId?: string;
  defaultGroupId?: string;
  defaultParticipantIds?: string[];
}

const CATEGORIES: { name: ExpenseCategory; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Food', icon: Utensils },
  { name: 'Travel', icon: Plane },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Entertainment', icon: Film },
  { name: 'Bills', icon: FileText },
  { name: 'Transport', icon: Bus },
  { name: 'Accommodation', icon: Building2 },
  { name: 'General', icon: HelpCircle },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  editExpenseId,
  defaultGroupId,
  defaultParticipantIds,
}) => {
  const {
    currentUser,
    allUsers,
    groups,
    expenses,
    addExpense,
    updateExpense,
    addFriend,
    currency: defaultCurrency,
  } = useNomi();

  const editTarget = editExpenseId ? expenses.find((e) => e.id === editExpenseId) : null;

  // Form States
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [paidBy, setPaidBy] = useState<string>(currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  // Selected Participants (IDs of existing users)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([currentUser.id]);

  // Inline "add new person" state
  const [newPersonName, setNewPersonName] = useState('');
  const [showAddPerson, setShowAddPerson] = useState(false);

  // Split-specific inputs
  const [exactInputs, setExactInputs] = useState<Record<string, string>>({});
  const [pctInputs, setPctInputs] = useState<Record<string, string>>({});
  const [shareInputs, setShareInputs] = useState<Record<string, string>>({});

  // Reset or Populate Form
  useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title);
      setAmountStr(toMajorUnits(editTarget.amount, editTarget.currency).toString());
      setCurrency(editTarget.currency);
      setCategory(editTarget.category);
      setGroupId(editTarget.groupId);
      setPaidBy(editTarget.paidBy);
      setSplitType(editTarget.splitType);
      setNotes(editTarget.notes || '');
      setDate(editTarget.date);
      setSelectedParticipants(editTarget.splits.map((s) => s.userId));

      if (editTarget.splitType === 'exact') {
        const mapping: Record<string, string> = {};
        editTarget.splits.forEach((s) => {
          mapping[s.userId] = toMajorUnits(s.amount, editTarget.currency).toString();
        });
        setExactInputs(mapping);
      } else if (editTarget.splitType === 'percentage') {
        const mapping: Record<string, string> = {};
        editTarget.splits.forEach((s) => {
          mapping[s.userId] = s.splitValue?.toString() || '0';
        });
        setPctInputs(mapping);
      } else if (editTarget.splitType === 'shares') {
        const mapping: Record<string, string> = {};
        editTarget.splits.forEach((s) => {
          mapping[s.userId] = s.splitValue?.toString() || '1';
        });
        setShareInputs(mapping);
      }
    } else {
      // New expense — initialize with provided defaults or defaults
      setTitle('');
      setAmountStr('');
      setCategory('Food');
      setGroupId(defaultGroupId || undefined);
      setPaidBy(currentUser.id);
      setSplitType('equal');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setError(null);
      setExactInputs({});
      setPctInputs({});
      setShareInputs({});
      setSelectedParticipants(
        defaultParticipantIds && defaultParticipantIds.length > 0
          ? Array.from(new Set([currentUser.id, ...defaultParticipantIds]))
          : [currentUser.id]
      );
      setNewPersonName('');
      setShowAddPerson(false);
    }
  }, [editTarget, isOpen, currentUser.id, defaultGroupId, defaultParticipantIds]);

  // When group changes, sync available participants
  const handleGroupChange = (gId: string) => {
    setGroupId(gId === 'none' ? undefined : gId);
    if (gId !== 'none') {
      const g = groups.find((group) => group.id === gId);
      if (g) {
        setSelectedParticipants(g.members.map((m) => m.userId));
      }
    } else {
      // Switched back to "no group" — reset to just current user
      setSelectedParticipants([currentUser.id]);
    }
  };

  const toggleParticipant = (uId: string) => {
    if (selectedParticipants.includes(uId)) {
      if (selectedParticipants.length <= 1) return; // Must have at least 1
      setSelectedParticipants(selectedParticipants.filter((id) => id !== uId));
    } else {
      setSelectedParticipants([...selectedParticipants, uId]);
    }
  };

  // Add a brand-new person inline — creates them as a friend and selects them
  const handleAddNewPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    const newFriend = addFriend(name);
    setSelectedParticipants((prev) => [...prev, newFriend.id]);
    setNewPersonName('');
    setShowAddPerson(false);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const minorAmt = toMinorUnits(amountStr, currency);
    if (minorAmt <= 0) {
      setError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for the expense.');
      return;
    }

    let exactList;
    let pctList;
    let shareList;

    if (splitType === 'exact') {
      exactList = selectedParticipants.map((uId) => ({
        userId: uId,
        amount: toMinorUnits(exactInputs[uId] || '0', currency),
      }));
    } else if (splitType === 'percentage') {
      pctList = selectedParticipants.map((uId) => ({
        userId: uId,
        percentage: parseFloat(pctInputs[uId] || '0'),
      }));
    } else if (splitType === 'shares') {
      shareList = selectedParticipants.map((uId) => ({
        userId: uId,
        shares: parseFloat(shareInputs[uId] || '1'),
      }));
    }

    const payload = {
      groupId,
      title: title.trim(),
      amount: minorAmt,
      currency,
      category,
      paidBy,
      splitType,
      participantUserIds: selectedParticipants,
      exactInputs: exactList,
      percentageInputs: pctList,
      shareInputs: shareList,
      notes: notes.trim(),
      date,
    };

    const res = editTarget
      ? updateExpense(editTarget.id, payload)
      : addExpense(payload);

    if (!res.success) {
      setError(res.error || 'Failed to save expense.');
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const availableUsers = groupId
    ? (groups.find((g) => g.id === groupId)?.members
        .map((m) => allUsers[m.userId])
        .filter((u): u is NonNullable<typeof u> => u != null) || [])
    : Object.values(allUsers);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-nomi-surface border border-nomi rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-nomi flex items-center justify-between">
            <h3 className="font-poppins font-bold text-lg text-nomi-main">
              {editTarget ? 'Edit Expense' : 'Add an Expense'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-nomi-secondary hover:text-nomi-main hover:bg-nomi-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-nomi-negative-soft text-nomi-negative text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-[#7C5CFC] bg-nomi-primary-soft text-nomi-primary font-bold shadow-sm'
                          : 'border-nomi bg-nomi-bg text-nomi-secondary hover:text-nomi-main'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Amount Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Expense Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner, Rent, Uber"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm font-medium text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Amount ({getCurrencySymbol(currency)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm font-bold text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                  required
                />
              </div>
            </div>

            {/* Group & Paid By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Group (Optional)
                </label>
                <select
                  value={groupId || 'none'}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm font-medium text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                >
                  <option value="none">No group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Paid By
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm font-medium text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                >
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id === currentUser.id ? 'You' : u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-2">
                Split Method
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-nomi-bg border border-nomi text-xs font-medium">
                {(['equal', 'exact', 'percentage', 'shares'] as SplitType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`py-2 rounded-lg capitalize transition-all ${
                      splitType === type
                        ? 'bg-nomi-surface text-nomi-primary font-bold shadow-sm'
                        : 'text-nomi-secondary hover:text-nomi-main'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-nomi-secondary uppercase tracking-wider">
                  Split Between ({selectedParticipants.length} {selectedParticipants.length === 1 ? 'person' : 'people'})
                </label>
                {!showAddPerson && (
                  <button
                    type="button"
                    onClick={() => setShowAddPerson(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-nomi-primary hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add person</span>
                  </button>
                )}
              </div>

              {/* Inline add person input */}
              {showAddPerson && (
                <div className="flex items-center gap-2 mb-2 p-2.5 rounded-xl border border-[#7C5CFC]/50 bg-nomi-primary-soft/20">
                  <input
                    type="text"
                    placeholder="Name (e.g. Priya)"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewPerson())}
                    autoFocus
                    className="flex-1 px-2 py-1 text-xs rounded-lg border border-nomi bg-nomi-surface text-nomi-main focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewPerson}
                    disabled={!newPersonName.trim()}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-[#7C5CFC] text-white disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddPerson(false); setNewPersonName(''); }}
                    className="p-1 text-nomi-secondary hover:text-nomi-main"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableUsers.map((u) => {
                  const isChecked = selectedParticipants.includes(u.id);
                  const initials = u.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
                  const colors = [['#EDE9FE','#7C5CFC'],['#E0F2FE','#0284C7'],['#FCE7F3','#DB2777'],['#D1FAE5','#059669'],['#FEF3C7','#D97706'],['#FEE2E2','#DC2626']];
                  const [bg, txt] = colors[u.name.charCodeAt(0) % colors.length];

                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleParticipant(u.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-sm transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#7C5CFC]/40 bg-nomi-primary-soft/30'
                          : 'border-nomi bg-nomi-bg opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                          style={{ backgroundColor: bg, color: txt }}
                        >
                          {initials}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-[#7C5CFC] border-[#7C5CFC] text-white'
                              : 'border-nomi bg-nomi-surface'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <span className="font-medium text-nomi-main">
                          {u.id === currentUser.id ? 'You' : u.name}
                        </span>
                      </div>

                      {/* Render Split Type inputs */}
                      {isChecked && (
                        <div>
                          {splitType === 'exact' && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-nomi-secondary">{getCurrencySymbol(currency)}</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={exactInputs[u.id] || ''}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setExactInputs({ ...exactInputs, [u.id]: e.target.value })}
                                className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-nomi bg-nomi-surface text-nomi-main"
                              />
                            </div>
                          )}

                          {splitType === 'percentage' && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="%"
                                value={pctInputs[u.id] || ''}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setPctInputs({ ...pctInputs, [u.id]: e.target.value })}
                                className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-nomi bg-nomi-surface text-nomi-main"
                              />
                              <span className="text-xs text-nomi-secondary">%</span>
                            </div>
                          )}

                          {splitType === 'shares' && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="1"
                                placeholder="1"
                                value={shareInputs[u.id] || '1'}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setShareInputs({ ...shareInputs, [u.id]: e.target.value })}
                                className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-nomi bg-nomi-surface text-nomi-main"
                              />
                              <span className="text-xs text-nomi-secondary">shares</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {availableUsers.length === 1 && (
                <p className="text-[11px] text-nomi-secondary mt-1.5 text-center">
                  Only you so far — tap <strong>Add person</strong> above to split with others.
                </p>
              )}
            </div>

            {/* Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-nomi-bg border border-nomi text-xs font-medium text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-nomi-bg border border-nomi text-xs font-medium text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-nomi flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-nomi text-nomi-secondary text-sm font-semibold hover:bg-nomi-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white text-sm font-poppins font-semibold shadow-md shadow-[#7C5CFC]/25 transition-all active:scale-95"
              >
                {editTarget ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
