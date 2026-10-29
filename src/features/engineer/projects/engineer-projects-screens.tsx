import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
} from "@/constants/contract-catalog";
import { useAuth } from "@/providers/auth-provider";
import { isAuthorizedForProject } from "@/services/auth-service";

export function EngineerProjectListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const assignedProjects = CONTRACT_PROJECTS.filter(
    (project) =>
      isAuthorizedForProject(user, project.id) &&
      (project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <WorkspaceShell
      workspaceTitle="Assigned Engineering Projects"
      workspaceSubtitle="Scoped strictly to your authorized project assignments"
      roleBadgeLabel="ENGINEER"
      notificationRoute="/(engineer)/notifications"
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-3.5 shadow-sm">
        <TextInput
          accessibilityLabel="Search assigned projects"
          placeholder="Search by project name or code..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="min-h-[44px] rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-4 text-sm text-civora-midnight dark:text-white"
        />
      </View>

      {assignedProjects.length === 0 ? (
        <EmptyState
          title="No Matching Assigned Projects"
          description="No assigned projects match your current search filter."
        />
      ) : (
        <View className="gap-3">
          {assignedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() =>
                router.push(`/(engineer)/projects/${project.id}` as never)
              }
            />
          ))}
        </View>
      )}
    </WorkspaceShell>
  );
}

export function EngineerProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const resolvedId = projectId ?? "proj_horizon_tower";
  const authorized = isAuthorizedForProject(user, resolvedId);
  const project = CONTRACT_PROJECTS.find((p) => p.id === resolvedId);

  if (!authorized || !project) {
    return (
      <WorkspaceShell
        workspaceTitle="Unauthorized Project Scope"
        workspaceSubtitle="Project access blocked by permission boundary"
        roleBadgeLabel="ENGINEER"
        showBackButton
      >
        <View className="rounded-3xl border border-red-300 dark:border-red-500/40 bg-white dark:bg-civora-steel p-5 shadow-sm">
          <Text className="text-base font-bold text-red-700 dark:text-red-300">
            Project Access Denied ({resolvedId})
          </Text>
          <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            This project ID is not included in your authenticated assignedProjectIds scope.
          </Text>
        </View>
      </WorkspaceShell>
    );
  }

  const docs = CONTRACT_DOCUMENTS.filter((d) => d.projectId === project.id);

  return (
    <WorkspaceShell
      workspaceTitle={project.name}
      workspaceSubtitle={`${project.code} · ${project.location}`}
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase text-civora-teal">
            {project.phaseLabel ?? "Active Phase"}
          </Text>
          <ProjectStatusBadge status={project.status} />
        </View>
        <Text className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          {project.metricExplanation}
        </Text>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(`/(engineer)/projects/${project.id}/milestones` as never)
            }
            className="min-h-[44px] flex-1 items-center justify-center rounded-full border border-civora-teal bg-civora-teal/10 px-3 py-2"
          >
            <Text className="text-xs font-bold text-civora-teal">
              Milestones & Schedule
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(`/(engineer)/projects/${project.id}/team` as never)
            }
            className="min-h-[44px] flex-1 items-center justify-center rounded-full border border-civora-blue bg-civora-blue/10 px-3 py-2"
          >
            <Text className="text-xs font-bold text-civora-blue dark:text-blue-300">
              Engineering Team
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Project Specifications & Drawings"
          subtitle="Includes both internal engineering redlines and released certificates"
        />
        <View className="gap-2.5">
          {docs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </View>
      </View>
    </WorkspaceShell>
  );
}

export function EngineerProjectTeamScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const resolvedId = projectId ?? "proj_horizon_tower";
  const contacts = CONTRACT_PROJECT_CONTACTS.filter(
    (c) => c.projectId === resolvedId
  );

  return (
    <WorkspaceShell
      workspaceTitle="Project Engineering Team"
      workspaceSubtitle={`Contacts & Field Roles (${resolvedId})`}
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="gap-3">
        {contacts.map((c) => (
          <View
            key={c.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-4 shadow-sm"
          >
            <Text className="text-sm font-bold text-civora-midnight dark:text-white">
              {c.fullName}
            </Text>
            <Text className="mt-0.5 text-xs font-semibold text-civora-teal">
              {c.roleTitle}
            </Text>
            <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {c.organization} · {c.email}
            </Text>
          </View>
        ))}
      </View>
    </WorkspaceShell>
  );
}

export function EngineerProjectMilestonesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const resolvedId = projectId ?? "proj_horizon_tower";
  const milestones = CONTRACT_MILESTONES.filter(
    (m) => m.projectId === resolvedId
  );

  return (
    <WorkspaceShell
      workspaceTitle="Project Schedule & Milestones"
      workspaceSubtitle={`Engineering Milestone Tracking (${resolvedId})`}
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="gap-3">
        {milestones.map((m) => (
          <MilestoneRow key={m.id} milestone={m} />
        ))}
      </View>
    </WorkspaceShell>
  );
}
