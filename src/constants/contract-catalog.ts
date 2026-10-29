import {
  AiAnalysisJob,
  CivoraNotification,
  CivoraReport,
  EngineeringTask,
  EngineerReportDraft,
  FieldSubmissionRecord,
  MilestoneItem,
  ProjectContact,
  ProjectDocument,
  ProjectSummary,
  ReportTemplate,
  StakeholderPublishedUpdate,
  StakeholderRiskItem,
} from "@/types/contracts";

export const CONTRACT_PROJECTS: ProjectSummary[] = [
  {
    id: "proj_horizon_tower",
    code: "LAMATA-BL2",
    name: "Lagos Rail Mass Transit (Blue Line) — Viaduct & Station",
    location: "Marina — Mile 2 — Okokomaiko Corridor, Lagos",
    status: "active",
    completionPercent: 68,
    updatedAtIso: "2026-10-28T09:40:00.000Z",
    phaseLabel: "Viaduct Pier Cap & Concourse Deck Sign-Off",
    clientOrganization: "Lagos Metropolitan Area Transport Authority (LAMATA)",
    metricExplanation:
      "Weighted physical completion verified across piling & substructure (100%), viaduct pier caps P1–P18 (78%), and concourse MEP rough-in (42%) per FMWH Civil Standard & BS 8110.",
  },
  {
    id: "proj_metro_bridge",
    code: "EKO-REVET",
    name: "Eko Atlantic Coastal Revetment & Great Wall Defense",
    location: "Victoria Island Coastal Shoreline, Lagos",
    status: "active",
    completionPercent: 44,
    updatedAtIso: "2026-10-27T16:15:00.000Z",
    phaseLabel: "Primary Accropode Armor Unit Placement",
    clientOrganization: "South Energyx Nigeria / Lagos State Ministry of Works",
    metricExplanation:
      "Calculated from verified geotextile core placement (100%) and coastal armor unit interlocking checks (BS 6349 Maritime Structures).",
  },
  {
    id: "proj_restricted_tunnel",
    code: "LEKKI-PORT2",
    name: "Lekki Deep Sea Port — Quay Wall & Breakwater Extension",
    location: "Lekki Free Trade Zone, Ibeju-Lekki, Lagos",
    status: "planning",
    completionPercent: 82,
    updatedAtIso: "2026-10-25T09:00:00.000Z",
    phaseLabel: "PIANC Maritime Guidelines & ASTM A615 Verification",
    clientOrganization: "Lekki Port LFTZ Enterprise / NPA",
    metricExplanation: "Quay wall tubular pile driving and tie-rod tensioning verification.",
  },
];

export const CONTRACT_PROJECT_CONTACTS: ProjectContact[] = [
  {
    id: "cnt_01",
    projectId: "proj_horizon_tower",
    fullName: "Engr. Marcus Vance, PE (COREN Reg.)",
    roleTitle: "Senior Structural Project Engineer",
    organization: "Civora Infrastructure Ltd",
    email: "engineer@civora.internal",
    sharedWithStakeholders: true,
  },
  {
    id: "cnt_02",
    projectId: "proj_horizon_tower",
    fullName: "Engr. Tunde Adeyemi",
    roleTitle: "Senior Structural QA Engineer (WhatsApp Verified)",
    organization: "Apex Concrete QA Lab",
    email: "tunde.adeyemi@apexqa.ng",
    sharedWithStakeholders: true,
  },
  {
    id: "cnt_03",
    projectId: "proj_horizon_tower",
    fullName: "Musa Ibrahim",
    roleTitle: "Internal Rebar Subcontractor Foreman (Internal Only)",
    organization: "SteelForm Contractors",
    email: "m.ibrahim@steelform.invalid",
    sharedWithStakeholders: false,
  },
  {
    id: "cnt_04",
    projectId: "proj_metro_bridge",
    fullName: "Chidinma Okafor",
    roleTitle: "Lead Geotechnical Monitoring Specialist",
    organization: "GeoTech Analytical Services Ltd",
    email: "chidinma.okafor@geotech.ng",
    sharedWithStakeholders: true,
  },
];

