import { zodResolver } from "@hookform/resolvers/zod";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { SyncStateBadge } from "@/components/feedback/sync-state-badge";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import {
  EmptyState,
  SectionHeader,
  SubmissionCard,
} from "@/components/ui/primitives";
import { CONTRACT_CONFIRMED_SUBMISSIONS } from "@/constants/contract-catalog";
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
import { EvidenceAttachment, FieldSubmissionDraft } from "@/types/contracts";

const CATEGORIES: FieldSubmissionFormValues["category"][] = [
  "structural",
  "safety",
  "electrical",
  "materials",
  "general",
];

export function EngineerSubmissionListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const drafts = useLocalDrafts();
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const activeUploadController = useRef<AbortController | null>(null);

  const confirmedRecords = CONTRACT_CONFIRMED_SUBMISSIONS.filter((r) =>
    isAuthorizedForProject(user, r.projectId)
  );

  const handleUploadAttempt = async (draft: FieldSubmissionDraft) => {
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
          : "Upload failed before server confirmation. Draft remains saved on this device."
      );
    } finally {
      activeUploadController.current = null;
    }
  };

  return (
    <WorkspaceShell
      workspaceTitle="Field Submissions & Evidence"
      workspaceSubtitle="Track server-confirmed submissions and manage local device drafts"
      roleBadgeLabel="ENGINEER"
      notificationRoute="/(engineer)/notifications"
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/(engineer)/submissions/create")}
        className="min-h-[48px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-3 active:opacity-85"
      >
        <Text className="text-sm font-bold text-white">
          + Create New Field Submission
        </Text>
      </Pressable>

      {statusFeedback ? (
        <View
          accessibilityRole="status"
          className="rounded-2xl border border-civora-teal/40 bg-white dark:bg-civora-steel p-3.5 shadow-sm"
        >
          <Text className="text-xs font-medium text-civora-midnight dark:text-slate-200">
            {statusFeedback}
          </Text>
        </View>
      ) : null}

      {/* Device Drafts & Upload Queue */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title={`Device Drafts & Upload Queue (${drafts.length})`}
          subtitle="Uses Idempotency-Key to prevent duplicate server records on retry"
        />
        {drafts.length === 0 ? (
          <EmptyState
            title="No Unsent Device Drafts"
            description="Tap + Create New Field Submission above to capture observations and site photos."
          />
        ) : (
          <View className="gap-3">
            {drafts.map((draft) => (
              <View
                key={draft.clientSubmissionId}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-4"
              >
                <Text className="text-sm font-bold text-civora-midnight dark:text-white">
                  {draft.title}
                </Text>
                <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Project: {draft.projectId} · Category: {draft.category} · ID:{" "}
                  {draft.clientSubmissionId}
                </Text>

                <View className="mt-2">
                  <SyncStateBadge state={draft.syncState} />
                </View>

                <Text
                  className="mt-2 text-xs text-slate-600 dark:text-slate-300"
                  numberOfLines={3}
                >
                  {draft.notes}
                </Text>

                {draft.lastErrorMessage ? (
                  <Text className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                    {draft.lastErrorMessage}
                  </Text>
                ) : null}

                <View className="mt-3 flex-row flex-wrap gap-2">
                  {draft.syncState !== "submitted_to_civora" ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleUploadAttempt(draft)}
                      className="min-h-[42px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-2"
                    >
                      <Text className="text-xs font-bold text-white">
                        {draft.syncState === "failed" ||
                        draft.syncState === "conflict"
                          ? "Retry Safe Upload (Idempotent)"
                          : "Submit to Civora API"}
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      draftStorage.removeDraft(draft.clientSubmissionId)
                    }
                    className="min-h-[42px] items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-3.5 py-2"
                  >
                    <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Delete Local Draft
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Server-Confirmed History */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title={`Server-Confirmed History (${confirmedRecords.length})`}
          subtitle="Original submitted evidence is preserved; revisions are explicit"
        />
        <View className="gap-2.5">
          {confirmedRecords.map((rec) => (
            <SubmissionCard
              key={rec.id}
              record={rec}
              onPress={() =>
                router.push(`/(engineer)/submissions/${rec.id}` as never)
              }
            />
          ))}
        </View>
      </View>
    </WorkspaceShell>
  );
}

export function CreateSubmissionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [attachments, setAttachments] = useState<EvidenceAttachment[]>([]);
  const [captionInput, setCaptionInput] = useState("");
  const defaultProjectId = user?.assignedProjectIds[0] ?? "proj_horizon_tower";

  const {
    control,
    handleSubmit,
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
        "Civora requests camera access only when capturing on-site construction evidence."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
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
          caption: captionInput.trim() || "On-site camera inspection photo",
          uploadState: "pending",
          progressPercent: 0,
        },
      ]);
      setCaptionInput("");
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
          caption: captionInput.trim() || "Attached site specification/record",
          uploadState: "pending",
          progressPercent: 0,
        },
      ]);
      setCaptionInput("");
    }
  };

  const onSaveDraft = (values: FieldSubmissionFormValues) => {
    createClientSubmissionDraft({
      ...values,
      attachments,
    });
    router.replace("/(engineer)/submissions");
  };

  return (
    <WorkspaceShell
      workspaceTitle="New Field Submission"
      workspaceSubtitle="Structured field observation & evidence capture"
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          selected
                            ? "text-civora-teal"
                            : "text-slate-700 dark:text-slate-300"
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

        <Text className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
                    className={`min-h-[40px] justify-center rounded-xl border px-3 py-1.5 ${
                      selected
                        ? "border-civora-blue bg-civora-blue/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold capitalize ${
                        selected
                          ? "text-civora-blue dark:text-blue-200"
                          : "text-slate-700 dark:text-slate-300"
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

        <Text className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Submission Title
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Submission Title"
              placeholder="e.g., Level 14 Core Wall Rebar Inspection"
              placeholderTextColor="#94A3B8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="min-h-[48px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-3.5 text-sm text-civora-midnight dark:text-white"
            />
          )}
        />
        {errors.title ? (
          <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
            {errors.title.message}
          </Text>
        ) : null}

        <Text className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Grid / Location Reference (Optional)
        </Text>
        <Controller
          control={control}
          name="locationTag"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Location Reference"
              placeholder="e.g., Core Grid B2–B6, RL +54.2m"
              placeholderTextColor="#94A3B8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="min-h-[44px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-3.5 text-sm text-civora-midnight dark:text-white"
            />
          )}
        />

        <Text className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
              placeholderTextColor="#94A3B8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="min-h-[96px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5 text-sm text-civora-midnight dark:text-white"
            />
          )}
        />
        {errors.notes ? (
          <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
            {errors.notes.message}
          </Text>
        ) : null}

        {/* Evidence Picker with Caption */}
        <Text className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Evidence Caption & Capture ({attachments.length} attached)
        </Text>
        <TextInput
          accessibilityLabel="Evidence Caption"
          placeholder="Caption for next photo/document..."
          placeholderTextColor="#94A3B8"
          value={captionInput}
          onChangeText={setCaptionInput}
          className="mb-2.5 min-h-[42px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-3.5 text-xs text-civora-midnight dark:text-white"
        />
        <View className="flex-row gap-2.5">
          <Pressable
            accessibilityRole="button"
            onPress={handleCaptureCameraPhoto}
            className="min-h-[44px] flex-1 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-3 py-2.5"
          >
            <Text className="text-xs font-bold text-civora-teal">
              + Camera Photo
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handlePickDocument}
            className="min-h-[44px] flex-1 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-3 py-2.5"
          >
            <Text className="text-xs font-bold text-civora-blue dark:text-blue-300">
              + Attach Document
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleSubmit(onSaveDraft)();
          }}
          className="mt-5 min-h-[48px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-3"
        >
          <Text className="text-sm font-bold text-white">
            Save Draft on This Device & Open Queue
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}

export function SubmissionDetailScreen() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const router = useRouter();
  const record =
    CONTRACT_CONFIRMED_SUBMISSIONS.find((s) => s.id === submissionId) ??
    CONTRACT_CONFIRMED_SUBMISSIONS[0];

  const handleCreateExplicitRevision = () => {
    createClientSubmissionDraft({
      projectId: record.projectId,
      title: `[Revision of v${record.serverVersion}] ${record.title}`,
      category: record.category,
      notes: `${record.notes}\n\n[Explicit Revision Addendum]: `,
    });
    router.push("/(engineer)/submissions");
  };

  return (
    <WorkspaceShell
      workspaceTitle="Submission Detail & Evidence"
      workspaceSubtitle={`Record ID: ${record.id} · Server v${record.serverVersion}`}
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
            Server Confirmed · {record.status}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            {record.submittedAtIso.slice(0, 10)}
          </Text>
        </View>

        <Text className="mt-2 text-base font-extrabold text-civora-midnight dark:text-white">
          {record.title}
        </Text>
        <Text className="mt-1 text-xs font-semibold text-civora-teal">
          Project: {record.projectId} · Category: {record.category}
        </Text>

        <View className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5">
          <Text className="text-xs leading-5 text-slate-700 dark:text-slate-200">
            {record.notes}
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-civora-teal/30 bg-civora-teal/10 p-3.5">
          <Text className="text-xs font-bold text-civora-teal">
            Immutable Evidence Governance
          </Text>
          <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Original submitted field evidence is preserved permanently on the Civora backend. Any post-submission change creates an explicit versioned revision.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleCreateExplicitRevision}
          className="mt-4 min-h-[46px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-2.5"
        >
          <Text className="text-xs font-bold text-white">
            Create Explicit Revision Draft (Preserves Original v{record.serverVersion})
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}
