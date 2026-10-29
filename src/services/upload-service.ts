import * as Crypto from "expo-crypto";

import { CivoraApiError } from "@/lib/errors/api-error";
import { draftStorage } from "@/lib/offline/draft-storage";
import { getConnectivitySnapshot } from "@/lib/offline/network-monitor";
import { FieldSubmissionRecordSchema } from "@/lib/validation/contracts";
import { apiClient } from "@/services/api-client";
import {
  EvidenceAttachment,
  FieldSubmissionDraft,
  FieldSubmissionRecord,
} from "@/types/contracts";

export interface SubmitFieldEvidenceOptions {
  draft: FieldSubmissionDraft;
  signal?: AbortSignal;
  onAttachmentProgress?: (
    clientAttachmentId: string,
    progressPercent: number
  ) => void;
}

function generateUniqueToken(prefix: string): string {
  try {
    const uuid = Crypto.randomUUID?.();
    if (typeof uuid === "string" && uuid.length > 0) {
      return `${prefix}_${uuid}`;
    }
  } catch {
    // Fallback below
  }
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function createClientSubmissionDraft(params: {
  projectId: string;
  title: string;
  category: FieldSubmissionDraft["category"];
  notes: string;
  locationTag?: string;
  attachments?: EvidenceAttachment[];
}): FieldSubmissionDraft {
  const clientSubmissionId = generateUniqueToken("sub");
  const idempotencyKey = generateUniqueToken("idem");

  const draft: FieldSubmissionDraft = {
    clientSubmissionId,
    idempotencyKey,
    projectId: params.projectId,
    title: params.title,
    category: params.category,
    notes: params.notes,
    locationTag: params.locationTag,
    attachments: params.attachments ?? [],
    syncState: "saved_on_device",
    lastSavedAtIso: new Date().toISOString(),
  };

  return draftStorage.saveDraft(draft);
}

/**
 * Truthful upload & submission workflow (Section 10):
 * 1. Always preserves the draft locally first as `saved_on_device`.
 * 2. Verifies network reachability before attempting upload; if offline, keeps state as
 *    `saved_on_device` and informs the engineer truthfully.
 * 3. Sends `Idempotency-Key` and `clientSubmissionId` to prevent duplicate records on retry.
 * 4. Transitions to `submitted_to_civora` ONLY after the backend returns a valid, schema-verified
 *    `FieldSubmissionRecord`.
 * 5. Surfaces `409 Conflict` without overwriting newer server versions.
 */
export async function submitFieldSubmissionToCivora(
  options: SubmitFieldEvidenceOptions
): Promise<FieldSubmissionRecord> {
  const { draft, signal, onAttachmentProgress } = options;

  // Persist current draft before network attempt
  draftStorage.saveDraft(draft);

  const connectivity = await getConnectivitySnapshot();
  if (!connectivity.isConnected || !connectivity.isInternetReachable) {
    const offlineDraft: FieldSubmissionDraft = {
      ...draft,
      syncState: "saved_on_device",
      lastErrorMessage:
        "Offline: Saved on this device. Submission to Civora requires an active network connection.",
    };
    draftStorage.saveDraft(offlineDraft);
    throw new CivoraApiError({
      code: "NETWORK_ERROR",
      message: offlineDraft.lastErrorMessage!,
    });
  }

  // Mark uploading
  const uploadingDraft: FieldSubmissionDraft = {
    ...draft,
    syncState: "uploading",
    lastErrorMessage: undefined,
  };
  draftStorage.saveDraft(uploadingDraft);

  try {
    // Upload any attachments that have not yet received a serverFileId
    const updatedAttachments: EvidenceAttachment[] = [];

    for (const attachment of uploadingDraft.attachments) {
      if (attachment.uploadState === "succeeded" && attachment.serverFileId) {
        updatedAttachments.push(attachment);
        continue;
      }

      onAttachmentProgress?.(attachment.clientAttachmentId, 15);

      const uploadResponse = await apiClient.request<{ fileId: string }>({
        method: "POST",
        path: `/v1/projects/${encodeURIComponent(draft.projectId)}/uploads`,
        idempotencyKey: `${draft.idempotencyKey}_att_${attachment.clientAttachmentId}`,
        signal,
        body: {
          clientAttachmentId: attachment.clientAttachmentId,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
        },
      });

      onAttachmentProgress?.(attachment.clientAttachmentId, 100);

      updatedAttachments.push({
        ...attachment,
        uploadState: "succeeded",
        progressPercent: 100,
        serverFileId: uploadResponse.fileId,
        errorMessage: undefined,
      });
    }

    // Submit the field submission record with idempotency key and baseServerVersion
    const confirmedRecord = await apiClient.request<FieldSubmissionRecord>({
      method: "POST",
      path: `/v1/projects/${encodeURIComponent(draft.projectId)}/submissions`,
      idempotencyKey: draft.idempotencyKey,
      signal,
      body: {
        clientSubmissionId: draft.clientSubmissionId,
        title: draft.title,
        category: draft.category,
        notes: draft.notes,
        locationTag: draft.locationTag,
        attachmentFileIds: updatedAttachments
          .map((a) => a.serverFileId)
          .filter(Boolean),
        baseServerVersion: draft.baseServerVersion,
      },
      schema: FieldSubmissionRecordSchema,
    });

    // Only after server confirmation & schema validation do we mark as submitted_to_civora
    draftStorage.markSubmittedToCivora(
      draft.clientSubmissionId,
      confirmedRecord.serverVersion
    );

    return confirmedRecord;
  } catch (error) {
    if (error instanceof CivoraApiError && error.code === "CONFLICT") {
      draftStorage.markConflict(
        draft.clientSubmissionId,
        error.serverVersion ?? (draft.baseServerVersion ?? 1) + 1,
        error.message ||
          "A newer version of this submission exists on the server. Review changes before retrying."
      );
      throw error;
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Upload failed before server confirmation.";

    draftStorage.saveDraft({
      ...uploadingDraft,
      syncState: "failed",
      lastErrorMessage: errorMessage,
    });

    throw error;
  }
}
