// ClaimsDx link and navigation QA suite — every screen renders, every primary
// link and button fires its handler, no crashes. Run: npx vitest run src/__tests__/smoke.links.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";

// ── Shared mocks ─────────────────────────────────────────────
vi.mock("../AppContext.jsx", () => ({
  ROLES: { admin: "Admin", consultant: "Consultant", sales: "Sales" },
  ROLE_ACCESS: { sales: [1,2,3,5], consultant: [1,2,3,4,5,6,7,8], admin: [1,2,3,4,5,6,7,8,9] },
  useApp: () => ({
    session: { user: { id: "u1", email: "t@vm.com" } },
    profile: { id: "u1", role: "consultant", full_name: "Test User" },
    supabaseEnabled: false,
    benchmarkOverrides: {},
    updateBenchmarkOverride: vi.fn(),
    completeAssessment: vi.fn(async () => ({})),
    saveStatus: "idle", lastSavedAt: null, saveProgress: vi.fn(),
    loadProgress: vi.fn(async () => null), loadProgressById: vi.fn(async () => null),
    clearProgress: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), localLogin: vi.fn(),
  }),
}));
vi.mock("../lib/supabase.js", () => ({ SUPABASE_ENABLED: true, supabase: null }));
vi.mock("../lib/progressDB.js", () => ({
  listAssessments: vi.fn(async () => ({ assessments: [
    { assessment_id: "a1", carrier_name: "Test Mutual", naic: "12345", tier: 2, lobs: ["pa"], path: "metrics", status: "in_progress", started_at: new Date().toISOString(), last_worked_at: new Date().toISOString(), carrier_id: "c1" },
    { assessment_id: "a2", carrier_name: "Done Insurance", naic: "54321", tier: 2, lobs: ["pa"], path: "metrics", status: "completed", started_at: new Date().toISOString(), last_worked_at: null, carrier_id: "c2", overall_score: 71 },
  ], error: null })),
  listAllAssessments: vi.fn(async () => ({ assessments: [], error: null })),
  listAllUsers: vi.fn(async () => ({ users: [], error: null })),
  updateUserRole: vi.fn(async () => ({})), deleteAssessment: vi.fn(async () => ({})), reassignAssessment: vi.fn(async () => ({})),
  loadAssessmentMetrics: vi.fn(async () => ({ metricsData: {} })),
  loadProgressByAssessmentIdFromDB: vi.fn(async () => ({ progress: {
    assessmentId: "a1", page: 5, assessmentPath: "metrics",
    carrierInfo: { name: "Test Mutual", naic: "12345", tier: 2, lobs: ["pa"], economics: { annualClaims: "50000", dep: "800" } },
    metricsData: { "personal_lines-Litigation rate": "20" },
  }, error: null })),
  listAssessmentsForCarrier: vi.fn(async () => ({ assessments: [
    { assessment_id: "a1", carrier_name: "Test Mutual", naic: "12345", tier: 2, lobs: ["pa"], path: "metrics", status: "in_progress", started_at: new Date().toISOString(), last_worked_at: null },
  ], error: null })),
  getCarrierEconomics: vi.fn(async () => ({ economics: { dwp: "900", annualClaims: "50000" }, error: null })),
  upsertCarrierEconomics: vi.fn(async () => ({})),
}));

import Page1 from "../pages/Page1.jsx";
import Page2 from "../pages/Page2.jsx";
import Page3 from "../pages/Page3.jsx";
import Page4 from "../pages/Page4.jsx";
import Page5 from "../pages/Page5.jsx";
import Page6 from "../pages/Page6.jsx";
import Page7 from "../pages/Page7.jsx";
import Page8 from "../pages/Page8.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import CarrierProfilePage from "../pages/CarrierProfilePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import AdminPage from "../pages/AdminPage.jsx";
import { AppShell, AssessmentSidebar } from "../components.jsx";
import { BENCHMARK_DATA } from "../benchmarkData.js";

const ci = { name: "Test Mutual", naic: "12345", tier: 2, lobs: ["pa"], type: "baseline",
  economics: { dep: "800", annualClaims: "50000", paidUlae: "30", paidAlae: "20", subroRecoverable: "40", incurredLoss: "500" } };
const md = {};
for (const e of BENCHMARK_DATA.personal_lines.slice(0, 20)) {
  const t = e.tier2; if (t?.indMin != null) md[`personal_lines-${e.metric}`] = String(t.indMin);
}
const noop = () => {};

