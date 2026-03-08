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
    .from("assessment_history")   // uses the view
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });
  return { assessments: data || [], error };
}

export async function listAllAssessments() {
  // Admin only — returns all consultants' assessments
  if (!SUPABASE_ENABLED) return { assessments: [], error: null };
  const { data, error } = await supabase
    .from("assessment_history")
    .select("*")
    .order("started_at", { ascending: false });
  return { assessments: data || [], error };
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

// ── Benchmark overrides ───────────────────────────────────────────────────────
export async function saveBenchmarkOverrides(userId, lob, overrides) {
  if (!SUPABASE_ENABLED) return { error: null };
  const { error } = await supabase
    .from("benchmark_overrides")
    .upsert({ user_id: userId, lob, overrides, updated_at: new Date().toISOString() },
             { onConflict: "user_id,lob" });
  return { error };
}

export async function loadBenchmarkOverrides(userId) {
  if (!SUPABASE_ENABLED) return { overrides: {}, error: null };
  const { data, error } = await supabase
    .from("benchmark_overrides")
    .select("lob, overrides")
    .eq("user_id", userId);
  if (error || !data) return { overrides: {}, error };
  const merged = {};
  data.forEach(r => { merged[r.lob] = r.overrides; });
  return { overrides: merged, error: null };
}
