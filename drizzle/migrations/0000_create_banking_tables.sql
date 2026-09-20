-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  owner text NOT NULL DEFAULT '',
  iban text NOT NULL DEFAULT '',
  seeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  type text NOT NULL CHECK (type IN ('in','out')),
  counterparty text NOT NULL,
  iban text,
  amount numeric(14,2) NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL DEFAULT 'Ostatné príjmy',
  note text,
  vs text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transactions_user_date_idx ON public.transactions (user_id, date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own txn select" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own txn insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own txn update" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own txn delete" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Goals
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  target numeric(14,2) NOT NULL DEFAULT 0,
  saved numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goal select" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own goal insert" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own goal update" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own goal delete" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Budgets
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  category text NOT NULL,
  limit_amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT ALL ON public.budgets TO service_role;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own budget select" ON public.budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own budget insert" ON public.budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own budget update" ON public.budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own budget delete" ON public.budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, owner, iban)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'owner', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();