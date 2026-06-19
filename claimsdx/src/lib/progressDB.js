import { supabase, SUPABASE_ENABLED } from "./supabase.js";

// ── Carrier ───────────────────────────────────────────────────────────────────
export async function upsertCarrier(userId, carrierInfo) {
  if (!SUPABASE_ENABLED) return { id: "local-carrier", error: null };

  // Try to match on NAIC first, then name
  const { data: existing } = await supabase
    .from("carriers")
    .select("id")
    .eq("created_by", userId)
    .eq("naic", carrierInfo.naic || "")
    .maybeSingle();

  if (existing) return { id: existing.id, error: null };

  const { data, error } = await supabase
    .from("carriers")
    .insert({
      created_by:   userId,
      carrier_name: carrierInfo.name        || "",
      naic:         carrierInfo.naic        || "",
      tier:         carrierInfo.tier        || null,
      lobs:         carrierInfo.lobs        || [],
    })
    .select("id")
    .single();

  return { id: data?.id, error };
}

export async function listCarriers(userId) {
  if (!SUPABASE_ENABLED) return { carriers: [], error: null };
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .eq("created_by", userId)
    .order("carrier_name");
  return { carriers: data || [], error };
}

// ── Assessments ───────────────────────────────────────────────────────────────
export async function createAssessment(userId, carrierId, carrierInfo) {
  if (!SUPABASE_ENABLED) return { id: "local-assessment", error: null };

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      user_id:         userId,
      carrier_id:      carrierId || null,
      carrier_name:    carrierInfo?.name  || "",
      naic:            carrierInfo?.naic  || "",
      tier:            carrierInfo?.tier  || null,
      lobs:            carrierInfo?.lobs  || [],
      assessment_type: carrierInfo?.type  || "baseline",
      status:          "in_progress",
    })
    .select("id")
    .single();

  return { id: data?.id, error };
}

export async function listAssessments(userId) {
  if (!SUPABASE_ENABLED) return { assessments: [], error: null };
  const { data, error } = await supabase
    .from("assessments")
    .select(`
      id,
      user_id,
      carrier_id,
      carrier_name,
      naic,
      tier,
      lobs,
      path,
      assessment_type,
      status,
      started_at,
      completed_at,
      assessment_results ( overall_score, maturity_level, lens_scores, lens_gaps )
    `)
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) return { assessments: [], error };

  const flat = (data || []).map(a => ({
    assessment_id:  a.id,
    carrier_id:     a.carrier_id,
    user_id:        a.user_id,
    carrier_name:   a.carrier_name,
    naic:           a.naic,
    tier:           a.tier,
    lobs:           a.lobs,
    path:           a.path,
    status:         a.status,
    started_at:     a.started_at,
    completed_at:   a.completed_at,
    overall_score:  a.assessment_results?.[0]?.overall_score ?? null,
    maturity_level: a.assessment_results?.[0]?.maturity_level ?? null,
    lens_scores:    a.assessment_results?.[0]?.lens_scores ?? null,
  }));

  return { assessments: flat, error: null };
}

export async function listAllAssessments() {
  // Admin only — queries assessments table directly (not view) to include all statuses
  if (!SUPABASE_ENABLED) return { assessments: [], error: null };

  // Step 1: fetch assessments WITHOUT the profiles join.
  // The profiles join can fail under RLS and cause the whole query to error,
  // which then makes the Admin panel fall back to mock data.
  const { data, error } = await supabase
    .from("assessments")
    .select(`
      id,
      user_id,
      carrier_id,
      carrier_name,
      naic,
      tier,
      lobs,
      path,
      assessment_type,
      status,
      started_at,
      completed_at,
      assessment_results ( overall_score, maturity_level, lens_scores, lens_gaps, value_opportunities )
    `)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("listAllAssessments error:", error);
    return { assessments: [], error };
  }

  // Step 2: best-effort fetch of consultant names (separate query, non-blocking)
  let profileMap = {};
  try {
    const userIds = [...new Set((data || []).map(a => a.user_id).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      (profs || []).forEach(p => { profileMap[p.id] = p; });
    }
  } catch (e) {
    // If profiles can't be read, just show assessments without consultant names
    console.warn("Could not load consultant names:", e);
  }

  // Flatten nested joins into flat objects (same shape as assessment_history view)
  const flat = (data || []).map(a => ({
    assessment_id:    a.id,
    carrier_id:       a.carrier_id,
    user_id:          a.user_id,
    carrier_name:     a.carrier_name,
    naic:             a.naic,
    tier:             a.tier,
    lobs:             a.lobs,
    path:             a.path,
    assessment_type:  a.assessment_type,
    status:           a.status,
    started_at:       a.started_at,
    completed_at:     a.completed_at,
    overall_score:    a.assessment_results?.[0]?.overall_score ?? null,
    maturity_level:   a.assessment_results?.[0]?.maturity_level ?? null,
    lens_scores:      a.assessment_results?.[0]?.lens_scores ?? null,
    lens_gaps:        a.assessment_results?.[0]?.lens_gaps ?? null,
    value_opportunities: a.assessment_results?.[0]?.value_opportunities ?? null,
    consultant_name:  profileMap[a.user_id]?.full_name ?? null,
    consultant_email: profileMap[a.user_id]?.email ?? null,
  }));

  return { assessments: flat, error: null };
}

