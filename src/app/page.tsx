'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NomiLogo } from '@/components/nomi/NomiLogo';
import { NomiOrbit } from '@/components/nomi/NomiOrbit';
import { MouseTrailEffect } from '@/components/nomi/MouseTrailEffect';
import { Footer } from '@/components/nomi/Footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calculator,
  Sliders,
  TrendingUp,
  Download,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNomi } from '@/lib/store/nomiStore';

export default function LandingPage() {
  const { isAuthenticated } = useNomi();
  const [demoAmount, setDemoAmount] = useState<number>(120);
  const [demoSplitType, setDemoSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const getDemoSplitResults = () => {
    if (demoSplitType === 'equal') {
      return [
        { name: 'You', share: `$${(demoAmount / 3).toFixed(2)}` },
        { name: 'Rahul', share: `$${(demoAmount / 3).toFixed(2)}` },
        { name: 'Priya', share: `$${(demoAmount / 3).toFixed(2)}` },
      ];
    } else if (demoSplitType === 'exact') {
      return [
        { name: 'You', share: `$${(demoAmount * 0.5).toFixed(2)} (50%)` },
        { name: 'Rahul', share: `$${(demoAmount * 0.3).toFixed(2)} (30%)` },
        { name: 'Priya', share: `$${(demoAmount * 0.2).toFixed(2)} (20%)` },
      ];
    } else if (demoSplitType === 'percentage') {
      return [
        { name: 'You', share: `$${(demoAmount * 0.4).toFixed(2)} (40%)` },
        { name: 'Rahul', share: `$${(demoAmount * 0.4).toFixed(2)} (40%)` },
        { name: 'Priya', share: `$${(demoAmount * 0.2).toFixed(2)} (20%)` },
      ];
    } else {
      return [
        { name: 'You (2 shares)', share: `$${(demoAmount * 0.5).toFixed(2)}` },
        { name: 'Rahul (1 share)', share: `$${(demoAmount * 0.25).toFixed(2)}` },
        { name: 'Priya (1 share)', share: `$${(demoAmount * 0.25).toFixed(2)}` },
      ];
    }
  };

  const faqs = [
    {
      q: 'How does Nomi handle uneven splits and rounding?',
      a: 'Nomi converts all amounts into exact minor units (cents/paise). If an expense cannot be divided evenly (like $100 divided by 3 people), Nomi automatically allocates the odd cent so the total matches down to the exact penny.',
    },
    {
      q: 'How does debt simplification work?',
      a: 'If Alex owes Rahul $50 and Rahul owes Priya $50, Nomi calculates that Alex can pay Priya $50 directly. Everyone settles up faster with fewer transfers.',
    },
    {
      q: 'Do I need to connect my bank or credit card?',
      a: 'No! Nomi keeps track of who owes what. You settle payments however you like — via UPI, cash, Venmo, or bank transfer — and mark them settled in Nomi.',
    },
    {
      q: 'Can I export expenses to CSV or Excel?',
      a: 'Yes, you can export group or personal expense records to CSV at any time with one click.',
    },
    {
      q: 'Is Nomi completely free?',
      a: 'Yes, Nomi is 100% free for creating groups, adding friends, splitting bills, and exporting records.',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-nomi-bg text-nomi-main selection:bg-[#7C5CFC]/20 overflow-hidden">
      {/* Sleek Subtle Mouse Follower Ring */}
      <MouseTrailEffect />

      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C5CFC]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-[#9A82FF]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#7C5CFC]/8 blur-3xl" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-nomi-surface/80 backdrop-blur-md border-b border-nomi transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <NomiLogo size="md" />

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-nomi-secondary hover:text-nomi-main transition-colors px-3 py-2 hover:bg-nomi-bg rounded-xl"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white font-poppins font-semibold text-xs sm:text-sm shadow-md shadow-[#7C5CFC]/25 transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-[#7C5CFC]/40"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-xl text-center md:text-left z-10"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C5CFC]/10 border border-[#7C5CFC]/20 text-[#7C5CFC] dark:text-[#9A82FF] text-xs font-semibold mb-6 shadow-sm cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Expense Sharing Made Simple</span>
          </motion.div>

          <h1 className="font-poppins font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-nomi-main leading-tight">
            Money between friends, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#7C5CFC] via-[#9A82FF] to-pink-500 bg-clip-text text-transparent">
              without the awkwardness.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-nomi-secondary leading-relaxed">
            Split trips, dinners, and monthly rent with friends. Equal, exact, percentage, or share-based splits — calculated down to the cent.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white font-poppins font-bold text-base shadow-xl shadow-[#7C5CFC]/30 transition-all hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-[#7C5CFC]/50"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-nomi bg-nomi-surface text-nomi-main font-poppins font-semibold text-base hover:bg-nomi-bg transition-all hover:scale-105 hover:border-[#7C5CFC]/40"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-nomi-secondary">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-nomi-positive" />
              <span>Exact Cent Splits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-nomi-positive" />
              <span>Smart Debt Simplification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-nomi-positive" />
              <span>One-Click CSV Export</span>
            </div>
          </div>
        </motion.div>

        {/* Orbit Visual Signature */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative shrink-0 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[#7C5CFC]/10 rounded-full blur-2xl transform scale-90 animate-pulse" />
          <NomiOrbit size="hero" />
        </motion.div>
      </section>

      {/* Metrics Bar with Scroll Animation */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="py-8 bg-nomi-surface/50 border-y border-nomi/60 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '100%', label: 'Cent Accuracy', color: 'text-[#7C5CFC] dark:text-[#9A82FF]' },
            { value: '4 Ways', label: 'To Split Bills', color: 'text-emerald-500' },
            { value: 'Multi', label: 'Currency Support', color: 'text-sky-500' },
            { value: 'Instant', label: 'Simplified Repayments', color: 'text-pink-500' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="p-4 rounded-2xl bg-nomi-surface border border-nomi shadow-sm hover:border-[#7C5CFC]/30 transition-all cursor-default"
            >
              <h3 className={`font-poppins font-bold text-2xl ${item.color}`}>{item.value}</h3>
              <p className="text-xs text-nomi-secondary mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Interactive Split Preview with Scroll Animation */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="py-20 bg-nomi-surface/70 border-b border-nomi"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] dark:text-[#9A82FF] text-xs font-semibold mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Split Preview</span>
            </div>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-nomi-main">
              See how Nomi splits expenses
            </h2>
            <p className="text-xs sm:text-sm text-nomi-secondary mt-2">
              Type an amount and select a split method to see instant share calculations.
            </p>
          </div>

          <div className="p-6 sm:p-10 rounded-3xl bg-nomi-bg border border-nomi shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-nomi-secondary uppercase tracking-wider mb-2">
                  Total Expense Amount ($)
                </label>
                <input
                  type="number"
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(Number(e.target.value))}
                  className="w-full px-5 py-3.5 text-2xl font-poppins font-bold rounded-2xl bg-nomi-surface border border-nomi text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] shadow-inner transition-all hover:border-[#7C5CFC]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nomi-secondary uppercase tracking-wider mb-2">
                  Split By
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['equal', 'exact', 'percentage', 'shares'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setDemoSplitType(type)}
                      className={`py-2.5 px-3 rounded-xl capitalize text-xs font-semibold transition-all active:scale-95 ${
                        demoSplitType === type
                          ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30 font-bold scale-105'
                          : 'bg-nomi-surface border border-nomi text-nomi-secondary hover:text-nomi-main hover:border-[#7C5CFC]/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-nomi-surface border border-nomi space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-nomi">
                <span className="text-xs font-bold uppercase tracking-wider text-nomi-secondary">
                  Calculated Shares ({demoSplitType})
                </span>
                <span className="text-xs font-poppins font-bold text-[#7C5CFC] dark:text-[#9A82FF]">
                  Total: ${demoAmount.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2.5">
                {getDemoSplitResults().map((res, i) => (
                  <motion.div
                    key={i}
                    layout
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-nomi-bg text-sm border border-nomi/40 transition-colors"
                  >
                    <span className="font-medium text-nomi-main">{res.name}</span>
                    <span className="font-poppins font-bold text-nomi-main">{res.share}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid with Scroll & Hover Animations */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-nomi-main">
            Everything you need to split bills
          </h2>
          <p className="text-xs sm:text-sm text-nomi-secondary mt-2">
            No messy spreadsheets or math mistakes. Just clean expense tracking.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Sliders,
              title: 'Flexible Split Methods',
              desc: 'Split equally, by exact amount, by percentage, or by custom share ratios.',
              iconBg: 'bg-[#7C5CFC]/10 text-[#9A82FF]',
            },
            {
              icon: TrendingUp,
              title: 'Fewer Transfers',
              desc: 'Nomi simplifies debts across groups to minimize unnecessary payments between friends.',
              iconBg: 'bg-emerald-500/10 text-emerald-500',
            },
            {
              icon: Download,
              title: 'CSV Exporting',
              desc: 'Export group trip expenses to standard CSV files for budgeting or record keeping.',
              iconBg: 'bg-sky-500/10 text-sky-500',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-nomi-surface border border-nomi shadow-sm hover:shadow-2xl hover:border-[#7C5CFC]/40 hover:-translate-y-1 transition-all duration-150 ease-out space-y-4 cursor-default group"
            >
              <div className="p-3 rounded-2xl bg-[#7C5CFC]/10 text-[#9A82FF] w-fit transition-transform duration-150 group-hover:scale-110">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-nomi-main group-hover:text-[#9A82FF] transition-colors duration-150">
                {item.title}
              </h3>
              <p className="text-xs text-nomi-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion with Scroll Animation */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-nomi-surface border-t border-nomi"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-center text-nomi-main mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.005 }}
                  className="rounded-2xl border border-nomi bg-nomi-bg overflow-hidden transition-all hover:border-[#7C5CFC]/30"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left font-poppins font-semibold text-sm text-nomi-main flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-nomi-secondary transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#7C5CFC]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-xs text-nomi-secondary leading-relaxed border-t border-nomi/40 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* CTA Footer Banner */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center"
      >
        <div className="p-10 rounded-3xl bg-gradient-to-r from-[#7C5CFC] to-[#6B49F7] text-white space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl transition-transform duration-700 group-hover:scale-150" />
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl">Ready to split expenses effortlessly?</h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
            Create groups for trips, house bills, and events.
          </p>
          <div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-[#7C5CFC] font-poppins font-bold text-sm hover:bg-white/95 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
