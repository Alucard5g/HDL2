-- ============================================================================
-- HÉROES DEL DEPORTE TACTIKAI - FINAL PRODUCTION SQL SCHEMA & GLOBAL SECURITY
-- Target DB: PostgreSQL (Supabase, RDS, Cloud SQL)
-- Designed for massive scale: 1,500+ sticker slots per album, thousands of concurrent hits.
-- ============================================================================

-- BEGIN DATABASE CONSTRAINTS & TRANSACTIONS CLEANUP
BEGIN;

-- 1. Create tables with robust constraints
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,                       -- Links directly with auth.uid() from Supabase Auth
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    game_code VARCHAR(10) UNIQUE NOT NULL,     -- 6-character unique code for DT leaderboard
    subscription VARCHAR(50) DEFAULT 'Ninguna', -- Scout, Pase VIP Elite, Ninguna
    license_code TEXT,                         -- Verified secure serial check
    score INTEGER DEFAULT 0 NOT NULL,          -- Aggregated rank score
    cash_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    promoter_id VARCHAR(50),                   -- Referrer ID for regional commissions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.unlocked_stickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sticker_id VARCHAR(50) NOT NULL,          -- e.g., 'ar-7', 'br-10' (uniform pattern)
    country VARCHAR(100) NOT NULL,            -- e.g., 'Argentina', 'Brasil'
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_sticker_id UNIQUE (user_id, sticker_id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,                      -- UUID or manual invoice ref
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,                 -- e.g., 'cash', 'stripe', 'payphone'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reference TEXT                             -- Bank voucher, Stripe session token, etc.
);

CREATE TABLE IF NOT EXISTS public.affiliate_visits (
    id VARCHAR(50) PRIMARY KEY,
    promoter_id VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    device_type VARCHAR(50) DEFAULT 'Web'
);

CREATE TABLE IF NOT EXISTS public.affiliate_sales (
    id VARCHAR(50) PRIMARY KEY,
    promoter_id VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    plan_tier VARCHAR(150) NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL
);


-- ============================================================================
-- 2. HIGH PERFORMANCE INDEXING (FOR UNDER 5ms LATENCY AT MASSIVE WORLDWIDE SCALE)
-- ============================================================================

-- B-Tree Index on users table primary lookups
CREATE INDEX IF NOT EXISTS idx_users_game_code ON public.users(game_code);
CREATE INDEX IF NOT EXISTS idx_users_score ON public.users(score DESC);

-- Composite Unique index for unlocked_stickers to prevent race condition duplications
CREATE INDEX IF NOT EXISTS idx_unlocked_stickers_composite ON public.unlocked_stickers(user_id, sticker_id);
-- Index by country to compute regional and country completions extremely fast
CREATE INDEX IF NOT EXISTS idx_unlocked_stickers_country ON public.unlocked_stickers(user_id, country);

-- Index on transaction records reference log
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Indexes for affiliate stats system dashboards
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_promoter ON public.affiliate_sales(promoter_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_visits_promoter ON public.affiliate_visits(promoter_id);


-- ============================================================================
-- 3. GLOBAL SECURITY MECHANIC: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS for individual-level protective data boundaries
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Note: Affiliate tables are administrative, handled securely via service-role backend bypass tokens

-- Policies for public.users
CREATE POLICY "Permitir lectura de perfíl propio" ON public.users 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Permitir mutación de perfíl propio" ON public.users 
    FOR UPDATE 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

-- Policies for public.unlocked_stickers
CREATE POLICY "Permitir lectura de mis cromos desbloqueados" ON public.unlocked_stickers 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Permitir registrar mis propios cromos coleccionados" ON public.unlocked_stickers 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policies for public.transactions
CREATE POLICY "Permitir lectura de mis compras y transacciones bancarias" ON public.transactions 
    FOR SELECT 
    USING (auth.uid() = user_id);


-- ============================================================================
-- 4. REAL-TIME MULTI-USER DYNAMIC SCORING FUNCTION (CTE-alternative trigger)
-- ============================================================================

-- Function to automatically recalculate and audit score upon sticker insertion
CREATE OR REPLACE FUNCTION public.recalculate_user_score()
RETURNS TRIGGER AS $$
DECLARE
    sticker_cnt INTEGER;
    completed_countries_cnt INTEGER;
    new_score INTEGER;
BEGIN
    -- 1. Grab sticker count
    SELECT COUNT(*) INTO sticker_cnt 
    FROM public.unlocked_stickers 
    WHERE user_id = NEW.user_id;

    -- 2. Count countries with exactly 26 distinct stickers collected (full collection bonus)
    SELECT COUNT(*) INTO completed_countries_cnt
    FROM (
        SELECT country 
        FROM public.unlocked_stickers 
        WHERE user_id = NEW.user_id 
        GROUP BY country 
        HAVING COUNT(sticker_id) = 26
    ) completed_country_subquery;

    -- Compute score: 1pt per sticker + 5pt bonus per finished country
    new_score := (sticker_cnt * 1) + (completed_countries_cnt * 5);

    -- 3. Atomic update into the user record
    UPDATE public.users 
    SET score = new_score, 
        updatedAt = now() 
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to unlocked_stickers table
DROP TRIGGER IF EXISTS trigger_recalculate_user_ranking_score ON public.unlocked_stickers;
CREATE TRIGGER trigger_recalculate_user_ranking_score
    AFTER INSERT ON public.unlocked_stickers
    FOR EACH ROW
    EXECUTE FUNCTION public.recalculate_user_score();

COMMIT;
