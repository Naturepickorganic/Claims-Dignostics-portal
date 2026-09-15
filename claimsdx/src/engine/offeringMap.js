// ClaimsDx KPI-to-Offering causal map — generated from Claims_KPI_Offering_Framework_ENRICHED_v3
// 104 authored rows + 3 additions (ULAE→STP, AI-util→STP, AI-util→Clerical). Seed fits pending review.
export const OFFERING_MAP = [
  {
    "metricName": "Reserve accuracy",
    "offeringId": "intelligent-reserving",
    "offering": "Intelligent Reserving",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Technical Accuracy (Leakage)",
    "offeringId": "intelligent-reserving",
    "offering": "Intelligent Reserving",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LEAKAGE",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Accuracy of average indemnity cost estimates",
    "offeringId": "intelligent-reserving",
    "offering": "Intelligent Reserving",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Accuracy of average loss adjustment expense estimates",
    "offeringId": "intelligent-reserving",
    "offering": "Intelligent Reserving",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "PRIMARY",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Policy limit utilization rate",
    "offeringId": "intelligent-reserving",
    "offering": "Intelligent Reserving",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Litigation rate",
    "offeringId": "litigation-management",
    "offering": "Litigation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Litigation cost per claim",
    "offeringId": "litigation-management",
    "offering": "Litigation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Defense cost containment rate",
    "offeringId": "litigation-management",
    "offering": "Litigation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Allocated Loss Adjustment Expense (ALAE) per claim",
    "offeringId": "litigation-management",
    "offering": "Litigation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "EVIDENCE_ONLY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Total Loss Adjustment Expense (LAE) per claim",
    "offeringId": "litigation-management",
    "offering": "Litigation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "EVIDENCE_ONLY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to bodily injury payment",
    "offeringId": "litigation-management",
    "offering": "Litigation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial medical evaluation",
    "offeringId": "litigation-management",
    "offering": "Litigation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "WC_MEDICAL",
    "lobs": [
      "PL",
      "WC"
    ]
  },
  {
    "metricName": "Subrogation recovery rate",
    "offeringId": "subrogation-management",
    "offering": "Subrogation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "SUBRO",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Average subrogation recovery",
    "offeringId": "subrogation-management",
    "offering": "Subrogation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "SUBRO",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Subrogation Assignment Ratio",
    "offeringId": "subrogation-management",
    "offering": "Subrogation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "SUBRO",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Salvage recovery rate",
    "offeringId": "subrogation-management",
    "offering": "Subrogation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "SALVAGE",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Average salvage recovery",
    "offeringId": "subrogation-management",
    "offering": "Subrogation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "SALVAGE",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to salvage sale",
    "offeringId": "subrogation-management",
    "offering": "Subrogation Management",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "SALVAGE",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Fraud detection rate",
    "offeringId": "fraud-siu",
    "offering": "Fraud & SIU",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "FRAUD",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "SIU referral rate",
    "offeringId": "fraud-siu",
    "offering": "Fraud & SIU",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.75,
    "mappingType": "PRIMARY",
    "valuePoolId": "FRAUD",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Telematics/IoT device integration rate for claims",
    "offeringId": "fraud-siu",
    "offering": "Fraud & SIU",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "PREVENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Technical Accuracy (Leakage)",
    "offeringId": "fraud-siu",
    "offering": "Fraud & SIU",
    "theme": "SEVERITY_CONSERVATION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LEAKAGE",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Percentage of claims requiring external vendor support",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Percentage of claims using non-preferred provider organizations",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Average Preferred Provider Cost Variance (PPCV)",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Cost of using non-preferred provider organizations per claim",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "External vendor / expert opinion cost per claim",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Auto repair turnaround time",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Property restoration turnaround time",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Mitigation cost per claim",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Remote inspection completion rate",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL"
    ]
  },
  {
    "metricName": "Reinspection cost per claim",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Average length of auto rental paid",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Additional living expense (ALE) days per claim",
    "offeringId": "vendor-spend-optimization",
    "offering": "Vendor Spend Optimization",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to auto damage payment",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to initial property damage payment",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to final property damage payment",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Average length of auto rental paid",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "FNOL (First Notice of Loss) digital submission rate",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Telematics/IoT device integration rate for claims",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "PREVENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Claims resolution Customer Satisfaction (CSAT) score",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Digital claims satisfaction score",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Self-service adoption rate",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL"
    ]
  },
  {
    "metricName": "Number of claims handled per adjuster",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Claims volume",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.0,
    "mappingType": "CONTEXT_SCALE",
    "valuePoolId": "CONTEXT",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Claims volume",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.0,
    "mappingType": "CONTEXT_SCALE",
    "valuePoolId": "CONTEXT",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "CAT-related claims resolution time",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL"
    ]
  },
  {
    "metricName": "Number of claims handled per adjuster",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Claims resolution Customer Satisfaction (CSAT) score",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to auto damage payment",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to bodily injury payment",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial medical evaluation",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "WC_MEDICAL",
    "lobs": [
      "PL",
      "WC"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to final property damage payment",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to initial property damage payment",
    "offeringId": "segmentation-assignment",
    "offering": "Segmentation & Assignment",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Claims volume",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.0,
    "mappingType": "CONTEXT_SCALE",
    "valuePoolId": "CONTEXT",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to bodily injury payment",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial medical evaluation",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "WC_MEDICAL",
    "lobs": [
      "PL",
      "WC"
    ]
  },
  {
    "metricName": "Technical Accuracy (Leakage)",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "LEAKAGE",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Reinspection cost per claim",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Accuracy of average indemnity cost estimates",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Accuracy of average loss adjustment expense estimates",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Number of claims handled per adjuster",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "document-processing",
    "offering": "Document Processing",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to auto damage payment",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to initial property damage payment",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to final property damage payment",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "CAT-related claims resolution time",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL"
    ]
  },
  {
    "metricName": "Claims resolution Customer Satisfaction (CSAT) score",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Claims volume",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.0,
    "mappingType": "CONTEXT_SCALE",
    "valuePoolId": "CONTEXT",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Number of claims handled per adjuster",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Reinspection cost per claim",
    "offeringId": "proactive-qa",
    "offering": "Proactive QA",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "VENDOR_NETWORK",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Technical Accuracy (Leakage)",
    "offeringId": "proactive-qa",
    "offering": "Proactive QA",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "LEAKAGE",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Accuracy of average indemnity cost estimates",
    "offeringId": "proactive-qa",
    "offering": "Proactive QA",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Reserve accuracy",
    "offeringId": "proactive-qa",
    "offering": "Proactive QA",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "INDEMNITY_ACCURACY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Litigation rate",
    "offeringId": "proactive-qa",
    "offering": "Proactive QA",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Number of claims handled per adjuster",
    "offeringId": "draft-it-right",
    "offering": "Draft-it-right",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Number of adjusters per unit manager",
    "offeringId": "draft-it-right",
    "offering": "Draft-it-right",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Claims resolution Customer Satisfaction (CSAT) score",
    "offeringId": "draft-it-right",
    "offering": "Draft-it-right",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Technical Accuracy (Leakage)",
    "offeringId": "draft-it-right",
    "offering": "Draft-it-right",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "LEAKAGE",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to bodily injury payment",
    "offeringId": "negotiation-coaching",
    "offering": "Negotiation & Coaching",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial medical evaluation",
    "offeringId": "negotiation-coaching",
    "offering": "Negotiation & Coaching",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "WC_MEDICAL",
    "lobs": [
      "PL",
      "WC"
    ]
  },
  {
    "metricName": "Average claim severity",
    "offeringId": "negotiation-coaching",
    "offering": "Negotiation & Coaching",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "EVIDENCE_ONLY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Technical Accuracy (Leakage)",
    "offeringId": "negotiation-coaching",
    "offering": "Negotiation & Coaching",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "LEAKAGE",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Litigation rate",
    "offeringId": "negotiation-coaching",
    "offering": "Negotiation & Coaching",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Number of claims handled per adjuster",
    "offeringId": "claims-summarization-intel",
    "offering": "Claims Summarization & Intel",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Cycle time - FNOL to bodily injury payment",
    "offeringId": "claims-summarization-intel",
    "offering": "Claims Summarization & Intel",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "claims-summarization-intel",
    "offering": "Claims Summarization & Intel",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Claims volume",
    "offeringId": "claims-summarization-intel",
    "offering": "Claims Summarization & Intel",
    "theme": "ADJUSTER_EMPOWERMENT",
    "causalFit": 0.0,
    "mappingType": "CONTEXT_SCALE",
    "valuePoolId": "CONTEXT",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Self-service adoption rate",
    "offeringId": "digital-self-service",
    "offering": "Digital Self-Service",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL"
    ]
  },
  {
    "metricName": "Digital claims satisfaction score",
    "offeringId": "digital-self-service",
    "offering": "Digital Self-Service",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "FNOL (First Notice of Loss) digital submission rate",
    "offeringId": "digital-self-service",
    "offering": "Digital Self-Service",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Remote inspection completion rate",
    "offeringId": "digital-self-service",
    "offering": "Digital Self-Service",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CYCLE_ECONOMY",
    "lobs": [
      "PL"
    ]
  },
  {
    "metricName": "Telematics/IoT device integration rate for claims",
    "offeringId": "digital-self-service",
    "offering": "Digital Self-Service",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "PREVENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "digital-self-service",
    "offering": "Digital Self-Service",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "omnichannel-journeys",
    "offering": "Omnichannel Journeys",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.75,
    "mappingType": "PRIMARY",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Digital claims satisfaction score",
    "offeringId": "omnichannel-journeys",
    "offering": "Omnichannel Journeys",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "empathy-driven-interactions",
    "offering": "Empathy-Driven Interactions",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Litigation rate",
    "offeringId": "empathy-driven-interactions",
    "offering": "Empathy-Driven Interactions",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.15,
    "mappingType": "INDIRECT",
    "valuePoolId": "LITIGATION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Digital claims satisfaction score",
    "offeringId": "empathy-driven-interactions",
    "offering": "Empathy-Driven Interactions",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.4,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Digital claims satisfaction score",
    "offeringId": "real-time-status",
    "offering": "Real-Time Status",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.75,
    "mappingType": "SUPPORTING",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL"
    ]
  },
  {
    "metricName": "Time to initial response",
    "offeringId": "real-time-status",
    "offering": "Real-Time Status",
    "theme": "CUSTOMER_EXPERIENCE",
    "causalFit": 0.75,
    "mappingType": "PRIMARY",
    "valuePoolId": "CX_RETENTION",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "Unallocated Loss Adjustment Expense (ULAE) per claim",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "AI utilization in claims operations",
    "offeringId": "low-no-touch-stp",
    "offering": "Low / No-Touch & STP",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 1.0,
    "mappingType": "PRIMARY",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  },
  {
    "metricName": "AI utilization in claims operations",
    "offeringId": "clerical-automation",
    "offering": "Clerical Automation",
    "theme": "AUTOMATION_LAE_REDUCTION",
    "causalFit": 0.75,
    "mappingType": "PRIMARY",
    "valuePoolId": "HANDLING_CAPACITY",
    "lobs": [
      "PL",
      "CL",
      "WC",
      "GL"
    ]
  }
];
