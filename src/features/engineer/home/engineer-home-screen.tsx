import { useRouter } from "expo-router";
import { Phone, Send, UserCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import {
  BentoStatCard,
  EmptyState,
  HeroWeeklyProgressCard,
  ProjectCard,
  SectionHeader,
  SubmissionCard,
  SubmittalVolumeBarChart,
  TaskCard,
  WeekCalendarStrip,
} from "@/components/ui/primitives";
import {
  CONTRACT_CONFIRMED_SUBMISSIONS,
  CONTRACT_PROJECTS,
} from "@/constants/contract-catalog";
import { useLocalDrafts } from "@/hooks/use-drafts";
import { useAuth } from "@/providers/auth-provider";
import { isAuthorizedForProject } from "@/services/auth-service";
import { uiStore } from "@/store/ui-store";

export function EngineerHomeScreen() {
  const { user, triggerSessionExpirySimulation } = useAuth();
  const router = useRouter();
  const localDrafts = useLocalDrafts();
  const [, setTick] = useState(0);

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const authorizedProjects = CONTRACT_PROJECTS.filter((p) =>
    isAuthorizedForProject(user, p.id)
  );
  const activeProject = authorizedProjects[0];

  const myTasks = uiStore
    .getTasks()
    .filter((t) => isAuthorizedForProject(user, t.projectId));

  const recentConfirmedSubmissions = CONTRACT_CONFIRMED_SUBMISSIONS.filter(
    (s) => isAuthorizedForProject(user, s.projectId)
  );

  return (
    <WorkspaceShell
      workspaceTitle="Project Overview"
      workspaceSubtitle="Track site submissions, lab certificates, and report progress"
      roleBadgeLabel="ENGINEER"
      notificationRoute="/(engineer)/notifications"
    >
      {/* 1. Hero Weekly Progress Card (Reference Image 4 + Civora Web Context) */}
      <HeroWeeklyProgressCard
        eyebrow="Specification Compliance · 92%"
        title="Your Weekly Field Progress"
        subtitle="LAMATA Blue Line & Eko Atlantic Revetment QA/QC cadence on track"
        percent={68}
        ringCenterLabel="68%"
        ringSubLabel="7 days"
      />

      {/* 2. Bento 2x2 KPI Cards (Reference Image 4 + CivoraDashboard.tsx) */}
      <View className="flex-row flex-wrap gap-3">
        <BentoStatCard
          label="Submissions in Triage"
          value="142"
          unit="records"
          trendText="+7.1% vs last wk"
          accent="teal"
          onPress={() => router.push("/(engineer)/submissions")}
        />
        <BentoStatCard
          label="Avg. Resolution SLA"
          value="4.2"
          unit="hours"
          trendText="+2.0% faster"
          accent="blue"
          onPress={() => router.push("/(engineer)/tasks")}
        />
      </View>

      {/* 3. Field Ingestion Gateways (from CivoraDashboard.tsx on Web) */}
      <View className="rounded-2xl border border-slate-200/90 bg-white p-3.5 dark:border-slate-800 dark:bg-civora-steel">
        <Text className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Field Ingestion Gateways & Identity Verification
        </Text>
        <View className="gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(engineer)/submissions")}
            className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-civora-midnight"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <Phone size={15} color="#10B981" />
              </View>
              <View>
                <Text className="text-xs font-bold text-civora-midnight dark:text-white">
                  WhatsApp Business Gateway
                </Text>
                <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                  489 Ingested · COREN Verified
                </Text>
              </View>
            </View>
            <View className="rounded bg-emerald-100 px-2 py-0.5 dark:bg-emerald-500/20">
              <Text className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                LIVE
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(engineer)/submissions")}
            className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-civora-midnight"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15">
                <Send size={15} color="#0EA5E9" />
              </View>
              <View>
                <Text className="text-xs font-bold text-civora-midnight dark:text-white">
                  Telegram Bot API Gateway
                </Text>
                <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                  215 Ingested · Active
                </Text>
              </View>
            </View>
            <View className="rounded bg-sky-100 px-2 py-0.5 dark:bg-sky-500/20">
              <Text className="text-[10px] font-bold text-sky-800 dark:text-sky-300">
                LIVE
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(engineer)/reports")}
            className="flex-row items-center justify-between rounded-xl border border-civora-teal/30 bg-teal-50/60 px-3 py-2.5 dark:bg-civora-midnight"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-civora-midnight">
                <UserCheck size={15} color="#4FAAA7" />
              </View>
              <View>
                <Text className="text-xs font-bold text-civora-midnight dark:text-white">
                  Reporting Studio & AI Synthesis
                </Text>
                <Text className="text-[11px] text-slate-600 dark:text-slate-400">
                  2 AI Section Proposals Ready
                </Text>
              </View>
            </View>
            <View className="rounded bg-civora-midnight px-2 py-0.5">
              <Text className="text-[10px] font-bold text-civora-teal">
                OPEN
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* 4. Interactive Week Schedule Strip (Reference Image 4) */}
      <WeekCalendarStrip />

      {/* 5. Interactive Submittal Volume & Ingestion Bar Chart (Reference Image 4 + Civora Web) */}
      <SubmittalVolumeBarChart />

      {/* 6. Active Project Context */}
      {activeProject ? (
        <View>
          <SectionHeader
            title="Primary Active Project"
            actionLabel="All Projects"
            onActionPress={() => router.push("/(engineer)/projects")}
          />
          <ProjectCard
            project={activeProject}
            onPress={() =>
              router.push(`/(engineer)/projects/${activeProject.id}` as never)
            }
          />
        </View>
      ) : null}

      {/* 7. Device Drafts & Pending Upload Queue */}
      <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
        <SectionHeader
          title={`Device Drafts & Upload Queue (${localDrafts.length})`}
          subtitle="Saved on this device until Civora API confirms receipt"
          actionLabel="Open Queue"
          onActionPress={() => router.push("/(engineer)/submissions")}
        />
        {localDrafts.length === 0 ? (
          <EmptyState
            title="No Pending Device Drafts"
            description="Tap the center + button or New Submission to capture site evidence."
          />
        ) : (
          <View className="gap-2.5">
            {localDrafts.slice(0, 3).map((draft) => (
              <SubmissionCard
                key={draft.clientSubmissionId}
                draft={draft}
                onPress={() => router.push("/(engineer)/submissions")}
              />
            ))}
          </View>
        )}
      </View>

      {/* 8. Assigned Field Tasks */}
      <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
        <SectionHeader
          title="Assigned Engineering Tasks"
          actionLabel="View All"
          onActionPress={() => router.push("/(engineer)/tasks")}
        />
        <View className="gap-2.5">
          {myTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() =>
                router.push(`/(engineer)/tasks/${task.id}` as never)
              }
            />
          ))}
        </View>
      </View>

      {/* 9. Server-Confirmed Submissions */}
      <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
        <SectionHeader
          title="Recent Server-Confirmed Submittals"
          subtitle="Verified records stored on the Civora backend"
        />
        <View className="gap-2.5">
          {recentConfirmedSubmissions.map((record) => (
            <SubmissionCard
              key={record.id}
              record={record}
              onPress={() =>
                router.push(`/(engineer)/submissions/${record.id}` as never)
              }
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            await triggerSessionExpirySimulation();
            router.replace("/(auth)/session-expired");
          }}
          className="mt-4 min-h-[42px] items-center justify-center rounded-full border border-amber-400/50 bg-amber-50 px-3 py-2 dark:bg-civora-midnight"
        >
          <Text className="text-xs font-bold text-amber-800 dark:text-amber-300">
            Simulate Session Expiry (Tests Safe Local Draft Recovery)
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}
