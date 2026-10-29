import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import {
  BentoStatCard,
  EmptyState,
  HeroWeeklyProgressCard,
  MilestoneRow,
  ProjectCard,
  ReportCard,
  SectionHeader,
  WeekCalendarStrip,
} from "@/components/ui/primitives";
import {
  CONTRACT_MILESTONES,
  CONTRACT_PROJECTS,
  CONTRACT_REPORTS,
  CONTRACT_STAKEHOLDER_UPDATES,
} from "@/constants/contract-catalog";
import { filterStakeholderAccessibleReports } from "@/features/reports/stakeholder-workspace-screen";
import { useAuth } from "@/providers/auth-provider";
import {
  hasPermission,
  isAuthorizedForProject,
} from "@/services/auth-service";

export function StakeholderOverviewScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const assignedProjects = CONTRACT_PROJECTS.filter((p) =>
    isAuthorizedForProject(user, p.id)
  );

  const releasedReports = filterStakeholderAccessibleReports(
    CONTRACT_REPORTS,
    user?.assignedProjectIds ?? [],
    hasPermission(user, "reports:read_released")
  );

  const approvedMilestones = CONTRACT_MILESTONES.filter(
    (m) =>
      isAuthorizedForProject(user, m.projectId) &&
      m.approvedForStakeholders !== false
  );

  const publishedUpdates = CONTRACT_STAKEHOLDER_UPDATES.filter((u) =>
    isAuthorizedForProject(user, u.projectId)
  );

  return (
    <WorkspaceShell
      workspaceTitle="Stakeholder Overview"
      workspaceSubtitle="Authorized read-only view of assigned projects & released reports"
      roleBadgeLabel="STAKEHOLDER"
      notificationRoute="/(stakeholder)/notifications"
    >
      {/* 1. Hero Executive Portfolio Snapshot (Reference Image 4 + StakeholderOversight.tsx) */}
      <HeroWeeklyProgressCard
        eyebrow="Authorized Read-Only Access"
        title="Executive Milestone Progress"
        subtitle="Verified across LAMATA Blue Line Viaduct & Concourse packages"
        percent={78}
        ringCenterLabel="78%"
        ringSubLabel="Verified"
      />

      {/* 2. Bento 2-Column Executive Summary Cards (from StakeholderOversight.tsx) */}
      <View className="flex-row flex-wrap gap-3">
        <BentoStatCard
          label="Assigned Projects"
          value={String(assignedProjects.length)}
          unit="active"
          trendText="Authoritative scope"
          accent="midnight"
          onPress={() => router.push("/(stakeholder)/projects")}
        />
        <BentoStatCard
          label="Released Reports"
          value={String(releasedReports.length)}
          unit="dossiers"
          trendText="Signed PDF ready"
          accent="blue"
          onPress={() => router.push("/(stakeholder)/reports")}
        />
      </View>

      {/* 3. Milestone Schedule Calendar Strip */}
      <WeekCalendarStrip monthLabel="October 2026 — Milestone Schedule" />

      {/* 4. Assigned Projects Snapshot */}
      <View>
        <SectionHeader
          title={`Assigned Projects (${assignedProjects.length})`}
          subtitle="Authoritative metrics verified by engineering leadership"
          actionLabel="All Projects"
          onActionPress={() => router.push("/(stakeholder)/projects")}
        />
        {assignedProjects.length === 0 ? (
          <EmptyState
            title="No Projects Assigned"
            description="Your stakeholder profile currently has no assigned project IDs. Contact your Civora administrator."
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
      </View>

      {/* 5. Recently Released Reports */}
      <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
        <SectionHeader
          title={`Recently Released Reports (${releasedReports.length})`}
          subtitle="Drafts and internal engineering reviews are never exposed"
          actionLabel="Archive"
          onActionPress={() => router.push("/(stakeholder)/reports")}
        />
        <View className="gap-2.5">
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
      </View>

      {/* 6. Upcoming Approved Milestones */}
      <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
        <SectionHeader
          title="Approved Project Milestones"
          subtitle="Verified schedule checkpoints"
        />
        <View className="gap-2.5">
          {approvedMilestones.map((ms) => (
            <MilestoneRow key={ms.id} milestone={ms} />
          ))}
        </View>
      </View>

      {/* 7. Recent Published Updates */}
      <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
        <SectionHeader
          title="Recent Published Updates"
          actionLabel="All Updates"
          onActionPress={() => router.push("/(stakeholder)/updates")}
        />
        <View className="gap-2.5">
          {publishedUpdates.map((upd) => (
            <Pressable
              key={upd.id}
              accessibilityRole="button"
              onPress={() =>
                router.push(`/(stakeholder)/updates/${upd.id}` as never)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 active:opacity-85 dark:border-slate-700 dark:bg-civora-midnight"
            >
              <Text className="text-xs font-bold uppercase text-civora-teal">
                {upd.category.replace("_", " ")} ·{" "}
                {upd.publishedAtIso.slice(0, 10)}
              </Text>
              <Text className="mt-1 text-sm font-bold text-civora-midnight dark:text-white">
                {upd.title}
              </Text>
              <Text
                className="mt-1 text-xs text-slate-600 dark:text-slate-300"
                numberOfLines={2}
              >
                {upd.summary}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </WorkspaceShell>
  );
}
