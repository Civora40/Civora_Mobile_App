import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { TaskCard } from "@/components/ui/primitives";
import { useAuth } from "@/providers/auth-provider";
import { isAuthorizedForProject } from "@/services/auth-service";
import { uiStore } from "@/store/ui-store";
import { EngineeringTask } from "@/types/contracts";

export function EngineerTaskListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const tasks = uiStore
    .getTasks()
    .filter((t) => isAuthorizedForProject(user, t.projectId));

  return (
    <WorkspaceShell
      workspaceTitle="Assigned Engineering Tasks"
      workspaceSubtitle="Field verification checklists & due dates"
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPress={() =>
              router.push(`/(engineer)/tasks/${task.id}` as never)
            }
          />
        ))}
      </View>
    </WorkspaceShell>
  );
}

export function EngineerTaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const task =
    uiStore.getTaskById(taskId ?? "tsk_01") ?? uiStore.getTasks()[0];

  const statuses: EngineeringTask["status"][] = [
    "todo",
    "in_progress",
    "completed",
  ];

  return (
    <WorkspaceShell
      workspaceTitle="Task Detail & Status"
      workspaceSubtitle={`Task ID: ${task.id} · Project: ${task.projectId}`}
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="text-xs font-bold uppercase text-civora-teal">
          Priority: {task.priority} · Due: {task.dueAtIso.slice(0, 10)}
        </Text>
        <Text className="mt-1.5 text-base font-extrabold text-civora-midnight dark:text-white">
          {task.title}
        </Text>
        <Text className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
          {task.description}
        </Text>

        <Text className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
          Update Task Status (Local Contract State)
        </Text>
        <View className="flex-row gap-2">
          {statuses.map((st) => {
            const active = task.status === st;
            return (
              <Pressable
                key={st}
                accessibilityRole="button"
                onPress={() => uiStore.updateTaskStatus(task.id, st)}
                className={`min-h-[42px] flex-1 items-center justify-center rounded-xl border px-2 py-2 ${
                  active
                    ? "border-civora-teal bg-civora-teal/20"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase ${
                    active
                      ? "text-civora-teal"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {st.replace("_", " ")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(engineer)/submissions/create")}
          className="mt-4 min-h-[46px] items-center justify-center rounded-full bg-civora-midnight dark:bg-civora-blue px-4 py-2.5"
        >
          <Text className="text-xs font-bold text-white">
            + Attach Field Submission Evidence for This Task
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}