export const CONTRACT_DOCUMENTS: ProjectDocument[] = [
  {
    id: "doc_ht_spec_01",
    projectId: "proj_horizon_tower",
    title: "FMWH Civil Infrastructure Standard & BS 8110 Concrete Mix Spec",
    category: "specification",
    versionLabel: "v3.2",
    sizeBytes: 2_450_000,
    updatedAtIso: "2026-10-15T10:00:00.000Z",
    releasedToStakeholders: true,
    downloadPath: "/v1/projects/proj_horizon_tower/documents/doc_ht_spec_01/download",
  },
  {
    id: "doc_ht_cert_02",
    projectId: "proj_horizon_tower",
    title: "Dangote 42.5R Batch Cube Crushing Certificate & Kamsteel 460 Mill Cert",
    category: "inspection_certificate",
    versionLabel: "v1.0",
    sizeBytes: 1_180_000,
    updatedAtIso: "2026-10-22T14:20:00.000Z",
    releasedToStakeholders: true,
    downloadPath: "/v1/projects/proj_horizon_tower/documents/doc_ht_cert_02/download",
  },
  {
    id: "doc_ht_internal_03",
    projectId: "proj_horizon_tower",
    title: "Internal Falsework Shoring Redline Markup — Pier P14",
    category: "drawing",
    versionLabel: "v0.9-draft",
    sizeBytes: 5_120_000,
    updatedAtIso: "2026-10-27T08:00:00.000Z",
    releasedToStakeholders: false,
    downloadPath: "/v1/projects/proj_horizon_tower/documents/doc_ht_internal_03/download",
  },
];

export const CONTRACT_MILESTONES: MilestoneItem[] = [
  {
    id: "ms_ht_01",
    projectId: "proj_horizon_tower",
    title: "Marina Viaduct Bored Pile & Pile Cap Sign-Off",
    dueDateIso: "2026-08-15",
    status: "completed",
    progressPercent: 100,
    approvedForStakeholders: true,
  },
  {
    id: "ms_ht_02",
    projectId: "proj_horizon_tower",
    title: "Concourse Deck C30/37 Pour & LASBCA Stage 2 Verification",
    dueDateIso: "2026-11-30",
    status: "in_progress",
    progressPercent: 68,
    approvedForStakeholders: true,
  },
  {
    id: "ms_ht_03",
    projectId: "proj_horizon_tower",
    title: "Track Plinth & Acoustic Barrier Installation — Mile 2 Span",
    dueDateIso: "2026-12-20",
    status: "upcoming",
    progressPercent: 20,
    approvedForStakeholders: true,
  },
  {
    id: "ms_mb_01",
    projectId: "proj_metro_bridge",
    title: "Eko Atlantic Phase 2 Coastal Revetment Toe-Trench Armouring",
    dueDateIso: "2026-11-12",
    status: "in_progress",
    progressPercent: 44,
    approvedForStakeholders: true,
  },
];

export const CONTRACT_TASKS: EngineeringTask[] = [
  {
    id: "tsk_01",
    projectId: "proj_horizon_tower",
    title: "TSK-LAMATA-401: Foundation Pour Card C30/37 Deck Sign-Off",
    description:
      "Perform pre-pour caliper check on Kamsteel 460 T25 starter bars at Concourse Grid B2–B6 and verify LASBCA Stage 2 notice.",
    assignedToName: "Marcus Vance, PE",
    priority: "critical",
    status: "in_progress",
    dueAtIso: "2026-10-29T17:00:00.000Z",
  },
  {
    id: "tsk_02",
    projectId: "proj_horizon_tower",
    title: "TSK-LAMATA-402: Dangote 42.5R 7-Day Cube Crushing Verification",
    description:
      "Validate accredited laboratory compressive strength certificate for batch #LAM-108 (target ≥ 37 MPa).",
    assignedToName: "Marcus Vance, PE",
    priority: "high",
    status: "todo",
    dueAtIso: "2026-10-30T12:00:00.000Z",
  },
  {
    id: "tsk_03",
    projectId: "proj_metro_bridge",
    title: "TSK-EKO-112: Soil Compaction Plate Load Test (Coastal Silt)",
    description:
      "Review geotechnical settlement log from GeoTech Analytical Services for Sector 4 revetment.",
    assignedToName: "Marcus Vance, PE",
    priority: "medium",
    status: "completed",
    dueAtIso: "2026-10-25T16:00:00.000Z",
  },
];

