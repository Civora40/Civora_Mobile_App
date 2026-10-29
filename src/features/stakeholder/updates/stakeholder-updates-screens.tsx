import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import {
  DocumentRow,
  MilestoneRow,
  SectionHeader,
} from "@/components/ui/primitives";
import {
  CONTRACT_DOCUMENTS,
  CONTRACT_MILESTONES,
  CONTRACT_STAKEHOLDER_RISKS,
  CONTRACT_STAKEHOLDER_UPDATES,
} from "@/constants/contract-catalog";
import { useAuth } from "@/providers/auth-provider";
import {
  hasPermission,
  isAuthorizedForProject,
} from "@/services/auth-service";

export function StakeholderUpdatesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const updates = CONTRACT_STAKEHOLDER_UPDATES.filter((u) =>
    isAuthorizedForProject(user, u.projectId)
  );

  const milestones = CONTRACT_MILESTONES.filter(
    (m) =>
      isAuthorizedForProject(user, m.projectId) &&
      m.approvedForStakeholders !== false
  );

  const releasedRisks = hasPermission(user, "risks:read_released")
    ? CONTRACT_STAKEHOLDER_RISKS.filter(
        (r) =>
          isAuthorizedForProject(user, r.projectId) &&
          r.releasedToStakeholders
      )
    : [];

  return (
    <WorkspaceShell
      workspaceTitle="Published Updates & Milestones"
      workspaceSubtitle="Official project announcements, schedule milestones, and released risk advisories"
      roleBadgeLabel="STAKEHOLDER"
      notificationRoute="/(stakeholder)/notifications"
    >
      {/* Published Updates Feed */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title={`Published Project Updates (${updates.length})`}
          subtitle="Tap an update to read full details and authorized attachments"
        />
        <View className="gap-3">
          {updates.map((upd) => (
            <Pressable
              key={upd.id}
              accessibilityRole="button"
              onPress={() =>
                router.push(`/(stakeholder)/updates/${upd.id}` as never)
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5 active:opacity-85"
            >
              <Text className="text-xs font-bold uppercase text-civora-teal">
                {upd.category.replace("_", " ")} ·{" "}
                {upd.publishedAtIso.slice(0, 10)}
              </Text>
              <Text className="mt-1 text-sm font-bold text-civora-midnight dark:text-white">
                {upd.title}
              </Text>
              <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {upd.summary}
              </Text>
              <Text className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Published by {upd.publishedBy}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Approved Milestones */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Approved Schedule Milestones"
          subtitle="Authoritative milestone progress"
        />
        <View className="gap-2.5">
          {milestones.map((ms) => (
            <MilestoneRow key={ms.id} milestone={ms} />
          ))}
        </View>
      </View>

      {/* Released Risks */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Approved Risk & Issue Advisories"
          subtitle="Internal crew notes are excluded"
        />
        <View className="gap-2.5">
          {releasedRisks.map((risk) => (
            <View
              key={risk.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5"
            >
              <Text className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                {risk.severity} severity · {risk.status}
              </Text>
              <Text className="mt-1 text-sm font-bold text-civora-midnight dark:text-white">
                {risk.title}
              </Text>
              <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {risk.mitigationSummary}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </WorkspaceShell>
  );
}

export function StakeholderUpdateDetailScreen() {
  const { updateId } = useLocalSearchParams<{ updateId: string }>();
  const update =
    CONTRACT_STAKEHOLDER_UPDATES.find((u) => u.id === updateId) ??
    CONTRACT_STAKEHOLDER_UPDATES[0];

  const attachedDocs = CONTRACT_DOCUMENTS.filter(
    (d) =>
      update.attachmentDocumentIds.includes(d.id) && d.releasedToStakeholders
  );

  return (
    <WorkspaceShell
      workspaceTitle="Published Update Detail"
      workspaceSubtitle={`${update.projectId} · ${update.publishedAtIso.slice(0, 10)}`}
      roleBadgeLabel="STAKEHOLDER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="text-xs font-bold uppercase text-civora-teal">
          {update.category.replace("_", " ")}
        </Text>
        <Text className="mt-1.5 text-lg font-extrabold text-civora-midnight dark:text-white">
          {update.title}
        </Text>
        <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Published by {update.publishedBy}
        </Text>

        <View className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5">
          <Text className="text-xs leading-5 text-slate-700 dark:text-slate-200">
            {update.body}
          </Text>
        </View>

        <View className="mt-4">
          <SectionHeader
            title={`Authorized Attachments (${attachedDocs.length})`}
          />
          <View className="gap-2.5">
            {attachedDocs.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </View>
        </View>
      </View>
    </WorkspaceShell>
  );
}
