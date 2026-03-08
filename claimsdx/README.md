# ClaimsDx Portal

**P&C Claims Diagnostic Assessment Platform — ValueMomentum**

A multi-path claims maturity assessment portal with real-time benchmark positioning, role-based access, and Supabase-powered auth + progress persistence.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite                     |
| Auth & DB   | Supabase (PostgreSQL + Auth)        |
| Deployment  | Vercel (CDN + edge)                 |
| Styling     | Inline styles (no CSS framework)    |
| Icons       | lucide-react                        |

---

## Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- A [GitHub](https://github.com) account

---

## Step 1 — Set up Supabase

### 1a. Create project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `claimsdx-portal`), set a strong DB password, pick your region
3. Wait ~2 minutes for the project to spin up

### 1b. Run the database schema
1. In the Supabase dashboard → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

You should see all tables created: `profiles`, `assessments`, `assessment_progress`, `benchmark_overrides`

### 1c. Get your API credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### 1d. Configure Auth (email confirmation)
1. Go to **Authentication** → **Email** → optionally disable "Confirm email" for dev
2. For production: set your **Site URL** to your Vercel domain (e.g. `https://claimsdx.vercel.app`)

---

## Step 2 — Run locally

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local
# Edit .env.local and fill in your Supabase URL and anon key

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

### Create your first admin user
1. Open the app, click "Create Account", fill in your name/email/password, select **Admin**
2. Check your email and confirm (if email confirmation is on)
3. Sign in — you'll have admin access

### Promote user to admin (if needed)
In Supabase → SQL Editor, run:
```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

---

## Step 3 — Push to GitHub

```bash
# In the project root:
git init
git add .
git commit -m "Initial commit — ClaimsDx Portal"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/claimsdx-portal.git
git branch -M main
git push -u origin main
```

---

## Step 4 — Deploy to Vercel

### 4a. Import from GitHub
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Click **Import** next to your `claimsdx-portal` GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. Click **Deploy** — it will fail first because env vars are missing

### 4b. Add environment variables
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add both variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |

3. Set environment to **Production**, **Preview**, and **Development**
4. Click **Save**

### 4c. Redeploy
1. Go to **Deployments** → click the failed deployment → **Redeploy**
2. Your app is live at `https://your-project.vercel.app` 🎉

### 4d. Update Supabase Site URL
1. Copy your Vercel URL (e.g. `https://claimsdx-portal.vercel.app`)
2. In Supabase → **Authentication** → **URL Configuration**
3. Set **Site URL** to your Vercel URL
4. Add to **Redirect URLs**: `https://claimsdx-portal.vercel.app/**`

---

## Future deployments

Every `git push` to `main` auto-deploys to Vercel. No manual steps needed.

```bash
git add .
git commit -m "Your update message"
git push
# → Vercel auto-deploys in ~30 seconds
```

---

## Roles & Permissions

| Role | Pages | Notes |
|------|-------|-------|
| **Sales** | Welcome, Carrier Info, Results (demo) | Demo mode only |
| **Consultant** | All assessment pages (1–7) | Full workflow |
| **Admin** | Everything + Admin panel | Can edit benchmarks, see all roles |

To change a user's role, either:
- Use the Supabase SQL editor: `update profiles set role = 'admin' where email = '...'`
- Or build the user management UI in the Admin panel (roadmap)

---

## Project Structure

```
claimsdx/
├── supabase/
│   └── schema.sql          ← Run this in Supabase SQL editor
├── src/
│   ├── lib/
│   │   ├── supabase.js     ← Supabase client
│   │   ├── useAuth.js      ← Auth hook (signIn, signUp, signOut)
│   │   └── progressDB.js   ← Save/load progress to Supabase
│   ├── pages/
│   │   ├── LoginPage.jsx   ← Real auth (email + password)
│   │   ├── AdminPage.jsx   ← Benchmark editor, role overview
│   │   ├── Page1–7.jsx     ← Assessment flow
│   ├── App.jsx             ← Routing + role access control
│   ├── AppContext.jsx      ← Global state + Supabase integration
│   ├── SaveProgress.jsx    ← Save/resume UI
│   ├── benchmarkData.js    ← 190 metrics from Excel
│   ├── questionsData.js    ← 162 process maturity questions
│   └── constants.js        ← Design system tokens
├── .env.example            ← Copy to .env.local
├── .gitignore
├── vercel.json             ← SPA routing + security headers
└── package.json
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase public anon key (safe to expose) |

> **Never commit `.env.local`** — it's in `.gitignore`. Only `.env.example` is committed.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Missing Supabase env vars" | Copy `.env.example` → `.env.local` and fill in values |
| Login works but profile is null | Run `schema.sql` again — trigger may not have fired |
| Vercel build fails | Check env vars are set in Vercel project settings |
| Blank page on Vercel | Check `vercel.json` is present — needed for SPA routing |
| Email confirmation loop | Disable "Confirm email" in Supabase Auth settings for dev |

---

Built by **ValueMomentum** · ClaimsDx Portal v1.0