export const CONTRACT_CONFIRMED_SUBMISSIONS: FieldSubmissionRecord[] = [
  {
    id: "sub_srv_901",
    clientSubmissionId: "#SUB-2319",
    projectId: "proj_horizon_tower",
    title: "Foundation pour card C30/37 deck sign-off",
    category: "structural",
    notes:
      "All 24 post-tensioned tendons stressed to 75% GUTS; Kamsteel 460 rebar lap splice and cover depth verified per BS 8110. Ingested via Civora Field Portal.",
    submittedByUserId: "usr_eng_preview_01",
    submittedAtIso: "2026-10-26T15:10:00.000Z",
    serverVersion: 2,
    status: "approved",
  },
  {
    id: "sub_srv_902",
    clientSubmissionId: "#SUB-2320",
    projectId: "proj_horizon_tower",
    title: "Rebar tensile strength test cert (Kamsteel 460)",
    category: "materials",
    notes:
      "Yield strength verified at 478 MPa (spec minimum 460 MPa). LASBCA Stage 2 structural notice acknowledged.",
    submittedByUserId: "usr_eng_preview_01",
    submittedAtIso: "2026-10-27T09:45:00.000Z",
    serverVersion: 1,
    status: "received",
  },
];

export const CONTRACT_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "tpl_weekly_progress",
    name: "Weekly Engineering Progress & Statutory QA Report",
    category: "weekly_progress",
    description:
      "Structured weekly dossier covering structural progress, cube/rebar QA/QC inspections, HSE metrics, and COREN/LASBCA compliance.",
    sections: [
      {
        id: "sec_exec",
        heading: "1. Executive Construction Summary",
        promptHint: "Summarize key physical progress achieved during the period.",
        required: true,
      },
      {
        id: "sec_qaqc",
        heading: "2. Structural & Materials QA/QC Verification",
        promptHint: "Detail concrete pours, rebar inspections, and test cylinder results.",
        required: true,
      },
      {
        id: "sec_hse",
        heading: "3. Site Health, Safety & Environmental (HSE) Log",
        promptHint: "Document safety walks, crane checks, and EIA outfall compliance.",
        required: true,
      },
    ],
  },
  {
    id: "tpl_structural_qa",
    name: "COREN / LASBCA Structural Milestone Sign-Off Dossier",
    category: "structural_qa",
    description:
      "Formal statutory engineering sign-off package for critical structural elements and viaduct spans.",
    sections: [
      {
        id: "sec_scope",
        heading: "1. Inspected Structural Elements & Grid References",
        promptHint: "List levels, pier numbers, and applicable FMWH/BS 8110 drawings.",
        required: true,
      },
      {
        id: "sec_compliance",
        heading: "2. Dimensional & Material Compliance Findings",
        promptHint: "Reference verified field submissions and lab certificates.",
        required: true,
      },
    ],
  },
];

export const CONTRACT_INITIAL_REPORT_DRAFTS: EngineerReportDraft[] = [
  {
    id: "drf_rep_ht_w43",
    projectId: "proj_horizon_tower",
    templateId: "tpl_weekly_progress",
    title: "LAMATA Blue Line — Weekly Engineering & QA Report (W43)",
    reportingPeriod: "2026-W43 (Oct 20 – Oct 27)",
    executiveSummary:
      "Marina–Mile 2 viaduct pier caps advanced to 68% overall completion; Concourse C30/37 pour card #SUB-2319 approved with zero non-conformances.",
    sections: [
      {
        sectionId: "sec_exec",
        heading: "1. Executive Construction Summary",
        body: "Viaduct pier caps P12–P16 completed on schedule. WhatsApp & Telegram field gateways ingested 704 verified site records this week.",
        sourceSubmissionIds: ["sub_srv_901", "sub_srv_902"],
      },
      {
        sectionId: "sec_qaqc",
        heading: "2. Structural & Materials QA/QC Verification",
        body: "Kamsteel 460 rebar tensile test (#SUB-2320) verified at 478 MPa. Concourse deck C30/37 pour card (#SUB-2319) signed off.",
        sourceSubmissionIds: ["sub_srv_901"],
        completenessWarning:
          "Missing 28-day Dangote 42.5R cube crushing certificate attachment for Pier P14 pour batch #LAM-108.",
      },
      {
        sectionId: "sec_hse",
        heading: "3. Site Health, Safety & Environmental (HSE) Log",
        body: "Zero LTI recorded across 18,400 person-hours. EIA drainage outfall compliance verification completed.",
        sourceSubmissionIds: ["sub_srv_902"],
      },
    ],
    syncState: "saved_on_device",
    reviewStatus: "draft",
    reviewerComments: [
      "Lead Engineer Note: Link the 7-day Dangote 42.5R cube crushing log once Task tsk_02 is completed before releasing to LAMATA stakeholders.",
    ],
    updatedAtIso: "2026-10-28T07:30:00.000Z",
  },
];

