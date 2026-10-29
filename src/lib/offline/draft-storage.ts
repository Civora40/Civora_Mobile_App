import { FieldSubmissionDraft } from "@/types/contracts";

/**
 * Local draft store for unsent field submissions and evidence upload tracking.
 *
 * Truthfulness rules (Section 10):
 * - Drafts stored here are marked `saved_on_device` until the Civora API confirms receipt.
 * - Server version conflicts (`409 Conflict`) transition the draft to `conflict` rather than
 *   silently overwriting the server record.
 * - All local drafts are cleared on logout or account switch to protect site data.
 */
class LocalDraftStore {
  private drafts = new Map<string, FieldSubmissionDraft>();
  private listeners = new Set<() => void>();

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

  public saveDraft(draft: FieldSubmissionDraft): FieldSubmissionDraft {
    const updated: FieldSubmissionDraft = {
      ...draft,
      lastSavedAtIso: new Date().toISOString(),
    };
    this.drafts.set(updated.clientSubmissionId, updated);
    this.notify();
    return updated;
  }

  public getDraft(clientSubmissionId: string): FieldSubmissionDraft | undefined {
    return this.drafts.get(clientSubmissionId);
  }

  public listDraftsByProject(projectId?: string): FieldSubmissionDraft[] {
    const all = Array.from(this.drafts.values());
    const filtered = projectId
      ? all.filter((d) => d.projectId === projectId)
      : all;
    return filtered.sort((a, b) =>
      b.lastSavedAtIso.localeCompare(a.lastSavedAtIso)
    );
  }

  public markConflict(
    clientSubmissionId: string,
    latestServerVersion: number,
    message: string
  ): FieldSubmissionDraft | undefined {
    const existing = this.drafts.get(clientSubmissionId);
    if (!existing) return undefined;

    const updated: FieldSubmissionDraft = {
      ...existing,
      syncState: "conflict",
      baseServerVersion: latestServerVersion,
      lastErrorMessage: message,
      lastSavedAtIso: new Date().toISOString(),
    };
    this.drafts.set(clientSubmissionId, updated);
    this.notify();
    return updated;
  }

  public markSubmittedToCivora(
    clientSubmissionId: string,
    serverVersion: number
  ): FieldSubmissionDraft | undefined {
    const existing = this.drafts.get(clientSubmissionId);
    if (!existing) return undefined;

    const updated: FieldSubmissionDraft = {
      ...existing,
      syncState: "submitted_to_civora",
      baseServerVersion: serverVersion,
      lastErrorMessage: undefined,
      lastSavedAtIso: new Date().toISOString(),
    };
    this.drafts.set(clientSubmissionId, updated);
    this.notify();
    return updated;
  }

  public removeDraft(clientSubmissionId: string): void {
    this.drafts.delete(clientSubmissionId);
    this.notify();
  }

  public clearAllOnLogout(): void {
    this.drafts.clear();
    this.notify();
  }
}

export const draftStorage = new LocalDraftStore();

