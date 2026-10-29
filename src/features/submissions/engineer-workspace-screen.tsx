import { zodResolver } from "@hookform/resolvers/zod";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { SyncStateBadge } from "@/components/feedback/sync-state-badge";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { useLocalDrafts } from "@/hooks/use-drafts";
import { draftStorage } from "@/lib/offline/draft-storage";
import {
  FieldSubmissionFormSchema,
  FieldSubmissionFormValues,
} from "@/lib/validation/contracts";
import { useAuth } from "@/providers/auth-provider";
import { isAuthorizedForProject } from "@/services/auth-service";
import {
  createClientSubmissionDraft,
  submitFieldSubmissionToCivora,
} from "@/services/upload-service";
import {
  AiSuggestionItem,
  EvidenceAttachment,
  FieldSubmissionDraft,
} from "@/types/contracts";

const CATEGORIES: FieldSubmissionFormValues["category"][] = [
  "structural",
  "safety",
  "electrical",
  "materials",
  "general",
];

export function EngineerWorkspaceScreen() {
  const { user } = useAuth();
  const drafts = useLocalDrafts();
  const [attachments, setAttachments] = useState<EvidenceAttachment[]>([]);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const activeUploadController = useRef<AbortController | null>(null);

  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestionItem[]>([
    {
      id: "sug_rebar_spacing_01",
      field: "notes",
      suggestedText:
        "Include measured rebar center-to-center spacing (mm) and concrete cover depth check per ACI 318.",
      confidenceScore: 0.92,
      rationale:
        "Structural slab submissions require dimensional verification before pour sign-off.",
      accepted: null,
    },
  ]);

  const defaultProjectId = user?.assignedProjectIds[0] ?? "proj_horizon_tower";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FieldSubmissionFormValues>({
    resolver: zodResolver(FieldSubmissionFormSchema),
    defaultValues: {
      projectId: defaultProjectId,
      title: "",
      category: "structural",
      notes: "",
      locationTag: "",
    },
  });

  const handleCaptureCameraPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera Permission Required",
        "Civora requests camera access only when you capture on-site construction evidence for a submission."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          clientAttachmentId: `att_${Date.now()}`,
          localUri: asset.uri,
          fileName: asset.fileName ?? `site_photo_${Date.now()}.jpg`,
          mimeType: asset.mimeType ?? "image/jpeg",
          sizeBytes: asset.fileSize ?? 0,
          uploadState: "pending",
          progressPercent: 0,
        },
      ]);
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const doc = result.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          clientAttachmentId: `doc_${Date.now()}`,
          localUri: doc.uri,
          fileName: doc.name,
          mimeType: doc.mimeType ?? "application/octet-stream",
          sizeBytes: doc.size ?? 0,
          uploadState: "pending",
          progressPercent: 0,
        },
      ]);
    }
  };

  const onSaveLocalDraft = (values: FieldSubmissionFormValues) => {
    if (!isAuthorizedForProject(user, values.projectId)) {
      setStatusFeedback(
        `Unauthorized project (${values.projectId}). You may only create drafts for assigned projects.`
      );
      return;
    }

    const draft = createClientSubmissionDraft({
      ...values,
      attachments,
    });

    setStatusFeedback(
      `Draft "${draft.title}" saved on this device (${draft.clientSubmissionId}). Not yet submitted to Civora.`
    );
    setAttachments([]);
    reset({
      projectId: values.projectId,
      title: "",
      category: "structural",
      notes: "",
      locationTag: "",
    });
  };

  const onAttemptSubmitDraft = async (draft: FieldSubmissionDraft) => {
    setStatusFeedback(null);
    const controller = new AbortController();
    activeUploadController.current = controller;

    try {
      await submitFieldSubmissionToCivora({
        draft,
        signal: controller.signal,
      });
      setStatusFeedback(
        `Server confirmed receipt of "${draft.title}". Status is now Submitted to Civora.`
      );
    } catch (err) {
      setStatusFeedback(
        err instanceof Error
          ? err.message
          : "Submission failed before server confirmation. Draft remains saved on this device."
      );
    } finally {
      activeUploadController.current = null;
    }
  };

  const handleAcceptAiSuggestion = (suggestionId: string, accept: boolean) => {
    setAiSuggestions((prev) =>
      prev.map((item) => {
        if (item.id !== suggestionId) return item;
        if (accept) {
          const currentNotes = getValues("notes");
          const nextNotes = currentNotes
            ? `${currentNotes}\n${item.suggestedText}`
            : item.suggestedText;
          setValue("notes", nextNotes, { shouldValidate: true });
        }
        return { ...item, accepted: accept };
      })
    );
  };

  return (
    <WorkspaceShell
      workspaceTitle="Engineer Field Workspace"
      workspaceSubtitle="Create site submissions, attach field evidence, and manage local drafts."
      roleBadgeLabel="ENGINEER"
    >
      {statusFeedback ? (
        <View
          accessibilityRole="status"
          className="rounded-xl border border-civora-teal/40 bg-civora-steel p-3.5"
        >
          <Text className="text-xs font-medium text-slate-200">
            {statusFeedback}
          </Text>
        </View>
      ) : null}

      {/* New Field Submission Form */}
      <View className="rounded-2xl border border-slate-800 bg-civora-steel p-4">
        <Text className="text-base font-bold text-white">
          New Field Evidence Submission
        </Text>
        <Text className="mt-0.5 text-xs text-slate-300">
          Drafts are preserved locally on this device until the Civora API confirms submission.
        </Text>

        {/* Assigned Project Selector */}
        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Assigned Project
          </Text>
          <Controller
            control={control}
            name="projectId"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {(user?.assignedProjectIds ?? ["proj_horizon_tower"]).map(
                  (projId) => {
                    const selected = value === projId;
                    return (
                      <Pressable
                        key={projId}
                        accessibilityRole="button"
                        onPress={() => onChange(projId)}
                        className={`min-h-[44px] justify-center rounded-xl border px-3.5 py-2 ${
                          selected
                            ? "border-civora-teal bg-civora-teal/20"
                            : "border-slate-700 bg-civora-midnight"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            selected ? "text-civora-teal" : "text-slate-300"
                          }`}
                        >
                          {projId}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>
            )}
          />
        </View>

        {/* Category Selector */}
        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Inspection Category
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const selected = value === cat;
                  return (
                    <Pressable
                      key={cat}
                      accessibilityRole="button"
                      onPress={() => onChange(cat)}
                      className={`min-h-[40px] justify-center rounded-lg border px-3 py-1.5 ${
                        selected
                          ? "border-civora-blue bg-civora-blue/25"
                          : "border-slate-700 bg-civora-midnight"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold capitalize ${
                          selected ? "text-blue-200" : "text-slate-300"
                        }`}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Title */}
        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Submission Title
          </Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                accessibilityLabel="Submission Title"
                placeholder="e.g., Level 14 Core Wall Rebar Inspection"
                placeholderTextColor="#64748B"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="min-h-[48px] rounded-xl border border-slate-700 bg-civora-midnight px-3.5 text-sm text-white"
              />
            )}
          />
          {errors.title ? (
            <Text className="mt-1 text-xs text-red-400">
              {errors.title.message}
            </Text>
          ) : null}
        </View>

        {/* Notes */}
        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Field Observation Notes
          </Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                accessibilityLabel="Field Observation Notes"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Record measurements, tolerances, and any non-conformance observations..."
                placeholderTextColor="#64748B"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="min-h-[96px] rounded-xl border border-slate-700 bg-civora-midnight p-3.5 text-sm text-white"
              />
            )}
          />
          {errors.notes ? (
            <Text className="mt-1 text-xs text-red-400">
              {errors.notes.message}
            </Text>
          ) : null}
        </View>

        {/* Evidence Attachments */}
        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Contextual Evidence Capture ({attachments.length})
          </Text>
          <View className="flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Capture site photo with camera"
              onPress={handleCaptureCameraPhoto}
              className="min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-700 bg-civora-midnight px-3 py-2.5 active:opacity-80"
            >
              <Text className="text-xs font-semibold text-civora-teal">
                + Camera Photo
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Attach document or specification PDF"
              onPress={handlePickDocument}
              className="min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-700 bg-civora-midnight px-3 py-2.5 active:opacity-80"
            >
              <Text className="text-xs font-semibold text-blue-300">
                + Attach Document
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Save Draft CTA */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save draft on this device"
          onPress={() => {
            void handleSubmit(onSaveLocalDraft)();
          }}
          className="mt-5 min-h-[48px] items-center justify-center rounded-xl bg-civora-blue px-4 py-3 active:opacity-85"
        >
          <Text className="text-sm font-bold text-white">
            Save Draft on This Device
          </Text>
        </Pressable>
      </View>

      {/* AI Field Analysis Suggestion Review */}
      <View className="rounded-2xl border border-slate-800 bg-civora-steel p-4">
        <Text className="text-sm font-bold text-white">
          Civora AI Field Quality Assistant
        </Text>
        <Text className="mt-0.5 text-xs text-slate-300">
          AI suggestions require explicit engineer review before inclusion in a submission.
        </Text>

        {aiSuggestions.map((item) => (
          <View
            key={item.id}
            className="mt-3 rounded-xl border border-slate-700 bg-civora-midnight p-3"
          >
            <Text className="text-xs font-semibold text-civora-teal">
              Confidence: {Math.round(item.confidenceScore * 100)}% ·{" "}
              {item.rationale}
            </Text>
            <Text className="mt-1.5 text-xs text-slate-200">
              “{item.suggestedText}”
            </Text>
            <View className="mt-3 flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Accept AI suggestion into notes"
                onPress={() => handleAcceptAiSuggestion(item.id, true)}
                className="min-h-[40px] items-center justify-center rounded-lg bg-civora-teal/20 px-3 py-1.5"
              >
                <Text className="text-xs font-bold text-civora-teal">
                  {item.accepted === true
                    ? "Accepted into Notes"
                    : "Accept Suggestion"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss AI suggestion"
                onPress={() => handleAcceptAiSuggestion(item.id, false)}
                className="min-h-[40px] items-center justify-center rounded-lg border border-slate-700 px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-slate-400">
                  {item.accepted === false ? "Dismissed" : "Dismiss"}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* Local Drafts & Upload Queue */}
      <View className="rounded-2xl border border-slate-800 bg-civora-steel p-4">
        <Text className="text-base font-bold text-white">
          Device Drafts & Submission Queue ({drafts.length})
        </Text>
        <Text className="mt-0.5 text-xs text-slate-300">
          Each submission uses an Idempotency-Key to prevent duplicate server records on retry.
        </Text>

        {drafts.length === 0 ? (
          <View className="mt-4 rounded-xl border border-dashed border-slate-700 p-4">
            <Text className="text-center text-xs text-slate-400">
              No unsent drafts on this device. Create a field submission above to inspect local persistence and upload states.
            </Text>
          </View>
        ) : (
          <View className="mt-3 gap-3">
            {drafts.map((draft) => (
              <View
                key={draft.clientSubmissionId}
                className="rounded-xl border border-slate-700 bg-civora-midnight p-3.5"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-white">
                      {draft.title}
                    </Text>
                    <Text className="mt-0.5 text-xs text-slate-400">
                      Project: {draft.projectId} · Category: {draft.category} · ID:{" "}
                      {draft.clientSubmissionId}
                    </Text>
                  </View>
                </View>

                <View className="mt-2.5">
                  <SyncStateBadge state={draft.syncState} />
                </View>

                <Text className="mt-2 text-xs text-slate-300" numberOfLines={3}>
                  {draft.notes}
                </Text>

                {draft.lastErrorMessage ? (
                  <Text className="mt-2 text-xs font-medium text-amber-300">
                    {draft.lastErrorMessage}
                  </Text>
                ) : null}

                <View className="mt-3 flex-row flex-wrap gap-2">
                  {draft.syncState !== "submitted_to_civora" ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Submit ${draft.title} to Civora`}
                      onPress={() => onAttemptSubmitDraft(draft)}
                      className="min-h-[44px] items-center justify-center rounded-lg bg-civora-blue px-3.5 py-2"
                    >
                      <Text className="text-xs font-bold text-white">
                        {draft.syncState === "failed" ||
                        draft.syncState === "conflict"
                          ? "Retry Safe Upload (Idempotent)"
                          : "Submit to Civora API"}
                      </Text>
                    </Pressable>
                  ) : null}

                  {draft.syncState === "uploading" &&
                  activeUploadController.current ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Cancel active upload"
                      onPress={() => activeUploadController.current?.abort()}
                      className="min-h-[44px] items-center justify-center rounded-lg border border-red-500/50 px-3 py-2"
                    >
                      <Text className="text-xs font-semibold text-red-300">
                        Cancel Upload
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove local draft ${draft.title}`}
                    onPress={() =>
                      draftStorage.removeDraft(draft.clientSubmissionId)
                    }
                    className="min-h-[44px] items-center justify-center rounded-lg border border-slate-700 px-3 py-2"
                  >
                    <Text className="text-xs font-semibold text-slate-400">
                      Delete Local Draft
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </WorkspaceShell>
  );
}
