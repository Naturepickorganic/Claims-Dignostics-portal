-- ============================================================
-- ClaimsDx v39 — Carrier Economics master table
-- One row per carrier (keyed by NAIC). Typed columns, entered
-- once, auto loaded into every future assessment of that NAIC.
-- Safe to run: guarded, additive only.
-- ============================================================

create table if not exists public.carrier_economics (
  naic               text primary key,
  carrier_name       text,
  -- Premium & portfolio ($M unless noted)
  dwp                numeric,
  nwp                numeric,
  dep                numeric,
  nep                numeric,
  policies_in_force  numeric,
  policy_retention   numeric,   -- %
  -- Claims volume
  annual_claims      numeric,
  open_inventory     numeric,
  -- Loss & LAE dollars ($M)
  incurred_loss      numeric,
  paid_alae          numeric,
  paid_ulae          numeric,
  -- Recovery base ($M)
  subro_recoverable  numeric,
  salvage_eligible   numeric,
  -- Workforce
  adjuster_count     numeric,
  loaded_fte_cost    numeric,   -- $/yr
  productive_hours   numeric,   -- hrs/yr
  -- Economic bridges ($)
  rental_cost_day    numeric,
  ale_cost_day       numeric,
  cost_per_call      numeric,
  updated_by         uuid references auth.users(id) on delete set null,
  updated_at         timestamptz default now()
);

alter table public.carrier_economics enable row level security;

-- Shared master data: any signed in user can read and maintain it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='carrier_economics' AND policyname='eco_select_auth') THEN
    CREATE POLICY "eco_select_auth" ON public.carrier_economics FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='carrier_economics' AND policyname='eco_insert_auth') THEN
    CREATE POLICY "eco_insert_auth" ON public.carrier_economics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='carrier_economics' AND policyname='eco_update_auth') THEN
    CREATE POLICY "eco_update_auth" ON public.carrier_economics FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename='carrier_economics' ORDER BY policyname;