export const CONTRACT_REPORTS: CivoraReport[] = [
  {
    id: "rep_rel_horizon_q3",
    projectId: "proj_horizon_tower",
    title: "REP-2026-Q3-04: LAMATA Blue Line — Viaduct & Concourse Verification",
    summary:
      "Independent COREN engineering verification confirming C30/37 deck curing, Kamsteel 460 rebar tensile compliance, and LASBCA Stage 2 sign-off.",
    periodLabel: "2026-Q3 / Oct Release",
    visibilityStatus: "released",
    version: 3,
    releasedAtIso: "2026-10-20T14:30:00.000Z",
    downloadUrl: "/v1/reports/rep_rel_horizon_q3/download",
  },
  {
    id: "rep_rel_horizon_q2",
    projectId: "proj_horizon_tower",
    title: "REP-2026-Q2-03: Marina Station Bored Piling & Substructure Dossier",
    summary:
      "Archive release covering sonic logging of 64 bored piles and pile cap load transfer verification.",
    periodLabel: "2026-Q2 Archive",
    visibilityStatus: "released",
    version: 2,
    releasedAtIso: "2026-08-18T11:00:00.000Z",
    downloadUrl: "/v1/reports/rep_rel_horizon_q2/download",
  },
  {
    id: "rep_draft_horizon_internal",
    projectId: "proj_horizon_tower",
    title: "Internal Field Notes — Falsework Adjustment (Unreleased Draft)",
    summary: "Internal engineering working draft; not released to stakeholders.",
    periodLabel: "2026-W43 Internal",
    visibilityStatus: "draft",
    version: 1,
    releasedAtIso: null,
    downloadUrl: null,
  },
  {
    id: "rep_rel_unassigned_project",
    projectId: "proj_restricted_tunnel",
    title: "Restricted Port Project — Executive Report",
    summary: "Belongs to a project outside the stakeholder's assigned scope.",
    periodLabel: "2026-Q3",
    visibilityStatus: "released",
    version: 2,
    releasedAtIso: "2026-10-18T09:00:00.000Z",
    downloadUrl: "/v1/reports/rep_rel_unassigned_project/download",
  },
];

export const CONTRACT_AI_ANALYSIS_JOB: AiAnalysisJob = {
  jobId: "ai_job_lamata_w43_01",
  submissionId: "sub_srv_901",
  projectId: "proj_horizon_tower",
  reportId: "drf_rep_ht_w43",
  status: "completed",
  createdAtIso: "2026-10-28T07:15:00.000Z",
  completedAtIso: "2026-10-28T07:15:18.000Z",
  suggestions: [
    {
      id: "sug_qaqc_pt_summary",
      field: "sec_qaqc",
      suggestedText:
        "Concourse deck pour card (#SUB-2319) and Kamsteel 460 tensile test (#SUB-2320, 478 MPa yield) satisfy BS 8110 and FMWH structural tolerances with 92% specification compliance.",
      confidenceScore: 0.95,
      rationale:
        "Synthesizes verified field measurements from approved submissions #SUB-2319 and #SUB-2320 with explicit BS 8110 tolerance.",
      sourceReferences: ["sub_srv_901", "sub_srv_902", "doc_ht_cert_02"],
      accepted: null,
    },
    {
      id: "sug_hse_crane",
      field: "sec_hse",
      suggestedText:
        "EIA drainage outfall compliance (#SUB-2321) and LASBCA Stage 2 statutory inspection notices are verified with zero outstanding HSE stop-work orders.",
      confidenceScore: 0.91,
      rationale:
        "Links statutory permit and environmental records directly to the weekly HSE section.",
      sourceReferences: ["sub_srv_902"],
      accepted: null,
    },
  ],
  gapsAndConflicts: [
    {
      id: "gap_l14_rebar",
      type: "missing_evidence",
      severity: "warning",
      description:
        "28-day Dangote 42.5R concrete cube crushing certificate (Task tsk_02) has not yet been attached for Pier P14 batch #LAM-108.",
      sourceSubmissionIds: ["sub_srv_901"],
    },
    {
      id: "conf_slump_reading",
      type: "conflicting_measurement",
      severity: "critical",
      description:
        "Advisory Discrepancy: Batch delivery ticket #LAM-108 lists concrete slump as 110mm, whereas WhatsApp field note recorded 135mm. Engineer verification required.",
      sourceSubmissionIds: ["sub_srv_901"],
    },
  ],
};

