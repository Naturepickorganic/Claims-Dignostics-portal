import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("../AppContext.jsx", () => ({
  useApp: () => ({ completeAssessment: vi.fn(async () => ({})), benchmarkOverrides: {} }),
}));

import Page5 from "../pages/Page5.jsx";
import { BENCHMARK_DATA } from "../benchmarkData.js";

// Active-session props exactly as App passes them after Page4
const carrierInfo = {
  name: "Test Mutual", naic: "12345", tier: 2, lobs: ["pa", "ph"], type: "baseline",
  economics: { dep: "1200", annualClaims: "85000", paidAlae: "25", paidUlae: "54", subroRecoverable: "60", incurredLoss: "800", adjusterCount: "400", loadedFteCost: "85000", productiveHours: "1700", rentalCostDay: "45", aleCostDay: "150", costPerCall: "6.50" },
};
const metricsData = {};
for (const e of BENCHMARK_DATA.personal_lines.slice(0, 30)) {
  const t = e.tier2 || e.tier1;
  if (t?.indMin != null) metricsData[`personal_lines-${e.metric}`] = String(t.indMin);
}

describe("Page5 active mode after metrics", () => {
  it("renders without crashing", () => {
    render(
      <Page5
        onBack={()=>{}} setPage={()=>{}} onNext={()=>{}} onDashboard={()=>{}}
        role="consultant" readOnly={false} assessment={null}
        metricsData={metricsData} maturityScores={{}} assessmentPath="metrics"
        carrierInfo={carrierInfo}
      />
    );
    expect(screen.getAllByText(/Benchmark|Comparative|Roadmap/i).length).toBeGreaterThan(0);
  });
});
