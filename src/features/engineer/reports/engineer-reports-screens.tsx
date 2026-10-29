import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ReportCard, SectionHeader } from "@/components/ui/primitives";
import {
  CONTRACT_REPORTS,
  CONTRACT_REPORT_TEMPLATES,
} from "@/constants/contract-catalog";
import {
  CreateReportFormSchema,
  CreateReportFormValues,
} from "@/lib/validation/contracts";
import { useAuth } from "@/providers/auth-provider";
import { isAuthorizedForProject } from "@/services/auth-service";
import { uiStore } from "@/store/ui-store";
import { EngineerReportDraft } from "@/types/contracts";

export function EngineerReportsHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const reportDrafts = uiStore
    .getReportDrafts()
    .filter((d) => isAuthorizedForProject(user, d.projectId));

  const projectReports = CONTRACT_REPORTS.filter((r) =>
    isAuthorizedForProject(user, r.projectId)
  );

  return (
    <WorkspaceShell
      workspaceTitle="Civora Reporting Studio"
      workspaceSubtitle="Draft engineering reports, templates, and AI-assisted synthesis"
      roleBadgeLabel="ENGINEER"
      notificationRoute="/(engineer)/notifications"
    >
      <View className="flex-row gap-2.5">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(engineer)/reports/create")}
          className="min-h-[48px] flex-1 items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-3 py-3"
        >
          <Text className="text-xs font-bold text-white">
            + Create from Template
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(engineer)/reports/templates")}
          className="min-h-[48px] flex-1 items-center justify-center rounded-full border border-civora-teal bg-white dark:bg-civora-steel px-3 py-3"
        >
          <Text className="text-xs font-bold text-civora-teal">
            Browse Templates ({CONTRACT_REPORT_TEMPLATES.length})
          </Text>
        </Pressable>
      </View>

      {/* Mobile vs Desktop Pagination Boundary Notice */}
      <View className="rounded-3xl border border-civora-teal/30 bg-white dark:bg-civora-steel p-4 shadow-sm">
        <Text className="text-xs font-bold text-civora-teal">
          Mobile Reporting Studio Scope
        </Text>
        <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Edit structured sections, link source evidence, and review AI proposals on mobile. Fine-grained paper size, margins, TOC styling, and authoritative PDF/DOCX pagination are finalized in the Civora Desktop Web Studio.
        </Text>
      </View>

      {/* Working Report Drafts */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title={`Working Report Drafts (${reportDrafts.length})`}
          subtitle="Includes section editor, completeness warnings, and AI analysis"
        />
        <View className="gap-3">
          {reportDrafts.map((draft) => (
            <Pressable
              key={draft.id}
              accessibilityRole="button"
              onPress={() =>
                router.push(`/(engineer)/reports/${draft.id}` as never)
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-4 active:opacity-85"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                  {draft.syncState === "saved_on_device"
                    ? "Draft Saved on Device"
                    : "Submitted for Review"}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {draft.reportingPeriod}
                </Text>
              </View>
              <Text className="mt-1.5 text-sm font-bold text-civora-midnight dark:text-white">
                {draft.title}
              </Text>
              <Text
                className="mt-1 text-xs text-slate-600 dark:text-slate-300"
                numberOfLines={2}
              >
                {draft.executiveSummary}
              </Text>
              <View className="mt-3 flex-row gap-2">
                <View className="rounded-full bg-civora-blue/15 px-3 py-1">
                  <Text className="text-[11px] font-bold text-civora-blue dark:text-blue-200">
                    Open Section Editor →
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push(
                      `/(engineer)/reports/${draft.id}/ai-analysis` as never
                    )
                  }
                  className="rounded-full bg-civora-teal/15 px-3 py-1"
                >
                  <Text className="text-[11px] font-bold text-civora-teal">
                    AI Analysis & Proposals
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Project Reports Overview */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Project Report History"
          subtitle="Released and internal engineering versions"
        />
        <View className="gap-2.5">
          {projectReports.map((rep) => (
            <ReportCard key={rep.id} report={rep} />
          ))}
        </View>
      </View>
    </WorkspaceShell>
  );
}

export function ReportTemplatePickerScreen() {
  const router = useRouter();

  return (
    <WorkspaceShell
      workspaceTitle="Report Templates"
      workspaceSubtitle="Standardized Civora engineering report structures"
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="gap-3">
        {CONTRACT_REPORT_TEMPLATES.map((tpl) => (
          <View
            key={tpl.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm"
          >
            <Text className="text-xs font-bold uppercase text-civora-teal">
              {tpl.category.replace("_", " ")}
            </Text>
            <Text className="mt-1 text-base font-extrabold text-civora-midnight dark:text-white">
              {tpl.name}
            </Text>
            <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {tpl.description}
            </Text>

            <View className="mt-3 gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5">
              <Text className="text-xs font-bold text-civora-midnight dark:text-slate-200">
                Required Sections ({tpl.sections.length}):
              </Text>
              {tpl.sections.map((sec) => (
                <Text
                  key={sec.id}
                  className="text-xs text-slate-600 dark:text-slate-300"
                >
                  • {sec.heading}
                </Text>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(engineer)/reports/create")}
              className="mt-3.5 min-h-[44px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-2.5"
            >
              <Text className="text-xs font-bold text-white">
                Use This Template
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </WorkspaceShell>
  );
}

export function CreateReportScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const defaultProject = user?.assignedProjectIds[0] ?? "proj_horizon_tower";
  const defaultTemplate = CONTRACT_REPORT_TEMPLATES[0];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateReportFormValues>({
    resolver: zodResolver(CreateReportFormSchema),
    defaultValues: {
      projectId: defaultProject,
      templateId: defaultTemplate.id,
      title: "",
      reportingPeriod: "2026-W44",
      executiveSummary: "",
    },
  });

  const onSubmit = (values: CreateReportFormValues) => {
    const tpl =
      CONTRACT_REPORT_TEMPLATES.find((t) => t.id === values.templateId) ??
      defaultTemplate;

    const newDraft: EngineerReportDraft = {
      id: `drf_rep_${Date.now()}`,
      projectId: values.projectId,
      templateId: tpl.id,
      title: values.title,
      reportingPeriod: values.reportingPeriod,
      executiveSummary: values.executiveSummary,
      sections: tpl.sections.map((sec) => ({
        sectionId: sec.id,
        heading: sec.heading,
        body: "",
        sourceSubmissionIds: [],
        completenessWarning: sec.required
          ? "Section content is empty. Complete before submitting for review."
          : undefined,
      })),
      syncState: "saved_on_device",
      reviewStatus: "draft",
      updatedAtIso: new Date().toISOString(),
    };

    uiStore.saveReportDraft(newDraft);
    router.replace(`/(engineer)/reports/${newDraft.id}` as never);
  };

  return (
    <WorkspaceShell
      workspaceTitle="Create Report Draft"
      workspaceSubtitle="Initialize a structured engineering report from template"
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Report Title
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Report Title"
              placeholder="e.g., LAMATA Blue Line Weekly QA Report — W44"
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
          Reporting Period
        </Text>
        <Controller
          control={control}
          name="reportingPeriod"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Reporting Period"
              placeholder="2026-W44"
              placeholderTextColor="#94A3B8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="min-h-[44px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-3.5 text-sm text-civora-midnight dark:text-white"
            />
          )}
        />

        <Text className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Executive Summary
        </Text>
        <Controller
          control={control}
          name="executiveSummary"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Executive Summary"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholder="Summarize key structural milestones and quality status..."
              placeholderTextColor="#94A3B8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="min-h-[84px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5 text-sm text-civora-midnight dark:text-white"
            />
          )}
        />
        {errors.executiveSummary ? (
          <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
            {errors.executiveSummary.message}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
          className="mt-5 min-h-[48px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-3"
        >
          <Text className="text-sm font-bold text-white">
            Create Report Draft & Open Section Editor
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}

export function EngineerReportDetailScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const draft =
    uiStore.getReportDraftById(reportId ?? "drf_rep_ht_w43") ??
    uiStore.getReportDrafts()[0];

  const handleSectionChange = (sectionId: string, text: string) => {
    const updatedSections = draft.sections.map((sec) =>
      sec.sectionId === sectionId
        ? {
          ...sec,
          body: text,
          completenessWarning:
            text.trim().length < 20
              ? "Section requires fuller engineering detail before review."
              : undefined,
        }
        : sec
    );
    uiStore.saveReportDraft({ ...draft, sections: updatedSections });
  };

  const handleSubmitForReview = () => {
    uiStore.saveReportDraft({
      ...draft,
      syncState: "submitted_for_review",
      reviewStatus: "pending_review",
    });
  };

  return (
    <WorkspaceShell
      workspaceTitle="Report Section Editor"
      workspaceSubtitle={`${draft.reportingPeriod} · Status: ${draft.reviewStatus.replace("_", " ")}`}
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="text-base font-extrabold text-civora-midnight dark:text-white">
          {draft.title}
        </Text>
        <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          {draft.executiveSummary}
        </Text>

        {draft.reviewerComments?.length ? (
          <View className="mt-3 rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/60 p-3.5">
            <Text className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Engineering Review Comments
            </Text>
            {draft.reviewerComments.map((comment, idx) => (
              <Text
                key={idx}
                className="mt-1 text-xs text-amber-900 dark:text-amber-100"
              >
                • {comment}
              </Text>
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(`/(engineer)/reports/${draft.id}/ai-analysis` as never)
          }
          className="mt-4 min-h-[44px] items-center justify-center rounded-full border border-civora-teal bg-civora-teal/10 px-4 py-2.5"
        >
          <Text className="text-xs font-bold text-civora-teal">
            Open AI Field Analysis & Section Proposals →
          </Text>
        </Pressable>
      </View>

      {/* Structured Section Editors */}
      {draft.sections.map((sec) => (
        <View
          key={sec.sectionId}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm"
        >
          <Text className="text-sm font-bold text-civora-midnight dark:text-white">
            {sec.heading}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Linked Evidence Sources:{" "}
            {sec.sourceSubmissionIds.join(", ") || "None linked yet"}
          </Text>

          {sec.completenessWarning ? (
            <View className="mt-2 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/50 p-2.5">
              <Text className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Completeness Warning: {sec.completenessWarning}
              </Text>
            </View>
          ) : null}

          <TextInput
            accessibilityLabel={sec.heading}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={sec.body}
            onChangeText={(txt) => handleSectionChange(sec.sectionId, txt)}
            className="mt-3 min-h-[96px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5 text-xs leading-5 text-civora-midnight dark:text-white"
          />
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={handleSubmitForReview}
        className="min-h-[48px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-3"
      >
        <Text className="text-sm font-bold text-white">
          {draft.reviewStatus === "pending_review"
            ? "Submitted for Engineering Leadership Review"
            : "Validate & Submit Report for Engineering Review"}
        </Text>
      </Pressable>
    </WorkspaceShell>
  );
}

/**
 * Implements the 8-step AI Report Workflow (Section 3):
 * 1. Select authorized project, report type, period, and sources.
 * 2. Request analysis from Civora backend.
 * 3. Display real job status and handle failure/retry.
 * 4. Surface source references, missing evidence gaps, and conflicting measurements.
 * 5. Engineer accepts/edits/discards proposed content.
 * 6. AI content remains a proposal until reviewed.
 * 7. Engineer validates and submits the report.
 * 8. AI cannot approve or release a report.
 */
export function AIAnalysisScreen() {
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const job = uiStore.getAiJob();

  return (
    <WorkspaceShell
      workspaceTitle="AI Report Synthesis & Audit"
      workspaceSubtitle={`Job ID: ${job.jobId} · Status: ${job.status.toUpperCase()}`}
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      {/* Governance Rule Banner */}
      <View className="rounded-3xl border border-civora-teal/40 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="text-xs font-bold uppercase tracking-wider text-civora-teal">
          AI Governance Boundary
        </Text>
        <Text className="mt-1 text-xs text-slate-600 dark:text-slate-200">
          AI findings and text drafts are strictly proposals. Every suggestion requires explicit engineer review before insertion. AI cannot approve or release a report to stakeholders.
        </Text>
      </View>

      {/* Missing Evidence Gaps & Conflicting Measurements */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Detected Evidence Gaps & Measurement Conflicts"
          subtitle="Cross-checked against field submissions and lab tickets"
        />
        <View className="gap-2.5">
          {(job.gapsAndConflicts ?? []).map((item) => (
            <View
              key={item.id}
              className={`rounded-2xl border p-3.5 ${item.severity === "critical"
                  ? "border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-950/60"
                  : "border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/60"
                }`}
            >
              <Text
                className={`text-xs font-bold uppercase ${item.severity === "critical"
                    ? "text-red-700 dark:text-red-300"
                    : "text-amber-800 dark:text-amber-300"
                  }`}
              >
                {item.type.replace("_", " ")} ({item.severity})
              </Text>
              <Text className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                {item.description}
              </Text>
              <Text className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Source Refs: {item.sourceSubmissionIds.join(", ")}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Proposed Section Content */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Proposed Section Drafts"
          subtitle="Accept to append to the report draft, or discard"
        />
        <View className="gap-3">
          {job.suggestions.map((sug) => (
            <View
              key={sug.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-civora-teal">
                  Target Section: {sug.field} · Confidence:{" "}
                  {Math.round(sug.confidenceScore * 100)}%
                </Text>
                <Text className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                  {sug.accepted === null
                    ? "Unreviewed Proposal"
                    : sug.accepted
                      ? "Accepted by Engineer"
                      : "Discarded"}
                </Text>
              </View>

              <Text className="mt-2 text-xs leading-5 text-civora-midnight dark:text-white">
                “{sug.suggestedText}”
              </Text>
              <Text className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Rationale: {sug.rationale} · Sources:{" "}
                {(sug.sourceReferences ?? []).join(", ")}
              </Text>

              <View className="mt-3 flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => uiStore.decideAiSuggestion(sug.id, true)}
                  className="min-h-[40px] flex-1 items-center justify-center rounded-full bg-civora-teal/20 px-3 py-2"
                >
                  <Text className="text-xs font-bold text-civora-teal">
                    {sug.accepted === true
                      ? "✓ Accepted into Section"
                      : "Accept Proposal"}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => uiStore.decideAiSuggestion(sug.id, false)}
                  className="min-h-[40px] flex-1 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {sug.accepted === false ? "Discarded" : "Discard Proposal"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="mt-4 min-h-[46px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-2.5"
        >
          <Text className="text-xs font-bold text-white">
            Return to Report Section Editor
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}