export const CONTRACT_STAKEHOLDER_UPDATES: StakeholderPublishedUpdate[] = [
  {
    id: "upd_ht_101",
    projectId: "proj_horizon_tower",
    title: "Concourse C30/37 Deck Sign-Off & LASBCA Stage 2 Verification",
    category: "progress_update",
    summary:
      "Structural engineering leadership has released the Marina Concourse deck verification and confirmed 68% overall corridor progress.",
    body: "Following independent inspection of Kamsteel 460 reinforcement and Dangote 42.5R cube strength logs, the Marina Concourse deck is signed off for full construction loading. Viaduct spans are advancing on schedule toward the November 30 milestone.",
    publishedBy: "Engr. Marcus Vance, PE (Senior Structural Project Engineer)",
    publishedAtIso: "2026-10-27T17:00:00.000Z",
    attachmentDocumentIds: ["doc_ht_cert_02"],
  },
  {
    id: "upd_ht_102",
    projectId: "proj_horizon_tower",
    title: "LAMATA Stakeholder Joint Site Walk & Milestone Review",
    category: "schedule_notice",
    summary:
      "Joint executive inspection of Mile 2 viaduct pier caps scheduled for November 8 with full QA dossier access.",
    body: "Authorized stakeholders from LAMATA and oversight partners are invited to review the released structural QA specification (doc_ht_spec_01) ahead of the November 8 corridor walkthrough.",
    publishedBy: "Civora Project Controls Office",
    publishedAtIso: "2026-10-24T12:30:00.000Z",
    attachmentDocumentIds: ["doc_ht_spec_01"],
  },
];

export const CONTRACT_STAKEHOLDER_RISKS: StakeholderRiskItem[] = [
  {
    id: "rsk_01",
    projectId: "proj_horizon_tower",
    title: "Coastal Heavy Rainfall Window — Marina Concourse Pour Scheduling",
    severity: "moderate",
    mitigationSummary:
      "Weather-window telemetry and curing tarpaulin enclosures deployed across Spans 12–16; 10-day schedule buffer maintained.",
    status: "monitoring",
    releasedToStakeholders: true,
    updatedAtIso: "2026-10-25T10:00:00.000Z",
  },
  {
    id: "rsk_02_internal",
    projectId: "proj_horizon_tower",
    title: "Internal Subcontractor Shift Handover Adjustment (Internal Only)",
    severity: "low",
    mitigationSummary: "Internal crew rostering note; not a stakeholder-released risk.",
    status: "mitigated",
    releasedToStakeholders: false,
    updatedAtIso: "2026-10-26T10:00:00.000Z",
  },
];

export const CONTRACT_NOTIFICATIONS: CivoraNotification[] = [
  {
    id: "ntf_eng_01",
    title: "SLA Alert (2h left): #SUB-2319 Foundation Pour Card",
    body: "Task TSK-LAMATA-401 on Lagos Rail Mass Transit (Blue Line) requires sign-off before concourse concrete placement.",
    category: "task_assigned",
    deepLinkPath: "/(engineer)/tasks/tsk_01",
    read: false,
    audience: "engineer",
    createdAtIso: "2026-10-28T06:30:00.000Z",
  },
  {
    id: "ntf_eng_02",
    title: "AI Report Synthesis Ready — LAMATA Blue Line W43",
    body: "2 section proposals and 1 slump measurement discrepancy are ready for your engineering review.",
    category: "ai_complete",
    deepLinkPath: "/(engineer)/reports/drf_rep_ht_w43/ai-analysis",
    read: false,
    audience: "engineer",
    createdAtIso: "2026-10-28T07:15:20.000Z",
  },
  {
    id: "ntf_stk_01",
    title: "Released Report: REP-2026-Q3-04 Viaduct Verification",
    body: "LAMATA Blue Line Report #04 (v3) has been officially released by Marcus Vance, PE for stakeholder review.",
    category: "report_released",
    deepLinkPath: "/(stakeholder)/reports/rep_rel_horizon_q3",
    read: false,
    audience: "stakeholder",
    createdAtIso: "2026-10-20T14:35:00.000Z",
  },
];

export const WEEKLY_SUBMITTAL_VOLUME = [
  { day: "Sun", shortDay: "S", dateNum: "25", value: 420, percent: 52 },
  { day: "Mon", shortDay: "M", dateNum: "26", value: 530, percent: 66 },
  { day: "Tue", shortDay: "T", dateNum: "27", value: 584, percent: 73 },
  { day: "Wed", shortDay: "W", dateNum: "28", value: 642, percent: 88, isToday: true },
  { day: "Thu", shortDay: "T", dateNum: "29", value: 620, percent: 78 },
  { day: "Fri", shortDay: "F", dateNum: "30", value: 540, percent: 68 },
  { day: "Sat", shortDay: "S", dateNum: "31", value: 460, percent: 58 },
] as const;
