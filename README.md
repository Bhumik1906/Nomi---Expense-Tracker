# Nomi — Minimalist Expense Tracker & Debt Simplifier

A modern, fluid group expense tracker and bill splitter built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

Designed with an aesthetic "calm tech" interface inspired by modern Japanese minimalism, Nomi makes sharing bills, tracking group balances, and settling debts effortless.

---

## ✨ Features

- **Split Any Way**: Equal splits, exact amounts, percentages, or custom shares.
- **Penny-Perfect Math**: All financial math calculated in integer minor units (paise/cents) to eliminate floating-point rounding errors.
- **Smart Debt Simplification**: Reduces $O(N^2)$ pairwise debts to minimum direct settlements using a greedy net-balance graph algorithm.
- **Multi-Currency Support**: Native handling of INR (₹), USD ($), EUR (€), GBP (£), CAD (CA$), AUD (A$), and JPY (¥).
- **Groups & Friends**: Create trip/housemate/project groups with custom icons, or split 1-on-1 with friends.
- **Contextual Add Expense**: Clicking "Add Expense" from inside a group or friend page automatically preselects them.
- **Payment History**: View detailed shared expenses and settlement receipts.
- **One-Click CSV Export**: Export group or personal records to UTF-8 CSV with Excel BOM compatibility.
- **Persistent Local State + Supabase Ready**: Full offline demo capability with localStorage syncing and Supabase schema/RLS policies included.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

---

## 🧪 Testing

Run the automated financial engine tests:

```bash
npm test
```

Tests cover:
- Decimal conversion and major/minor unit conversions
- Remainder distribution for uneven equal splits (e.g., ₹100 split 3 ways)
- Exact split validation and mismatch detection
- Percentage splits with fractional remainder allocation
- Weighted share splits
- Pairwise and group net balance computations
- Debt simplification graph reduction

---

## 🛠️ Project Structure

```
src/
├── app/
│   ├── (auth)/             # Login & Signup flows
│   ├── activity/           # Real-time activity audit log
│   ├── dashboard/          # Central dashboard with net balance & quick actions
│   ├── friends/            # Friend listing and 1-on-1 detail ledger
│   ├── groups/             # Group listing and group detail ledger
│   └── settings/           # Profile and currency preferences
├── components/
│   └── nomi/               # Design system & domain components
│       ├── BalanceCard.tsx
│       ├── DebtSimplificationCard.tsx
│       ├── ExpenseCard.tsx
│       ├── ExpenseModal.tsx
│       ├── FriendCard.tsx
│       ├── GroupCard.tsx
│       ├── NavigationHeader.tsx
│       ├── NomiOrbit.tsx
│       └── SettlementModal.tsx
├── lib/
│   ├── export/             # UTF-8 CSV export with Blob URL support
│   ├── finance/            # Deterministic financial calculation engine & tests
│   ├── store/              # Reactive Nomi state store with localStorage persistence
│   └── types/              # Domain models (Group, Expense, Settlement, UserProfile)
└── supabase/
    └── schema.sql          # Postgres schema, constraints, and Row Level Security policies
```

---

## 📜 Build & Verification

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Production Build
npm run build
```
