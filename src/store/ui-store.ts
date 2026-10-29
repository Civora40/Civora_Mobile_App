import {
  CONTRACT_AI_ANALYSIS_JOB,
  CONTRACT_INITIAL_REPORT_DRAFTS,
  CONTRACT_NOTIFICATIONS,
  CONTRACT_TASKS,
} from "@/constants/contract-catalog";
import {
  AiAnalysisJob,
  CivoraNotification,
  CivoraRole,
  EngineeringTask,
  EngineerReportDraft,
  UserNotificationPreferences,
} from "@/types/contracts";

/**
 * UI & Local Workspace State Store
 * Separates transient UI preferences, active workspace selection (for multi-role users),
 * splash/onboarding progression, and local report drafts from server query caches.
 */
class CivoraUiStore {
  private listeners = new Set<() => void>();
  private activeWorkspaceOverride: CivoraRole | null = null;
  private hasCompletedOnboarding = false;
  private splashReplayCounter = 0;
  private tasks: EngineeringTask[] = [...CONTRACT_TASKS];
  private reportDrafts: EngineerReportDraft[] = [
    ...CONTRACT_INITIAL_REPORT_DRAFTS,
  ];
  private aiJob: AiAnalysisJob = structuredClone(CONTRACT_AI_ANALYSIS_JOB);
  private notifications: CivoraNotification[] = [...CONTRACT_NOTIFICATIONS];
  private preferences: UserNotificationPreferences = {
    pushEnabled: true,
    emailDigestEnabled: true,
    taskAssignments: true,
    reportReleases: true,
    submissionConflicts: true,
  };

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getHasCompletedOnboarding(): boolean {
    return this.hasCompletedOnboarding;
  }

  public setHasCompletedOnboarding(completed: boolean): void {
    this.hasCompletedOnboarding = completed;
    this.notify();
  }

  public getSplashReplayCounter(): number {
    return this.splashReplayCounter;
  }

  public replaySplashAndOnboarding(): void {
    this.hasCompletedOnboarding = false;
    this.splashReplayCounter += 1;
    this.notify();
  }

  public getActiveWorkspaceOverride(): CivoraRole | null {
    return this.activeWorkspaceOverride;
  }

  public setActiveWorkspaceOverride(role: CivoraRole | null): void {
    this.activeWorkspaceOverride = role;
    this.notify();
  }

  public getTasks(projectId?: string): EngineeringTask[] {
    if (!projectId) return this.tasks;
    return this.tasks.filter((t) => t.projectId === projectId);
  }

  public getTaskById(taskId: string): EngineeringTask | undefined {
    return this.tasks.find((t) => t.id === taskId);
  }

  public updateTaskStatus(
    taskId: string,
    status: EngineeringTask["status"]
  ): void {
    this.tasks = this.tasks.map((t) =>
      t.id === taskId ? { ...t, status } : t
    );
    this.notify();
  }

  public getReportDrafts(projectId?: string): EngineerReportDraft[] {
    if (!projectId) return this.reportDrafts;
    return this.reportDrafts.filter((d) => d.projectId === projectId);
  }

  public getReportDraftById(reportId: string): EngineerReportDraft | undefined {
    return this.reportDrafts.find((d) => d.id === reportId);
  }

  public saveReportDraft(draft: EngineerReportDraft): void {
    const exists = this.reportDrafts.some((d) => d.id === draft.id);
    if (exists) {
      this.reportDrafts = this.reportDrafts.map((d) =>
        d.id === draft.id ? { ...draft, updatedAtIso: new Date().toISOString() } : d
      );
    } else {
      this.reportDrafts = [draft, ...this.reportDrafts];
    }
    this.notify();
  }

  public getAiJob(): AiAnalysisJob {
    return this.aiJob;
  }

  public decideAiSuggestion(
    suggestionId: string,
    accepted: boolean,
    editedText?: string
  ): void {
    this.aiJob = {
      ...this.aiJob,
      suggestions: this.aiJob.suggestions.map((s) =>
        s.id === suggestionId
          ? {
              ...s,
              accepted,
              suggestedText: editedText ?? s.suggestedText,
            }
          : s
      ),
    };

    if (accepted && this.aiJob.reportId) {
      const targetDraft = this.getReportDraftById(this.aiJob.reportId);
      const suggestion = this.aiJob.suggestions.find(
        (s) => s.id === suggestionId
      );
      if (targetDraft && suggestion) {
        const updatedSections = targetDraft.sections.map((sec) =>
          sec.sectionId === suggestion.field
            ? {
                ...sec,
                body: `${sec.body}\n\n[Engineer-Reviewed AI Proposal]: ${suggestion.suggestedText}`,
              }
            : sec
        );
        this.saveReportDraft({
          ...targetDraft,
          sections: updatedSections,
        });
      }
    }
    this.notify();
  }

  public getNotifications(audience: "engineer" | "stakeholder"): CivoraNotification[] {
    return this.notifications.filter((n) => n.audience === audience);
  }

  public markNotificationRead(notificationId: string): void {
    this.notifications = this.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notify();
  }

  public getPreferences(): UserNotificationPreferences {
    return this.preferences;
  }

  public updatePreferences(
    patch: Partial<UserNotificationPreferences>
  ): void {
    this.preferences = { ...this.preferences, ...patch };
    this.notify();
  }

  public resetOnLogout(): void {
    this.activeWorkspaceOverride = null;
    this.tasks = [...CONTRACT_TASKS];
    this.reportDrafts = [...CONTRACT_INITIAL_REPORT_DRAFTS];
    this.aiJob = structuredClone(CONTRACT_AI_ANALYSIS_JOB);
    this.notifications = [...CONTRACT_NOTIFICATIONS];
    this.notify();
  }
}

export const uiStore = new CivoraUiStore();
