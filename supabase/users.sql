CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  account_type VARCHAR(20) DEFAULT 'seeker' CHECK (account_type IN ('seeker','owner')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users select own" ON public.users;
DROP POLICY IF EXISTS "Users insert own" ON public.users;
DROP POLICY IF EXISTS "Users update own" ON public.users;

CREATE POLICY "Users select own" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
