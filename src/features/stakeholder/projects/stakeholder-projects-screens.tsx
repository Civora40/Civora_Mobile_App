import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import {
  DocumentRow,
  EmptyState,
  MilestoneRow,
  ProjectCard,
  ProjectStatusBadge,
  SectionHeader,
} from "@/components/ui/primitives";
import {
  CONTRACT_DOCUMENTS,
  CONTRACT_MILESTONES,
  CONTRACT_PROJECT_CONTACTS,
  CONTRACT_PROJECTS,
  CONTRACT_STAKEHOLDER_RISKS,
} from "@/constants/contract-catalog";
import { useAuth } from "@/providers/auth-provider";
import {
  hasPermission,
  isAuthorizedForProject,
} from "@/services/auth-service";

export function StakeholderProjectListScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const assignedProjects = CONTRACT_PROJECTS.filter((p) =>
    isAuthorizedForProject(user, p.id)
  );

  return (
    <WorkspaceShell
      workspaceTitle="Assigned Projects"
      workspaceSubtitle="Projects authorized for your stakeholder organization"
      roleBadgeLabel="STAKEHOLDER"
      notificationRoute="/(stakeholder)/notifications"
    >
      {assignedProjects.length === 0 ? (
        <EmptyState
          title="No Assigned Projects"
          description="You do not currently have any projects assigned to your stakeholder account."
        />
      ) : (
        <View className="gap-3">
          {assignedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() =>
                router.push(`/(stakeholder)/projects/${project.id}` as never)
              }
            />
          ))}
        </View>
      )}
    </WorkspaceShell>
  );
}

export function StakeholderProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();

  const resolvedId = projectId ?? "proj_horizon_tower";
  const authorized = isAuthorizedForProject(user, resolvedId);
  const project = CONTRACT_PROJECTS.find((p) => p.id === resolvedId);

  if (!authorized || !project) {
    return (
      <WorkspaceShell
        workspaceTitle="Unauthorized Project ID"
        workspaceSubtitle="Access blocked by stakeholder project scope"
        roleBadgeLabel="STAKEHOLDER"
        showBackButton
      >
        <View className="rounded-3xl border border-red-300 dark:border-red-500/40 bg-white dark:bg-civora-steel p-5 shadow-sm">
          <Text className="text-base font-bold text-red-700 dark:text-red-300">
            Access Denied ({resolvedId})
          </Text>
          <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Stakeholder accounts can only view projects explicitly listed in their backend `assignedProjectIds` scope.
          </Text>
        </View>
      </WorkspaceShell>
    );
  }

  const milestones = CONTRACT_MILESTONES.filter(
    (m) => m.projectId === project.id && m.approvedForStakeholders !== false
  );

  // Only contacts explicitly approved for sharing (`sharedWithStakeholders: true`)
  const approvedContacts = CONTRACT_PROJECT_CONTACTS.filter(
    (c) => c.projectId === project.id && c.sharedWithStakeholders
  );

  // Only documents released to stakeholders (`releasedToStakeholders: true`)
  const releasedDocuments = CONTRACT_DOCUMENTS.filter(
    (d) => d.projectId === project.id && d.releasedToStakeholders
  );

  // Only risks released to stakeholders when `risks:read_released` is held
  const releasedRisks = hasPermission(user, "risks:read_released")
    ? CONTRACT_STAKEHOLDER_RISKS.filter(
        (r) => r.projectId === project.id && r.releasedToStakeholders
      )
    : [];

  return (
    <WorkspaceShell
      workspaceTitle={project.name}
      workspaceSubtitle={`${project.code} · Verified Stakeholder Dossier`}
      roleBadgeLabel="STAKEHOLDER"
      showBackButton
    >
      {/* Progress Summary with Data Timestamp & Metric Explanation */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase text-civora-teal">
            Overall Progress: {project.completionPercent}%
          </Text>
          <ProjectStatusBadge status={project.status} />
        </View>
        <Text className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Authoritative Data Timestamp: {project.updatedAtIso}
        </Text>
        <Text className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-200">
          <Text className="font-bold text-civora-teal">
            Metric Methodology:{" "}
          </Text>
          {project.metricExplanation}
        </Text>
      </View>

      {/* Approved Timeline & Milestones */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Approved Timeline & Milestones"
          subtitle="Schedule checkpoints verified for stakeholder release"
        />
        <View className="gap-2.5">
          {milestones.map((ms) => (
            <MilestoneRow key={ms.id} milestone={ms} />
          ))}
        </View>
      </View>

      {/* Released Documents */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title={`Released Project Documents (${releasedDocuments.length})`}
          subtitle="Internal working drawings and redlines are excluded"
        />
        <View className="gap-2.5">
          {releasedDocuments.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </View>
      </View>

      {/* Released Risks & Issues */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title={`Released Risks & Mitigations (${releasedRisks.length})`}
          subtitle="Only approved executive risk advisories are displayed"
        />
        <View className="gap-2.5">
          {releasedRisks.map((risk) => (
            <View
              key={risk.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5"
            >
              <Text className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                Severity: {risk.severity} · Status: {risk.status}
              </Text>
              <Text className="mt-1 text-sm font-bold text-civora-midnight dark:text-white">
                {risk.title}
              </Text>
              <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Mitigation: {risk.mitigationSummary}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Approved Project Contacts */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Key Project Contacts"
          subtitle="Contacts approved for stakeholder communication"
        />
        <View className="gap-2.5">
          {approvedContacts.map((c) => (
            <View
              key={c.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5"
            >
              <Text className="text-sm font-bold text-civora-midnight dark:text-white">
                {c.fullName}
              </Text>
              <Text className="text-xs font-semibold text-civora-teal">
                {c.roleTitle}
              </Text>
              <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {c.organization} · {c.email}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </WorkspaceShell>
  );
}
