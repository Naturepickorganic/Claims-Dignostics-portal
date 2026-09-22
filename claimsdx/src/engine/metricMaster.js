// ClaimsDx Metric Master — 58 metrics: direction, role, formula type, theme, value pool, parent chain
// Generated from the enriched framework Tab 2. UNMAPPED pools await tomorrow's 10-metric decision.
export const METRIC_MASTER = [
  {
    "metricId": "ai-utilization-in-claims-operations",
    "name": "AI utilization in claims operations",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PRODUCTIVITY",
    "valuePool": "HANDLING_CAPACITY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "accuracy-of-average-indemnity-cost-estimates",
    "name": "Accuracy of average indemnity cost estimates",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "INDEMNITY_ACCURACY",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "accuracy-of-average-loss-adjustment-expense-estimates",
    "name": "Accuracy of average loss adjustment expense estimates",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "INDEMNITY_ACCURACY",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "additional-living-expense-ale-days-per-claim",
    "name": "Additional living expense (ALE) days per claim",
    "units": "Days",
    "lobs": [
      "PL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "allocated-loss-adjustment-expense-alae-per-claim",
    "name": "Allocated Loss Adjustment Expense (ALAE) per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "OUTCOME",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "EVIDENCE_ONLY",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": "Total Loss Adjustment Expense (LAE) per claim"
  },
  {
    "metricId": "auto-repair-turnaround-time",
    "name": "Auto repair turnaround time",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "average-permanent-disability-settlement-cost",
    "name": "Average Permanent disability settlement cost",
    "units": "US$",
    "lobs": [
      "WC"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "average-preferred-provider-cost-variance-ppcv",
    "name": "Average Preferred Provider Cost Variance (PPCV)",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "VENDOR_NETWORK",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "average-temporary-total-disability-ttd-duration",
    "name": "Average Temporary Total Disability (TTD) duration",
    "units": "Days",
    "lobs": [
      "WC"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "average-claim-severity",
    "name": "Average claim severity",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "OUTCOME",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "EVIDENCE_ONLY",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": "Total indemnity cost per claim"
  },
  {
    "metricId": "average-length-of-auto-rental-paid",
    "name": "Average length of auto rental paid",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "average-salvage-recovery",
    "name": "Average salvage recovery",
    "units": "US$ million",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PRODUCTIVITY",
    "valuePool": "SALVAGE",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "average-subrogation-recovery",
    "name": "Average subrogation recovery",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PRODUCTIVITY",
    "valuePool": "SUBRO",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "cat-related-claims-resolution-time",
    "name": "CAT-related claims resolution time",
    "units": "Days",
    "lobs": [
      "PL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "claims-frequency",
    "name": "Claims frequency",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "CONTEXT_ONLY",
    "role": "CONTEXT",
    "formulaType": "CONTEXT_ONLY",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "claims-resolution-customer-satisfaction-csat-score",
    "name": "Claims resolution Customer Satisfaction (CSAT) score",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "OUTCOME",
    "formulaType": "CUSTOMER",
    "valuePool": "CX_RETENTION",
    "primaryTheme": "CUSTOMER_EXPERIENCE",
    "parentName": null
  },
  {
    "metricId": "claims-volume",
    "name": "Claims volume",
    "units": "Number",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "CONTEXT_ONLY",
    "role": "CONTEXT",
    "formulaType": "CONTEXT_ONLY",
    "valuePool": "CONTEXT",
    "primaryTheme": "CONTEXT",
    "parentName": null
  },
  {
    "metricId": "client-retention-rate-post-claim",
    "name": "Client retention rate post claim",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "OUTCOME",
    "formulaType": "CUSTOMER",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "cost-of-using-non-preferred-provider-organizations-per-claim",
    "name": "Cost of using non-preferred provider organizations per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "VENDOR_NETWORK",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "cycle-time-fnol-to-auto-damage-payment",
    "name": "Cycle time - FNOL to auto damage payment",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "cycle-time-fnol-to-bodily-injury-payment",
    "name": "Cycle time - FNOL to bodily injury payment",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "LITIGATION",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "cycle-time-fnol-to-closure",
    "name": "Cycle time - FNOL to closure",
    "units": "Days",
    "lobs": [
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "cycle-time-fnol-to-final-property-damage-payment",
    "name": "Cycle time - FNOL to final property damage payment",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "cycle-time-fnol-to-initial-property-damage-payment",
    "name": "Cycle time - FNOL to initial property damage payment",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "cycle-time-fnol-to-salvage-sale",
    "name": "Cycle time - FNOL to salvage sale",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "SALVAGE",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "defense-cost-containment-rate",
    "name": "Defense cost containment rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "LITIGATION",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "digital-claims-satisfaction-score",
    "name": "Digital claims satisfaction score",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "CUSTOMER",
    "valuePool": "CX_RETENTION",
    "primaryTheme": "CUSTOMER_EXPERIENCE",
    "parentName": null
  },
  {
    "metricId": "external-vendor-expert-opinion-cost-per-claim",
    "name": "External vendor / expert opinion cost per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "VENDOR_NETWORK",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "fnol-first-notice-of-loss-digital-submission-rate",
    "name": "FNOL (First Notice of Loss) digital submission rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "CUSTOMER",
    "valuePool": "CX_RETENTION",
    "primaryTheme": "CUSTOMER_EXPERIENCE",
    "parentName": null
  },
  {
    "metricId": "fraud-detection-rate",
    "name": "Fraud detection rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "FRAUD",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "liability-assessment-accuracy-rate",
    "name": "Liability assessment accuracy rate",
    "units": "Percentage",
    "lobs": [
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "litigation-cost-per-claim",
    "name": "Litigation cost per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "LITIGATION",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "litigation-rate",
    "name": "Litigation rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "LITIGATION",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "loss-ratio",
    "name": "Loss ratio",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "OUTCOME",
    "formulaType": "LOSS_RATIO",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "mitigation-cost-per-claim",
    "name": "Mitigation cost per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "VENDOR_NETWORK",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "number-of-adjusters-per-unit-manager",
    "name": "Number of adjusters per unit manager",
    "units": "Number",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "TARGET_RANGE",
    "role": "DRIVER",
    "formulaType": "PRODUCTIVITY",
    "valuePool": "HANDLING_CAPACITY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "number-of-claims-handled-per-adjuster",
    "name": "Number of claims handled per adjuster",
    "units": "Number",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "TARGET_RANGE",
    "role": "DRIVER",
    "formulaType": "PRODUCTIVITY",
    "valuePool": "HANDLING_CAPACITY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "percentage-of-claims-requiring-external-vendor-support",
    "name": "Percentage of claims requiring external vendor support",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "VENDOR_NETWORK",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "percentage-of-claims-using-non-preferred-provider-organizations",
    "name": "Percentage of claims using non-preferred provider organizations",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "VENDOR_NETWORK",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "policy-limit-utilization-rate",
    "name": "Policy limit utilization rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "TARGET_RANGE",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "INDEMNITY_ACCURACY",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "property-restoration-turnaround-time",
    "name": "Property restoration turnaround time",
    "units": "Days",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "reinspection-cost-per-claim",
    "name": "Reinspection cost per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "VENDOR_NETWORK",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "remote-inspection-completion-rate",
    "name": "Remote inspection completion rate",
    "units": "Percentage",
    "lobs": [
      "PL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "CUSTOMER",
    "valuePool": "CYCLE_ECONOMY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": null
  },
  {
    "metricId": "reserve-accuracy",
    "name": "Reserve accuracy",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "INDEMNITY_ACCURACY",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "return-to-work-rtw-success-rate",
    "name": "Return To Work (RTW) success rate",
    "units": "Percentage",
    "lobs": [
      "WC"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "siu-referral-rate",
    "name": "SIU referral rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "FRAUD",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "salvage-recovery-rate",
    "name": "Salvage recovery rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "RECOVERY_RATE",
    "valuePool": "SALVAGE",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "self-service-adoption-rate",
    "name": "Self-service adoption rate",
    "units": "Percentage",
    "lobs": [
      "PL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "CUSTOMER",
    "valuePool": "CX_RETENTION",
    "primaryTheme": "CUSTOMER_EXPERIENCE",
    "parentName": null
  },
  {
    "metricId": "subrogation-assignment-ratio",
    "name": "Subrogation Assignment Ratio",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "RECOVERY_RATE",
    "valuePool": "SUBRO",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "subrogation-recovery-rate",
    "name": "Subrogation recovery rate",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "RECOVERY_RATE",
    "valuePool": "SUBRO",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "technical-accuracy-leakage",
    "name": "Technical Accuracy (Leakage)",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "PERCENTAGE_DRIVER",
    "valuePool": "LEAKAGE",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "telematics-iot-device-integration-rate-for-claims",
    "name": "Telematics/IoT device integration rate for claims",
    "units": "Percentage",
    "lobs": [
      "PL",
      "CL"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "CUSTOMER",
    "valuePool": "PREVENTION",
    "primaryTheme": "CUSTOMER_EXPERIENCE",
    "parentName": null
  },
  {
    "metricId": "telemedicine-utilization-rate",
    "name": "Telemedicine utilization rate",
    "units": "Percentage",
    "lobs": [
      "WC"
    ],
    "direction": "LOW_BAD",
    "role": "DRIVER",
    "formulaType": "CUSTOMER",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": null
  },
  {
    "metricId": "time-to-initial-medical-evaluation",
    "name": "Time to initial medical evaluation",
    "units": "Days",
    "lobs": [
      "PL",
      "WC"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CYCLE_TIME",
    "valuePool": "WC_MEDICAL",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": null
  },
  {
    "metricId": "time-to-initial-response",
    "name": "Time to initial response",
    "units": "Days",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "DRIVER",
    "formulaType": "CUSTOMER",
    "valuePool": "CX_RETENTION",
    "primaryTheme": "CUSTOMER_EXPERIENCE",
    "parentName": null
  },
  {
    "metricId": "total-loss-adjustment-expense-lae-per-claim",
    "name": "Total Loss Adjustment Expense (LAE) per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "OUTCOME",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "EVIDENCE_ONLY",
    "primaryTheme": "SEVERITY_CONSERVATION",
    "parentName": "Loss ratio"
  },
  {
    "metricId": "total-indemnity-cost-per-claim",
    "name": "Total indemnity cost per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "OUTCOME",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "UNMAPPED",
    "primaryTheme": "REVIEW",
    "parentName": "Loss ratio"
  },
  {
    "metricId": "unallocated-loss-adjustment-expense-ulae-per-claim",
    "name": "Unallocated Loss Adjustment Expense (ULAE) per claim",
    "units": "US$",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ],
    "direction": "HIGH_BAD",
    "role": "OUTCOME",
    "formulaType": "PER_CLAIM_COST",
    "valuePool": "HANDLING_CAPACITY",
    "primaryTheme": "AUTOMATION_LAE_REDUCTION",
    "parentName": "Total Loss Adjustment Expense (LAE) per claim"
  }
];
export const METRIC_BY_NAME = Object.fromEntries(METRIC_MASTER.map(m => [m.name, m]));
