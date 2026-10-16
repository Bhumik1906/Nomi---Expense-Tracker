'use client';

import React, { useState, useEffect } from 'react';
import { useNomi } from '@/lib/store/nomiStore';
import { toMinorUnits, toMajorUnits, getCurrencySymbol } from '@/lib/finance/money';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPayerId?: string;
  defaultReceiverId?: string;
  defaultAmountMinor?: number;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  defaultPayerId,
  defaultReceiverId,
  defaultAmountMinor,
}) => {
  const { currentUser, allUsers, settleUp, currency } = useNomi();

  const [payerId, setPayerId] = useState<string>(defaultPayerId || currentUser.id);
  const [receiverId, setReceiverId] = useState<string>(defaultReceiverId || '');
  const [amountStr, setAmountStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultPayerId) setPayerId(defaultPayerId);
    if (defaultReceiverId) setReceiverId(defaultReceiverId);
    if (defaultAmountMinor && defaultAmountMinor > 0) {
      setAmountStr(toMajorUnits(defaultAmountMinor, currency).toString());
    }
  }, [defaultPayerId, defaultReceiverId, defaultAmountMinor, currency, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const minorAmt = toMinorUnits(amountStr, currency);
    if (minorAmt <= 0) {
      setError('Please enter a valid settlement amount greater than 0.');
      return;
    }

    if (!receiverId || payerId === receiverId) {
      setError('Please select a valid person to settle with.');
      return;
    }

    const res = settleUp({
      payerId,
      receiverId,
      amount: minorAmt,
      currency,
      notes,
    });

    if (!res.success) {
      setError(res.error || 'Failed to complete settlement.');
    } else {
      // Trigger subtle lavender confetti celebration
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7C5CFC', '#9A82FF', '#20A77A', '#EEE9FF'],
        });
      } catch {
        // Fallback if canvas is unavailable
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  const otherUsers = Object.values(allUsers).filter((u) => u.id !== payerId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-nomi-surface border border-nomi rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-nomi flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-nomi-positive" />
              <h3 className="font-poppins font-bold text-lg text-nomi-main">Settle Up</h3>
            </div>
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

            {/* Payer -> Receiver Selector */}
            <div className="p-4 rounded-2xl bg-nomi-bg border border-nomi space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="w-1/2">
                  <label className="block text-[11px] font-semibold text-nomi-secondary uppercase tracking-wider mb-1">
                    Payer
                  </label>
                  <select
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    className="w-full p-2 text-xs font-bold rounded-lg border border-nomi bg-nomi-surface text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                  >
                    {Object.values(allUsers).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.id === currentUser.id ? 'You' : u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <ArrowRight className="w-4 h-4 text-nomi-secondary mt-5 shrink-0" />

                <div className="w-1/2">
                  <label className="block text-[11px] font-semibold text-nomi-secondary uppercase tracking-wider mb-1">
                    Receiver
                  </label>
                  <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-full p-2 text-xs font-bold rounded-lg border border-nomi bg-nomi-surface text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                  >
                    <option value="">Select receiver...</option>
                    {otherUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.id === currentUser.id ? 'You' : u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Settlement Amount */}
            <div>
              <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                Settlement Amount ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-4 py-3 text-xl font-poppins font-bold rounded-xl bg-nomi-bg border border-nomi text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                required
              />
              <p className="text-[11px] text-nomi-secondary mt-1">
                Supports full and partial settlements.
              </p>
            </div>

            {/* Payment Note / Method */}
            <div>
              <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                Payment Note / Method
              </label>
              <input
                type="text"
                placeholder="e.g. UPI, GPay, Cash, Bank Transfer"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-nomi-bg border border-nomi text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
              />
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
                className="px-6 py-2.5 rounded-xl bg-[#20A77A] hover:bg-[#1C966E] dark:bg-[#39B88A] text-white text-sm font-poppins font-semibold shadow-md shadow-[#20A77A]/25 transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Settlement</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
