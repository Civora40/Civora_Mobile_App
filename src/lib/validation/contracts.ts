import { z } from "zod";

export const CivoraRoleSchema = z.enum(["engineer", "stakeholder"]);

export const CivoraPermissionSchema = z.enum([
  "workspace:engineer",
  "workspace:stakeholder",
  "projects:read",
  "submissions:create",
  "submissions:read",
  "uploads:create",
  "reports:draft",
  "reports:submit_review",
  "reports:read_released",
  "ai_analysis:request",
  "ai_analysis:accept_suggestion",
  "tasks:update",
  "documents:download_released",
  "updates:read_published",
  "risks:read_released",
]);

export const AuthenticatedUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
  organizationName: z.string().min(1),
  role: CivoraRoleSchema,
  permissions: z.array(CivoraPermissionSchema),
  assignedProjectIds: z.array(z.string()),
});

export const AuthSessionTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAtIso: z.string().min(1),
});

export const AuthSessionResponseSchema = z.object({
  user: AuthenticatedUserSchema,
  tokens: AuthSessionTokensSchema,
});

export const LoginFormSchema = z.object({
  email: z.string().email("Enter a valid work email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid work email address"),
  organizationName: z.string().min(2, "Enter your organization or company"),
  role: CivoraRoleSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export const ForgotPasswordFormSchema = z.object({
  email: z.string().email("Enter the work email associated with your Civora account"),
});

export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordFormSchema>;

export const FieldSubmissionFormSchema = z.object({
  projectId: z.string().min(1, "Select an authorized project"),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title cannot exceed 120 characters"),
  category: z.enum(["structural", "safety", "electrical", "materials", "general"]),
  notes: z
    .string()
    .min(10, "Provide detailed field observation notes (min 10 characters)")
    .max(4000, "Notes cannot exceed 4000 characters"),
  locationTag: z.string().max(120).optional(),
});

export type FieldSubmissionFormValues = z.infer<typeof FieldSubmissionFormSchema>;

export const CreateReportFormSchema = z.object({
  projectId: z.string().min(1, "Select an authorized project"),
  templateId: z.string().min(1, "Select a report template"),
  title: z.string().min(5, "Report title must be at least 5 characters"),
  reportingPeriod: z.string().min(3, "Specify the reporting period (e.g., 2026-W43)"),
  executiveSummary: z
    .string()
    .min(15, "Provide an initial summary (min 15 characters)"),
});

export type CreateReportFormValues = z.infer<typeof CreateReportFormSchema>;

export const FieldSubmissionRecordSchema = z.object({
  id: z.string().min(1),
  clientSubmissionId: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["structural", "safety", "electrical", "materials", "general"]),
  notes: z.string(),
  submittedByUserId: z.string().min(1),
  submittedAtIso: z.string().min(1),
  serverVersion: z.number().int().nonnegative(),
  status: z.enum(["received", "under_review", "approved", "flagged"]),
});

export const CivoraReportSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  periodLabel: z.string().optional(),
  visibilityStatus: z.enum(["draft", "internal_review", "released"]),
  version: z.number().int().positive(),
  releasedAtIso: z.string().nullable(),
  downloadUrl: z.string().nullable(),
});

export const AiAnalysisJobSchema = z.object({
  jobId: z.string().min(1),
  submissionId: z.string().min(1),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  createdAtIso: z.string(),
  completedAtIso: z.string().nullable(),
  suggestions: z.array(
    z.object({
      id: z.string().min(1),
      field: z.string().min(1),
      suggestedText: z.string(),
      confidenceScore: z.number().min(0).max(1),
      rationale: z.string(),
      sourceReferences: z.array(z.string()).optional(),
      accepted: z.boolean().nullable(),
    })
  ),
  errorMessage: z.string().optional(),
});