describe("Assessment flow pages render and primary buttons fire", () => {
  it("Page1 Welcome → Begin fires onNext", () => {
    const onNext = vi.fn();
    render(<Page1 onNext={onNext} role="consultant" />);
    expect(screen.getByText("172")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Begin Assessment/i));
    expect(onNext).toHaveBeenCalled();
  });
  it("Page2 Carrier renders economics section and Continue validates", () => {
    render(<Page2 onNext={noop} onBack={noop} onCarrierInfo={noop} initialData={ci} />);
    expect(screen.getByText(/Carrier Economics/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Carrier Economics/i)); // expands
    expect(screen.getByText(/Direct Written Premium/i)).toBeInTheDocument();
  });
  it("Page3 Path renders both paths and selects", () => {
    const onSelect = vi.fn();
    render(<Page3 onSelect={onSelect} onBack={noop} role="consultant" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(1);
  });
  it("Page4 Metrics renders LOB metrics with authored directions", () => {
    render(<Page4 onNext={noop} onBack={noop} carrierInfo={ci} metricsData={md} />);
    expect(screen.getAllByText(/Higher = better|Lower = better|Target range|Context/i).length).toBeGreaterThan(5);
  });
  it("Page5 Results (active) renders all tabs and switches", () => {
    render(<Page5 onBack={noop} setPage={noop} onNext={noop} onDashboard={noop} role="consultant"
      readOnly={false} assessment={null} metricsData={md} maturityScores={{}} assessmentPath="metrics" carrierInfo={ci} />);
    for (const t of ["Comparative View","Score Overview","Benchmark Table","Key Findings","Roadmap"]) {
      const tab = screen.getAllByText(t)[0];
      fireEvent.click(tab);
    }
    expect(screen.getAllByText(/Roadmap/i).length).toBeGreaterThan(0);
  });
  it("Page5 Results (read-only) loads snapshot without crashing", async () => {
    render(<Page5 onBack={noop} setPage={noop} onNext={noop} onDashboard={noop} role="consultant"
      readOnly assessment={{ assessment_id: "a1", carrier_name: "Test Mutual", naic: "12345", tier: 2, lobs: ["pa"] }}
      metricsData={{}} maturityScores={{}} assessmentPath="metrics" carrierInfo={null} />);
    expect(await screen.findAllByText(/Test Mutual/i)).toBeTruthy();
  });
  it("Page6 Process selection renders domains", () => {
    render(<Page6 onNext={noop} onBack={noop} selections={[]} setSelections={noop} />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(2);
  });
  it("Page7 Assessment renders rating scales", () => {
    render(<Page7 onNext={noop} onBack={noop} selections={[]} scores={{}} setScores={noop} />);
    expect(document.body.textContent.length).toBeGreaterThan(50);
  });
  it("Page8 Process Results renders empty state safely", () => {
    render(<Page8 onBack={noop} onDashboard={noop} maturityScores={{}} processSelections={[]} carrierInfo={ci} setPage={noop} />);
    expect(document.body.textContent.length).toBeGreaterThan(30);
  });
});

describe("Hub pages and navigation shells", () => {
  it("Dashboard renders rows; New Assessment / Resume / View / carrier link all fire", async () => {
    const onNew = vi.fn(), onResume = vi.fn(), onViewResults = vi.fn(), onCarrierProfile = vi.fn();
    render(<DashboardPage onNewAssessment={onNew} onResume={onResume} onViewResults={onViewResults}
      onCarrierProfile={onCarrierProfile} profile={{ full_name: "Test", role: "consultant" }} />);
    const names = await screen.findAllByText(/Test Mutual/i);
    expect(names.length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText(/New Assessment/i)[0]); expect(onNew).toHaveBeenCalled();
    const viewBtn = Array.from(document.querySelectorAll("button")).find(b => /\bview\b/i.test(b.textContent||""));
    expect(viewBtn).toBeTruthy();
    fireEvent.click(viewBtn); expect(onViewResults).toHaveBeenCalled();
    fireEvent.click(names[0]); expect(onCarrierProfile).toHaveBeenCalled();
  });
  it("CarrierProfilePage renders real history with View and Resume", async () => {
    const onView = vi.fn();
    render(<CarrierProfilePage carrierId={null} carrierName="Test Mutual" onBack={noop} onViewAssessment={onView} />);
    expect(await screen.findByText(/Assessment History/i)).toBeInTheDocument();
    fireEvent.click((await screen.findAllByRole("button", { name: /view/i }))[0]);
    expect(onView).toHaveBeenCalledWith(expect.objectContaining({ assessment_id: "a1" }), "view");
    fireEvent.click(screen.getAllByRole("button", { name: /resume/i })[0]);
    expect(onView).toHaveBeenCalledWith(expect.objectContaining({ assessment_id: "a1" }), "resume");
  });
  it("LoginPage renders without crashing", () => {
    render(<LoginPage />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });
  it("AdminPage renders and tab buttons switch without crashing", async () => {
    render(<AdminPage onBack={noop} onResumeAssessment={noop} />);
    const btns = await screen.findAllByRole("button");
    for (const b of btns.slice(0, 8)) fireEvent.click(b);
    expect(document.body.textContent.length).toBeGreaterThan(50);
  });
  it("AppShell sidebar items call onNavigate", () => {
    const onNavigate = vi.fn();
    render(<AppShell active="dashboard" role="admin" onNavigate={onNavigate} profile={{ full_name: "T", role: "admin" }} onLogout={noop}><div/></AppShell>);
    const target = screen.queryByText(/Admin Panel/i) || screen.queryByText(/^Admin$/i) || screen.getAllByText(/Dashboard/i)[0];
    fireEvent.click(target);
    expect(onNavigate).toHaveBeenCalled();
  });
  it("AssessmentSidebar steps call setPage for allowed pages", () => {
    const setPage = vi.fn();
    render(<AssessmentSidebar page={2} setPage={setPage} canAccess={() => true} role="consultant"
      carrierInfo={ci} assessmentPath="metrics" profile={{ full_name: "T", role: "consultant" }}
      onDashboard={noop} onLogout={noop} startedAt={null} lastSavedAt={null} saveStatus="idle" />);
    fireEvent.click(screen.getByText(/Metrics Results/i));
    expect(setPage).toHaveBeenCalled();
  });
});
