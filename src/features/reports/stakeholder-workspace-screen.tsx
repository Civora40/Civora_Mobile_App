import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { useAuth } from "@/providers/auth-provider";
import {
  hasPermission,
  isAuthorizedForProject,
} from "@/services/auth-service";
import { CivoraReport, MilestoneItem } from "@/types/contracts";

/**
 * Filter helper enforcing that stakeholders can ONLY view reports whose
 * visibilityStatus is "released" AND belong to an assigned project.
 * (Backend must also enforce this on `/v1/projects/:id/reports/released`.)
 */
export function filterStakeholderAccessibleReports(
  reports: CivoraReport[],
  assignedProjectIds: string[],
  canReadReleased: boolean
): CivoraReport[] {
  if (!canReadReleased) return [];
  const allowedProjects = new Set(assignedProjectIds);
  return reports.filter(
    (report) =>
      report.visibilityStatus === "released" &&
      allowedProjects.has(report.projectId)
  );
}

const SAMPLE_REPORTS_CONTRACT: CivoraReport[] = [
  {
    id: "rep_rel_horizon_q3",
    projectId: "proj_horizon_tower",
    title: "Horizon Tower — Structural Core & Milestone Verification #04",
    summary:
      "Independent engineering verification confirming Level 12–14 post-tensioned slab curing and load compliance.",
    visibilityStatus: "released",
    version: 3,
    releasedAtIso: "2026-10-20T14:30:00.000Z",
    downloadUrl: "/v1/reports/rep_rel_horizon_q3/download",
  },
  {
    id: "rep_draft_horizon_internal",
    projectId: "proj_horizon_tower",
    title: "Internal Field Notes — Formwork Adjustment (Unreleased Draft)",
    summary: "Internal engineering working draft; not released to stakeholders.",
    visibilityStatus: "draft",
    version: 1,
    releasedAtIso: null,
    downloadUrl: null,
  },
  {
    id: "rep_rel_unassigned_project",
    projectId: "proj_restricted_tunnel",
    title: "Restricted Tunnel Project — Executive Report",
    summary: "Belongs to a project outside the stakeholder's assigned scope.",
    visibilityStatus: "released",
    version: 2,
    releasedAtIso: "2026-10-18T09:00:00.000Z",
    downloadUrl: "/v1/reports/rep_rel_unassigned_project/download",
  },
];

const SAMPLE_MILESTONES: MilestoneItem[] = [
  {
    id: "ms_01",
    projectId: "proj_horizon_tower",
    title: "Substructure & Foundation Sign-Off",
    dueDateIso: "2026-08-15",
    status: "completed",
    progressPercent: 100,
  },
  {
    id: "ms_02",
    projectId: "proj_horizon_tower",
    title: "Superstructure Core Level 15 Completion",
    dueDateIso: "2026-11-30",
    status: "in_progress",
    progressPercent: 78,
  },
];

export function StakeholderWorkspaceScreen() {
  const { user } = useAuth();
  const [downloadAuditMessage, setDownloadAuditMessage] = useState<string | null>(
    null
  );

  const canReadReleased = hasPermission(user, "reports:read_released");
  const canDownloadReleased = hasPermission(
    user,
    "documents:download_released"
  );

  const accessibleReports = filterStakeholderAccessibleReports(
    SAMPLE_REPORTS_CONTRACT,
    user?.assignedProjectIds ?? [],
    canReadReleased
  );

  const handleProtectedDownloadRequest = (report: CivoraReport) => {
    if (!canDownloadReleased) {
      setDownloadAuditMessage(
        "Access denied: Your account does not hold the documents:download_released permission."
      );
      return;
    }
    if (!isAuthorizedForProject(user, report.projectId)) {
      setDownloadAuditMessage(
        `Access denied: Project ${report.projectId} is not in your authorized scope.`
      );
      return;
    }
    if (report.visibilityStatus !== "released" || !report.downloadUrl) {
      setDownloadAuditMessage(
        "Access denied: Only released reports with a signed download endpoint can be downloaded."
      );
      return;
    }

    setDownloadAuditMessage(
      `Protected download requested via authorized endpoint (${report.downloadUrl}). Connect EXPO_PUBLIC_API_BASE_URL to stream the signed PDF.`
    );
  };

  return (
    <WorkspaceShell
      workspaceTitle="Stakeholder Executive Workspace"
      workspaceSubtitle="Review verified milestones, project updates, and officially released reports."
      roleBadgeLabel="STAKEHOLDER"
    >
      <View className="rounded-2xl border border-slate-800 bg-civora-steel p-4">
        <Text className="text-sm font-bold text-civora-teal">
          Role & Access Boundaries
        </Text>
        <Text className="mt-1 text-xs text-slate-300">
          This workspace is strictly scoped to assigned projects (
          {(user?.assignedProjectIds ?? []).join(", ") || "none"}) and released
          reports only. Unreleased engineering drafts and unassigned projects are
          filtered out and blocked at the API layer.
        </Text>
      </View>

      {/* Project Milestones */}
      <View className="rounded-2xl border border-slate-800 bg-civora-steel p-4">
        <Text className="text-base font-bold text-white">
          Verified Project Milestones
        </Text>
        <View className="mt-3 gap-3">
          {SAMPLE_MILESTONES.filter((m) =>
            isAuthorizedForProject(user, m.projectId)
          ).map((milestone) => (
            <View
              key={milestone.id}
              className="rounded-xl border border-slate-700 bg-civora-midnight p-3.5"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-white">
                  {milestone.title}
                </Text>
                <Text className="text-xs font-bold text-civora-teal">
                  {milestone.progressPercent}%
                </Text>
              </View>
              <Text className="mt-1 text-xs text-slate-400">
                Target Date: {milestone.dueDateIso} · Status:{" "}
                {milestone.status.replace("_", " ")}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Released Reports */}
      <View className="rounded-2xl border border-slate-800 bg-civora-steel p-4">
        <Text className="text-base font-bold text-white">
          Released Reports ({accessibleReports.length})
        </Text>
        <Text className="mt-0.5 text-xs text-slate-300">
          Only reports marked Released by engineering leadership appear here.
        </Text>

        {downloadAuditMessage ? (
          <View
            accessibilityRole="status"
            className="mt-3 rounded-xl border border-civora-blue/50 bg-civora-midnight p-3"
          >
            <Text className="text-xs text-blue-200">
              {downloadAuditMessage}
            </Text>
          </View>
        ) : null}

        <View className="mt-3 gap-3">
          {accessibleReports.map((report) => (
            <View
              key={report.id}
              className="rounded-xl border border-slate-700 bg-civora-midnight p-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="rounded bg-emerald-500/20 px-2 py-0.5">
                  <Text className="text-[11px] font-bold uppercase text-emerald-300">
                    Released · v{report.version}
                  </Text>
                </View>
                <Text className="text-xs text-slate-400">
                  {report.projectId}
                </Text>
              </View>

              <Text className="mt-2 text-sm font-bold text-white">
                {report.title}
              </Text>
              <Text className="mt-1 text-xs text-slate-300">
                {report.summary}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Download released report ${report.title}`}
                onPress={() => handleProtectedDownloadRequest(report)}
                className="mt-3 min-h-[44px] items-center justify-center rounded-xl bg-civora-blue px-4 py-2.5 active:opacity-85"
              >
                <Text className="text-xs font-bold text-white">
                  Request Authorized Document Download
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </WorkspaceShell>
  );
}

