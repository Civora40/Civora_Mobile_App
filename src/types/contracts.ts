/**
 * Civora Mobile — Domain & API Contract Types
 *
 * IMPORTANT: Role-based navigation improves UX only; the Civora backend must
 * authorize every operation, project access, submission mutation, and document download.
 */

export type CivoraRole = "engineer" | "stakeholder";

export type CivoraPermission =
  | "workspace:engineer"
  | "workspace:stakeholder"
  | "projects:read"
  | "submissions:create"
  | "submissions:read"
  | "uploads:create"
  | "reports:draft"
  | "reports:submit_review"
  | "reports:read_released"
  | "ai_analysis:request"
  | "ai_analysis:accept_suggestion"
  | "tasks:update"
  | "documents:download_released"
  | "updates:read_published"
  | "risks:read_released";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  organizationName: string;
  /**
   * Primary workspace role derived from backend permissions.
   * Client routing uses `permissions` from `/v1/auth/me` or session payload as authority.
   */
  role: CivoraRole;
  permissions: CivoraPermission[];
  assignedProjectIds: string[];
}

export interface AuthSessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresAtIso: string;
}

export interface AuthSessionResponse {
  user: AuthenticatedUser;
  tokens: AuthSessionTokens;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  nextCursor: string | null;
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
  search?: string;
}

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  location: string;
  status: ProjectStatus;
  completionPercent: number;
  updatedAtIso: string;
  metricExplanation?: string;
  phaseLabel?: string;
  clientOrganization?: string;
}

export interface ProjectContact {
  id: string;
  projectId: string;
  fullName: string;
  roleTitle: string;
  organization: string;
  email: string;
  sharedWithStakeholders: boolean;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  category: "specification" | "drawing" | "inspection_certificate" | "report_pdf";
  versionLabel: string;
  sizeBytes: number;
  updatedAtIso: string;
  releasedToStakeholders: boolean;
  downloadPath: string;
}

/**
 * Truthful client-side and server-side states for field submissions and evidence uploads.
 * "saved_on_device" MUST NEVER be presented as "submitted_to_civora".
 */
export type SubmissionSyncState =
  | "saved_on_device"
  | "pending_upload"
  | "uploading"
  | "failed"
  | "conflict"
  | "submitted_to_civora";

export interface EvidenceAttachment {
  clientAttachmentId: string;
  localUri: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  caption?: string;
  uploadState: "pending" | "uploading" | "failed" | "succeeded";
  progressPercent: number;
  serverFileId?: string;
  errorMessage?: string;
}

export interface FieldSubmissionDraft {
  clientSubmissionId: string;
  idempotencyKey: string;
  projectId: string;
  title: string;
  category: "structural" | "safety" | "electrical" | "materials" | "general";
  notes: string;
  locationTag?: string;
  attachments: EvidenceAttachment[];
  syncState: SubmissionSyncState;
  baseServerVersion?: number;
  revisionOfSubmissionId?: string;
  lastSavedAtIso: string;
  lastErrorMessage?: string;
}

export interface FieldSubmissionRecord {
  id: string;
  clientSubmissionId: string;
  projectId: string;
  title: string;
  category: "structural" | "safety" | "electrical" | "materials" | "general";
  notes: string;
  submittedByUserId: string;
  submittedAtIso: string;
  serverVersion: number;
  status: "received" | "under_review" | "approved" | "flagged";
}

export type ReportVisibilityStatus = "draft" | "internal_review" | "released";

export interface CivoraReport {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  periodLabel?: string;
  visibilityStatus: ReportVisibilityStatus;
  version: number;
  releasedAtIso: string | null;
  downloadUrl: string | null;
}

export interface ReportTemplateSectionSpec {
  id: string;
  heading: string;
  promptHint: string;
  required: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  category: "weekly_progress" | "structural_qa" | "safety_audit" | "executive_milestone";
  description: string;
  sections: ReportTemplateSectionSpec[];
}

export interface ReportSectionDraft {
  sectionId: string;
  heading: string;
  body: string;
  sourceSubmissionIds: string[];
  completenessWarning?: string;
}

export interface EngineerReportDraft {
  id: string;
  projectId: string;
  templateId: string;
  title: string;
  reportingPeriod: string;
  executiveSummary: string;
  sections: ReportSectionDraft[];
  syncState: "saved_on_device" | "submitted_for_review";
  reviewStatus: "draft" | "pending_review" | "changes_requested" | "approved_for_release";
  reviewerComments?: string[];
  updatedAtIso: string;
}

export type AiJobStatus = "queued" | "processing" | "completed" | "failed";

export interface AiSuggestionItem {
  id: string;
  field: string;
  suggestedText: string;
  confidenceScore: number;
  rationale: string;
  sourceReferences?: string[];
  /**
   * null = unreviewed proposal; true = accepted by engineer; false = discarded by engineer.
   * AI cannot auto-approve or release a report.
   */
  accepted: boolean | null;
}

export interface AiAnalysisGapOrConflict {
  id: string;
  type: "missing_evidence" | "conflicting_measurement";
  severity: "warning" | "critical";
  description: string;
  sourceSubmissionIds: string[];
}

export interface AiAnalysisJob {
  jobId: string;
  submissionId: string;
  projectId?: string;
  reportId?: string;
  status: AiJobStatus;
  createdAtIso: string;
  completedAtIso: string | null;
  suggestions: AiSuggestionItem[];
  gapsAndConflicts?: AiAnalysisGapOrConflict[];
  errorMessage?: string;
}

export interface MilestoneItem {
  id: string;
  projectId: string;
  title: string;
  dueDateIso: string;
  status: "upcoming" | "in_progress" | "completed" | "delayed";
  progressPercent: number;
  approvedForStakeholders?: boolean;
}

export interface EngineeringTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedToName?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "completed";
  dueAtIso: string;
}

export interface StakeholderPublishedUpdate {
  id: string;
  projectId: string;
  title: string;
  category: "progress_update" | "schedule_notice" | "announcement" | "meeting_summary";
  summary: string;
  body: string;
  publishedBy: string;
  publishedAtIso: string;
  attachmentDocumentIds: string[];
}

export interface StakeholderRiskItem {
  id: string;
  projectId: string;
  title: string;
  severity: "low" | "moderate" | "elevated";
  mitigationSummary: string;
  status: "monitoring" | "mitigated";
  releasedToStakeholders: boolean;
  updatedAtIso: string;
}

export interface CivoraNotification {
  id: string;
  title: string;
  body: string;
  category: "task_assigned" | "report_released" | "ai_complete" | "submission_conflict";
  deepLinkPath: string;
  read: boolean;
  audience: "engineer" | "stakeholder";
  createdAtIso: string;
}

export interface UserNotificationPreferences {
  pushEnabled: boolean;
  emailDigestEnabled: boolean;
  taskAssignments: boolean;
  reportReleases: boolean;
  submissionConflicts: boolean;
}
