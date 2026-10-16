-- Nomi Database Schema & RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  preferred_currency TEXT NOT NULL DEFAULT 'INR',
  theme TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id <> friend_id)
);

-- 3. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'users',
  currency TEXT NOT NULL DEFAULT 'INR',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_group_member UNIQUE (group_id, user_id)
);

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0), -- Minor units (paise/cents)
  currency TEXT NOT NULL DEFAULT 'INR',
  category TEXT NOT NULL DEFAULT 'General',
  paid_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  split_type TEXT NOT NULL DEFAULT 'equal', -- 'equal', 'exact', 'percentage', 'shares'
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EXPENSE SPLITS TABLE
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount BIGINT NOT NULL CHECK (amount >= 0), -- Calculated split in minor units
  split_value NUMERIC, -- original percentage, share count, or exact amount
  CONSTRAINT unique_expense_split UNIQUE (expense_id, user_id)
);

-- 7. SETTLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0), -- Minor units
  currency TEXT NOT NULL DEFAULT 'INR',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_settlement CHECK (payer_id <> receiver_id)
);

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'expense_added', 'expense_edited', 'expense_deleted', 'settlement_created', 'member_added', 'member_removed'
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON public.expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON public.expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON public.expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_payer ON public.settlements(payer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_receiver ON public.settlements(receiver_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group ON public.settlements(group_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_group ON public.activity_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- AUTOMATIC PROFILE TRIGGER ON AUTH.USERS CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can view profiles, users can update own profile
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Friendships: Users can view & manage their own friendships
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Groups: Members can view group details
CREATE POLICY "Group members can view groups" ON public.groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Group admins/creator can update group" ON public.groups
  FOR UPDATE USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- Group Members: Members can view members of their groups
CREATE POLICY "Members can view group membership" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins or members can add group members" ON public.group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    ) OR NOT EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
    )
  );

CREATE POLICY "Members or admins can leave or remove members" ON public.group_members
  FOR DELETE USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- Expenses: Authorized users (paid_by, split participants, or group members)
CREATE POLICY "Users can view authorized expenses" ON public.expenses
  FOR SELECT USING (
    paid_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.expense_splits
      WHERE expense_splits.expense_id = expenses.id
      AND expense_splits.user_id = auth.uid()
    ) OR (
      group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = expenses.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = paid_by);

CREATE POLICY "Expense payer or group admin can update expense" ON public.expenses
  FOR UPDATE USING (paid_by = auth.uid());

CREATE POLICY "Expense payer or group admin can delete expense" ON public.expenses
  FOR DELETE USING (paid_by = auth.uid());

-- Expense Splits: Authorized expense viewers
CREATE POLICY "Users can view expense splits" ON public.expense_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_splits.expense_id
      AND (
        expenses.paid_by = auth.uid() OR
        expense_splits.user_id = auth.uid() OR
        (expenses.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_members.group_id = expenses.group_id
          AND group_members.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Payer can insert splits" ON public.expense_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_splits.expense_id
      AND expenses.paid_by = auth.uid()
    )
  );

CREATE POLICY "Payer can delete splits" ON public.expense_splits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_splits.expense_id
      AND expenses.paid_by = auth.uid()
    )
  );

-- Settlements: Payer or Receiver or Group members
CREATE POLICY "Users can view settlements" ON public.settlements
  FOR SELECT USING (
    payer_id = auth.uid() OR receiver_id = auth.uid() OR (
      group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = settlements.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert settlements" ON public.settlements
  FOR INSERT WITH CHECK (payer_id = auth.uid() OR receiver_id = auth.uid());

-- Activity Logs & Notifications
CREATE POLICY "Users can view relevant activity logs" ON public.activity_logs
  FOR SELECT USING (
    actor_id = auth.uid() OR (
      group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = activity_logs.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