export async function markAssessmentComplete(assessmentId) {
  if (!SUPABASE_ENABLED) return { error: null };
  const { error } = await supabase
    .from("assessments")
    .update({ status: "complete", completed_at: new Date().toISOString() })
    .eq("id", assessmentId);
  return { error };
}

// ── Progress (save/resume) ────────────────────────────────────────────────────
export async function saveProgressToDB(userId, assessmentId, stateSnapshot) {
  if (!SUPABASE_ENABLED) return { error: null };

  const { error } = await supabase
    .from("assessment_progress")
    .upsert({
      assessment_id:      assessmentId,
      user_id:            userId,
      current_page:       stateSnapshot.page,
      assessment_path:    stateSnapshot.assessmentPath,
      carrier_info:       stateSnapshot.carrierInfo       || {},
      metrics_data:       stateSnapshot.metricsData       || {},
      process_selections: stateSnapshot.processSelections || [],
      maturity_scores:    stateSnapshot.maturityScores    || {},
      org_benchmark_vals: stateSnapshot.orgBenchmarkVals  || {},
      saved_at:           new Date().toISOString(),
    }, { onConflict: "assessment_id" });

  return { error };
}

export async function loadProgressFromDB(userId) {
  if (!SUPABASE_ENABLED) return { progress: null, error: null };

  const { data, error } = await supabase
    .from("assessments")
    .select(`
      id, carrier_name, naic, tier, lobs, path, status, started_at,
      assessment_progress (
        current_page, assessment_path, carrier_info, metrics_data,
        process_selections, maturity_scores, org_benchmark_vals, saved_at
      )
    `)
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return { progress: null, error };
  const p = data.assessment_progress?.[0] || null;

  return {
    progress: p ? {
      assessmentId:      data.id,
      page:              p.current_page,
      assessmentPath:    p.assessment_path,
      carrierInfo:       p.carrier_info,
      metricsData:       p.metrics_data,
      processSelections: p.process_selections,
      maturityScores:    p.maturity_scores,
      orgBenchmarkVals:  p.org_benchmark_vals,
      savedAt:           p.saved_at,
    } : null,
    error: null,
  };
}

// ── Results (save on completion) ──────────────────────────────────────────────
export async function saveResults(userId, assessmentId, carrierId, results) {
  if (!SUPABASE_ENABLED) return { error: null };

  const { error } = await supabase
    .from("assessment_results")
    .upsert({
      assessment_id:      assessmentId,
      user_id:            userId,
      carrier_id:         carrierId || null,
      overall_score:      results.overallScore,
      maturity_level:     results.maturityLevel,
      lens_scores:        results.lensScores        || {},
      lens_gaps:          results.lensGaps          || {},
      strengths:          results.strengths         || [],
      improvements:       results.improvements      || [],
      value_opportunities: results.valueOpportunities || [],
      tier_used:          results.tierUsed,
      lob_primary:        results.lobPrimary,
    }, { onConflict: "assessment_id" });

  return { error };
}

