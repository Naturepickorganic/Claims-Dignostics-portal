-- ============================================================
-- ClaimsDx Portal — Supabase Database Schema v2
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Tables:
--   1. profiles                      user accounts + roles
--   2. carriers                      reusable carrier master records
--   3. assessments                   one per diagnostic engagement
--   4. assessment_progress           save/resume state blob
--   5. assessment_results            final computed scores per lens
--   6. assessment_metric_responses   individual KPI answers (metrics path)
--   7. assessment_question_responses individual maturity Q&A (process path)
--   8. benchmark_overrides           admin-editable benchmark values
-- ============================================================

-- ── 1. profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'consultant'
               check (role in ('sales','consultant','admin')),
  org_name   text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'consultant')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. carriers ──────────────────────────────────────────────
-- Master record per P&C carrier. One carrier can have many
-- assessments over time (annual re-runs, different paths, etc.)
create table if not exists public.carriers (
  id           uuid primary key default gen_random_uuid(),
  created_by   uuid references auth.users(id) on delete set null,
  carrier_name text not null,
  naic         text,
  tier         int  check (tier in (1,2,3)),
  lobs         text[] default '{}',
  hq_state     text,
  dwp_range    text,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists carriers_naic_idx       on public.carriers(naic);
create index if not exists carriers_created_by_idx on public.carriers(created_by);

-- ── 3. assessments ───────────────────────────────────────────
-- One row per engagement. Carrier can have many.
create table if not exists public.assessments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  carrier_id      uuid references public.carriers(id) on delete set null,
  carrier_name    text,
  naic            text,
  tier            int,
  lobs            text[] default '{}',
  assessment_type text default 'baseline',
  path            text check (path in ('metrics','process','both')),
  status          text not null default 'in_progress'
                    check (status in ('in_progress','complete','archived')),
  started_at      timestamptz default now(),
  completed_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists assessments_user_id_idx    on public.assessments(user_id);
create index if not exists assessments_carrier_id_idx on public.assessments(carrier_id);
create index if not exists assessments_status_idx     on public.assessments(status);

-- ── 4. assessment_progress ───────────────────────────────────
-- Full UI state for save/resume. One row per assessment (upsert).
create table if not exists public.assessment_progress (
  id                   uuid primary key default gen_random_uuid(),
  assessment_id        uuid not null references public.assessments(id) on delete cascade,
  user_id              uuid not null references auth.users(id) on delete cascade,
  current_page         int,
  assessment_path      text,
  carrier_info         jsonb default '{}',
  metrics_data         jsonb default '{}',
  process_selections   jsonb default '[]',
  maturity_scores      jsonb default '{}',
  org_benchmark_vals   jsonb default '{}',
  saved_at             timestamptz default now()
);

create unique index if not exists progress_assessment_id_uidx
  on public.assessment_progress(assessment_id);

-- ── 5. assessment_results ────────────────────────────────────
-- Final computed scores saved on completion.
-- This is what powers the history dashboard and carrier trends.
create table if not exists public.assessment_results (
  id                  uuid primary key default gen_random_uuid(),
  assessment_id       uuid not null references public.assessments(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  carrier_id          uuid references public.carriers(id) on delete set null,
  overall_score       numeric(5,2),
  maturity_level      text,
  -- Per-lens scores: { "process_efficiency": 71, "financial_leakage": 58, ... }
  lens_scores         jsonb default '{}',
  -- Per-lens gaps vs median: { "process_efficiency": -9, ... }
  lens_gaps           jsonb default '{}',
  strengths           jsonb default '[]',
  improvements        jsonb default '[]',
  -- [{ "label": "Subrogation", "value": 1200000, "gap_pp": -6 }]
  value_opportunities jsonb default '[]',
  tier_used           int,
  lob_primary         text,
  created_at          timestamptz default now()
);

create unique index if not exists results_assessment_id_uidx
  on public.assessment_results(assessment_id);
create index if not exists results_carrier_id_idx on public.assessment_results(carrier_id);
create index if not exists results_user_id_idx    on public.assessment_results(user_id);

-- ── 6. assessment_metric_responses ──────────────────────────
-- One row per KPI per LOB per assessment (metrics path).
-- Fully queryable: "show carrier X's STP Rate across all runs"
create table if not exists public.assessment_metric_responses (
  id               uuid primary key default gen_random_uuid(),
  assessment_id    uuid not null references public.assessments(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  carrier_id       uuid references public.carriers(id) on delete set null,
  lob              text not null,
  category         text not null,
  metric_name      text not null,
  unit             text,
  org_value        numeric,
  benchmark_median numeric,
  benchmark_top25  numeric,
  bic_min          numeric,
  bic_max          numeric,
  vs_median_pct    numeric,
  status           text check (status in ('green','amber','red','neutral')),
  created_at       timestamptz default now()
);

create index if not exists metric_resp_assessment_idx on public.assessment_metric_responses(assessment_id);
create index if not exists metric_resp_carrier_idx    on public.assessment_metric_responses(carrier_id);
create index if not exists metric_resp_metric_idx     on public.assessment_metric_responses(metric_name);

-- ── 7. assessment_question_responses ────────────────────────
-- One row per L3 question per assessment (process path).
-- 162 questions max per run. Enables cross-carrier comparisons.
create table if not exists public.assessment_question_responses (
  id             uuid primary key default gen_random_uuid(),
  assessment_id  uuid not null references public.assessments(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  carrier_id     uuid references public.carriers(id) on delete set null,
  l1_category    text not null,
  l2_process     text not null,
  l3_question    text not null,
  basic_tech     text,
  basic_proc     text,
  inter_tech     text,
  inter_proc     text,
  bic_tech       text,
  bic_proc       text,
  tech_score     int check (tech_score between 1 and 5),
  process_score  int check (process_score between 1 and 5),
  avg_score      numeric(3,2),
  included       boolean default true,
  created_at     timestamptz default now()
);

create index if not exists qresp_assessment_idx on public.assessment_question_responses(assessment_id);
create index if not exists qresp_carrier_idx    on public.assessment_question_responses(carrier_id);
create index if not exists qresp_l1_idx         on public.assessment_question_responses(l1_category);

-- ── 8. benchmark_overrides ───────────────────────────────────
create table if not exists public.benchmark_overrides (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lob        text not null,
  overrides  jsonb not null default '{}',
  updated_at timestamptz default now()
);

create unique index if not exists benchmark_overrides_user_lob_idx
  on public.benchmark_overrides(user_id, lob);

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles                      enable row level security;
alter table public.carriers                      enable row level security;
alter table public.assessments                   enable row level security;
alter table public.assessment_progress           enable row level security;
alter table public.assessment_results            enable row level security;
alter table public.assessment_metric_responses   enable row level security;
alter table public.assessment_question_responses enable row level security;
alter table public.benchmark_overrides           enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- carriers: own + admins see all
create policy "carriers_select" on public.carriers for select using (
  auth.uid() = created_by
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "carriers_insert" on public.carriers for insert with check (auth.uid() = created_by);
create policy "carriers_update" on public.carriers for update using (auth.uid() = created_by);

-- assessments: own + admins see all
create policy "assessments_select" on public.assessments for select using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "assessments_insert" on public.assessments for insert with check (auth.uid() = user_id);
create policy "assessments_update" on public.assessments for update using (auth.uid() = user_id);

-- progress: own only
create policy "progress_all_own" on public.assessment_progress for all using (auth.uid() = user_id);

-- results: own + admins
create policy "results_select" on public.assessment_results for select using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "results_insert" on public.assessment_results for insert with check (auth.uid() = user_id);

-- metric responses: own + admins
create policy "metric_resp_select" on public.assessment_metric_responses for select using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "metric_resp_insert" on public.assessment_metric_responses for insert with check (auth.uid() = user_id);

-- question responses: own + admins
create policy "qresp_select" on public.assessment_question_responses for select using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "qresp_insert" on public.assessment_question_responses for insert with check (auth.uid() = user_id);

-- benchmark overrides: own only
create policy "benchmarks_all_own" on public.benchmark_overrides for all using (auth.uid() = user_id);

-- ── updated_at triggers ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_profiles_updated_at    before update on public.profiles    for each row execute procedure public.set_updated_at();
create trigger set_carriers_updated_at    before update on public.carriers    for each row execute procedure public.set_updated_at();
create trigger set_assessments_updated_at before update on public.assessments for each row execute procedure public.set_updated_at();
create trigger set_benchmarks_updated_at  before update on public.benchmark_overrides for each row execute procedure public.set_updated_at();

-- ── Views ────────────────────────────────────────────────────

-- History dashboard: all assessments with results joined
create or replace view public.assessment_history as
select
  a.id              as assessment_id,
  a.user_id,
  a.carrier_name,
  a.naic,
  a.tier,
  a.lobs,
  a.path,
  a.assessment_type,
  a.status,
  a.started_at,
  a.completed_at,
  r.overall_score,
  r.maturity_level,
  r.lens_scores,
  r.lens_gaps,
  r.value_opportunities,
  p.full_name       as consultant_name,
  p.email           as consultant_email
from public.assessments a
left join public.assessment_results r on r.assessment_id = a.id
left join public.profiles p           on p.id = a.user_id;

-- Carrier trend: score improvement across repeated assessments
create or replace view public.carrier_trends as
select
  a.carrier_name,
  a.naic,
  a.tier,
  a.completed_at::date as assessment_date,
  r.overall_score,
  r.maturity_level,
  r.lens_scores,
  a.path,
  a.user_id
from public.assessments a
join public.assessment_results r on r.assessment_id = a.id
where a.status = 'complete'
order by a.carrier_name, a.completed_at;

-- ── Useful admin queries (run in SQL Editor as needed) ────────
-- All completed assessments:
--   select * from public.assessment_history where status = 'complete' order by completed_at desc;
-- Carrier trend for a specific NAIC:
--   select * from public.carrier_trends where naic = '12345';
-- All question scores for one assessment:
--   select l1_category, l2_process, l3_question, tech_score, process_score
--   from public.assessment_question_responses where assessment_id = '<uuid>';
-- Promote user to admin:
--   update public.profiles set role = 'admin' where email = 'your@email.com';
