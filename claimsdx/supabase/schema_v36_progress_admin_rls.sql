-- ============================================================
-- ClaimsDx v36 — Admin access to assessment_progress
-- Fixes three production gaps caused by progress_all_own being
-- the ONLY policy on assessment_progress:
--   1. Last Worked column blank for rows the admin does not own
--   2. Admin Resume cannot read another consultant's snapshot
--   3. Reassign silently fails to move the progress row
-- Safe to run: guarded, additive only. Run in Supabase SQL Editor.
-- ============================================================

-- Admin can READ any progress row (Last Worked join + admin resume)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'assessment_progress' AND policyname = 'progress_admin_select'
  ) THEN
    CREATE POLICY "progress_admin_select" ON public.assessment_progress
      FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      );
  END IF;
END $$;

-- Admin can UPDATE any progress row (reassign moves user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'assessment_progress' AND policyname = 'progress_admin_update'
  ) THEN
    CREATE POLICY "progress_admin_update" ON public.assessment_progress
      FOR UPDATE USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      );
  END IF;
END $$;

-- Verify
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename = 'assessment_progress' ORDER BY policyname;