export async function loadResultsHistory(userId) {
  if (!SUPABASE_ENABLED) return { history: [], error: null };
  const { data, error } = await supabase
    .from("assessment_results")
    .select(`
      *,
      assessments ( carrier_name, naic, tier, lobs, path, completed_at )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { history: data || [], error };
}

// ── Metric responses (individual KPI rows) ────────────────────────────────────
export async function saveMetricResponses(userId, assessmentId, carrierId, metricsData, benchmarkData) {
  if (!SUPABASE_ENABLED) return { error: null };

  const rows = [];
  Object.entries(metricsData).forEach(([key, value]) => {
    // key format: "{lob}-{category}-{metricName}"
    const parts  = key.split("-");
    const lob    = parts[0];
    const cat    = parts[1];
    const metric = parts.slice(2).join("-");

    if (value === "" || value === null || value === undefined) return;
    const num = parseFloat(value);
    if (isNaN(num)) return;

    rows.push({
      assessment_id: assessmentId,
      user_id:       userId,
      carrier_id:    carrierId || null,
      lob,
      category:      cat,
      metric_name:   metric,
      org_value:     num,
    });
  });

  if (!rows.length) return { error: null };
  const { error } = await supabase.from("assessment_metric_responses").insert(rows);
  return { error };
}

// ── Question responses (individual maturity Q rows) ───────────────────────────
export async function saveQuestionResponses(userId, assessmentId, carrierId, maturityScores, questionsData) {
  if (!SUPABASE_ENABLED) return { error: null };

  const rows = [];
  Object.entries(maturityScores).forEach(([key, scores]) => {
    // key format: "{l1}|||{l2}|||{l3}"
    const [l1, l2, l3] = key.split("|||");
    if (!l1 || !l2 || !l3) return;

    rows.push({
      assessment_id: assessmentId,
      user_id:       userId,
      carrier_id:    carrierId || null,
      l1_category:   l1,
      l2_process:    l2,
      l3_question:   l3,
      tech_score:    scores.tech    || null,
      process_score: scores.process || null,
      avg_score:     scores.tech && scores.process
                       ? ((scores.tech + scores.process) / 2)
                       : null,
      included:      true,
    });
  });

  if (!rows.length) return { error: null };
  const { error } = await supabase.from("assessment_question_responses").insert(rows);
  return { error };
}

// ── Benchmark overrides (row-level: one row per lob + metric_name + tier) ────
// Key format in-memory: "{lob}:{metricName}:{tier}" → {indMin, indMax, bicMin, bicMax}

export async function loadBenchmarkOverrides() {
  if (!SUPABASE_ENABLED) return { overrides: {}, error: null };
  const { data, error } = await supabase
    .from("benchmark_overrides")
    .select("lob, metric_name, tier, ind_min, ind_max, bic_min, bic_max");
  if (error || !data) return { overrides: {}, error };
  const overrides = {};
  for (const row of data) {
    const key = `${row.lob}:${row.metric_name}:${row.tier}`;
    overrides[key] = {
      indMin: row.ind_min,
      indMax: row.ind_max,
      bicMin: row.bic_min,
      bicMax: row.bic_max,
    };
  }
  return { overrides, error: null };
}

export async function saveBenchmarkOverride(lob, metricName, tier, bench) {
  if (!SUPABASE_ENABLED) return { error: null };
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("benchmark_overrides")
    .upsert({
      lob,
      metric_name: metricName,
      tier:        parseInt(tier),
      ind_min:     bench.indMin ?? null,
      ind_max:     bench.indMax ?? null,
      bic_min:     bench.bicMin ?? null,
      bic_max:     bench.bicMax ?? null,
      updated_by:  user?.id,
      updated_at:  new Date().toISOString(),
    }, { onConflict: "lob,metric_name,tier" });
  return { error };
}

// ── User management (admin only) ──────────────────────────────────────────────
export async function listAllUsers() {
  if (!SUPABASE_ENABLED) return { users: [], error: null };
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });
  return { users: data || [], error };
}

export async function updateUserRole(userId, newRole) {
  if (!SUPABASE_ENABLED) return { error: null };
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);
  return { error };
}

// ── Load metric data for read-only results view (#12 fix) ─────────────────────
// Fetches individual metric responses so Benchmark tab works in read-only mode
export async function loadAssessmentMetrics(assessmentId) {
  if (!SUPABASE_ENABLED) return { metricsData: {}, carrierInfo: null, error: null };

  const { data, error } = await supabase
    .from("assessment_metric_responses")
    .select("lob, metric_name, org_value, tier")
    .eq("assessment_id", assessmentId);

  if (error || !data) return { metricsData: {}, carrierInfo: null, error };

  // Rebuild the metricsData key format: "{lobKey}:{metricName}"
  const metricsData = {};
  data.forEach(row => {
    if (row.org_value !== null && row.org_value !== undefined) {
      const key = `${row.lob}:${row.metric_name}`;
      metricsData[key] = String(row.org_value);
    }
  });

  return { metricsData, error: null };
}

// ── Delete an assessment (admin only) ─────────────────────────────────────────
// Deletes the assessment and all its related rows (results, metric responses,
// question responses, progress). Relies on ON DELETE CASCADE in the schema,
// but also explicitly deletes children for safety if cascade isn't configured.
export async function deleteAssessment(assessmentId) {
  if (!SUPABASE_ENABLED) return { error: null };
  if (!assessmentId) return { error: { message: "No assessment id" } };

  // Best-effort delete of child rows first (in case cascade isn't set)
  const childTables = [
    "assessment_results",
    "assessment_metric_responses",
    "assessment_question_responses",
    "assessment_progress",
  ];
  for (const t of childTables) {
    try {
      await supabase.from(t).delete().eq("assessment_id", assessmentId);
    } catch (e) {
      // ignore — table may not have rows or cascade handles it
    }
  }

  // Delete the assessment itself
  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", assessmentId);

  return { error };
}

// ── Reassign an assessment to a different consultant ──────────────────────────
// Admin or the current owner can hand off an in-progress assessment.
// Updates the owning user_id; all child rows stay linked via assessment_id.
export async function reassignAssessment(assessmentId, newUserId) {
  if (!SUPABASE_ENABLED) return { error: null };
  if (!assessmentId || !newUserId) return { error: { message: "Missing assessment or target user" } };

  const { error } = await supabase
    .from("assessments")
    .update({ user_id: newUserId })
    .eq("id", assessmentId);

  // Also move any saved progress row to the new owner so they can Resume
  if (!error) {
    try {
      await supabase
        .from("assessment_progress")
        .update({ user_id: newUserId })
        .eq("assessment_id", assessmentId);
    } catch (e) {
      // progress row may not exist — non-fatal
    }
  }

  return { error };
}
