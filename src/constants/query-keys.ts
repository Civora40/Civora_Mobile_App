/**
 * Centralized TanStack Query keys for deterministic invalidation and logout cleanup.
 */
export const QUERY_KEYS = {
  auth: {
    session: ["auth", "session"] as const,
    permissions: ["auth", "permissions"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (filters?: Record<string, unknown>) => ["projects", "list", filters] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const,
  },
  submissions: {
    all: ["submissions"] as const,
    byProject: (projectId: string) => ["submissions", "project", projectId] as const,
    detail: (submissionId: string) => ["submissions", "detail", submissionId] as const,
  },
  tasks: {
    byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  },
  reports: {
    byProject: (projectId: string) => ["reports", "project", projectId] as const,
    released: (projectId: string) => ["reports", "released", projectId] as const,
    detail: (reportId: string) => ["reports", "detail", reportId] as const,
  },
  reportTemplates: {
    all: ["report-templates"] as const,
  },
  aiAnalysis: {
    job: (jobId: string) => ["ai-analysis", "job", jobId] as const,
  },
  milestones: {
    byProject: (projectId: string) => ["milestones", "project", projectId] as const,
  },
  updates: {
    byProject: (projectId: string) => ["updates", "project", projectId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
} as const;

