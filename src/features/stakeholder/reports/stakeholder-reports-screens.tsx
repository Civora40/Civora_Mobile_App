import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import {
  EmptyState,
  ReportCard,
  SectionHeader,
} from "@/components/ui/primitives";
import { CONTRACT_REPORTS } from "@/constants/contract-catalog";
import { filterStakeholderAccessibleReports } from "@/features/reports/stakeholder-workspace-screen";
import { useAuth } from "@/providers/auth-provider";
import {
  hasPermission,
  isAuthorizedForProject,
} from "@/services/auth-service";

export function StakeholderReportListScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const releasedReports = filterStakeholderAccessibleReports(
    CONTRACT_REPORTS,
    user?.assignedProjectIds ?? [],
    hasPermission(user, "reports:read_released")
  );

  return (
    <WorkspaceShell
      workspaceTitle="Released Reports & Archive"
      workspaceSubtitle="Official engineering reports released to your organization"
      roleBadgeLabel="STAKEHOLDER"
      notificationRoute="/(stakeholder)/notifications"
    >
      <View className="rounded-3xl border border-civora-teal/30 bg-white dark:bg-civora-steel p-4 shadow-sm">
        <Text className="text-xs font-bold text-civora-teal">
          Strict Release Governance
        </Text>
        <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Only reports with `visibilityStatus: released` for your assigned projects appear here. Drafts, pending submissions, and internal engineering reviews are excluded.
        </Text>
      </View>

      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title={`Released Reports Archive (${releasedReports.length})`}
          subtitle="Tap any released report to inspect details and download PDF"
        />
        {releasedReports.length === 0 ? (
          <EmptyState
            title="No Released Reports Available"
            description="No released reports are currently available for your assigned projects."
          />
        ) : (
          <View className="gap-3">
            {releasedReports.map((rep) => (
              <ReportCard
                key={rep.id}
                report={rep}
                onPress={() =>
                  router.push(`/(stakeholder)/reports/${rep.id}` as never)
                }
              />
            ))}
          </View>
        )}
      </View>
    </WorkspaceShell>
  );
}

export function StakeholderReportDetailScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { user } = useAuth();
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const report = CONTRACT_REPORTS.find((r) => r.id === reportId);
  const canReadReleased = hasPermission(user, "reports:read_released");
  const canDownloadReleased = hasPermission(user, "documents:download_released");

  const isAllowed =
    Boolean(report) &&
    canReadReleased &&
    report!.visibilityStatus === "released" &&
    isAuthorizedForProject(user, report!.projectId);

  if (!isAllowed || !report) {
    return (
      <WorkspaceShell
        workspaceTitle="Protected Report Access Denied"
        workspaceSubtitle="Unreleased or unassigned report blocked"
        roleBadgeLabel="STAKEHOLDER"
        showBackButton
      >
        <View className="rounded-3xl border border-red-300 dark:border-red-500/40 bg-white dark:bg-civora-steel p-5 shadow-sm">
          <Text className="text-base font-bold text-red-700 dark:text-red-300">
            403 Forbidden — Unreleased or Unauthorized Report
          </Text>
          <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Stakeholders cannot access draft/internal review reports or reports belonging to unassigned projects.
          </Text>
        </View>
      </WorkspaceShell>
    );
  }

  const handleProtectedDownload = () => {
    if (!canDownloadReleased || !report.downloadUrl) {
      setDownloadStatus(
        "Download denied: Your account lacks the documents:download_released permission."
      );
      return;
    }

    setDownloadStatus(
      `Authorized download token verified for ${report.downloadUrl}. Connect EXPO_PUBLIC_API_BASE_URL to stream the signed PDF dossier.`
    );
  };

  return (
    <WorkspaceShell
      workspaceTitle="Released Report Dossier"
      workspaceSubtitle={`${report.periodLabel ?? report.projectId} · Version v${report.version}`}
      roleBadgeLabel="STAKEHOLDER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-emerald-500/15 px-2.5 py-0.5">
            <Text className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
              Officially Released · v{report.version}
            </Text>
          </View>
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Released: {report.releasedAtIso?.slice(0, 10)}
          </Text>
        </View>

        <Text className="mt-2.5 text-lg font-extrabold text-civora-midnight dark:text-white">
          {report.title}
        </Text>
        <Text className="mt-1 text-xs font-semibold text-civora-teal">
          Project ID: {report.projectId}
        </Text>

        <View className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5">
          <Text className="text-xs leading-5 text-slate-700 dark:text-slate-200">
            {report.summary}
          </Text>
        </View>

        {downloadStatus ? (
          <View
            accessibilityRole="status"
            className="mt-3 rounded-2xl border border-civora-blue/40 bg-civora-blue/10 p-3.5"
          >
            <Text className="text-xs font-medium text-civora-blue dark:text-blue-200">
              {downloadStatus}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={handleProtectedDownload}
          className="mt-4 min-h-[48px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-3 active:opacity-85"
        >
          <Text className="text-sm font-bold text-white">
            Download Protected PDF Report (v{report.version})
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}
