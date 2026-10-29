import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { NotificationRow, SectionHeader } from "@/components/ui/primitives";
import { useAuth } from "@/providers/auth-provider";
import { ThemeMode, useCivoraTheme } from "@/providers/theme-provider";
import { hasMultipleWorkspaces } from "@/services/auth-service";
import { uiStore } from "@/store/ui-store";

const THEME_MODES: { mode: ThemeMode; label: string }[] = [
  { mode: "system", label: "System Default" },
  { mode: "light", label: "Light Mode" },
  { mode: "dark", label: "Dark Mode" },
];

export function EngineerProfileScreen() {
  const { user, signOut } = useAuth();
  const { mode, setMode, isDark } = useCivoraTheme();
  const router = useRouter();
  const canSwitchWorkspace = hasMultipleWorkspaces(user);

  return (
    <WorkspaceShell
      workspaceTitle="Engineer Profile & Controls"
      workspaceSubtitle="Account permissions, appearance theme, and field support"
      roleBadgeLabel="ENGINEER"
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="text-base font-extrabold text-civora-midnight dark:text-white">
          {user?.fullName}
        </Text>
        <Text className="mt-0.5 text-xs font-semibold text-civora-teal">
          {user?.email} · {user?.organizationName}
        </Text>

        <View className="mt-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5">
          <Text className="text-xs font-bold text-civora-midnight dark:text-slate-200">
            Assigned Projects ({user?.assignedProjectIds.length ?? 0}):
          </Text>
          <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {(user?.assignedProjectIds ?? []).join(", ")}
          </Text>
          <Text className="mt-2.5 text-xs font-bold text-civora-midnight dark:text-slate-200">
            Verified Backend Permissions:
          </Text>
          <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {(user?.permissions ?? []).join(" · ")}
          </Text>
        </View>

        {/* Appearance Theme Control */}
        <View className="mt-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Appearance Theme ({isDark ? "Dark Active" : "Light Active"})
          </Text>
          <View className="flex-row gap-2">
            {THEME_MODES.map((opt) => {
              const active = mode === opt.mode;
              return (
                <Pressable
                  key={opt.mode}
                  accessibilityRole="button"
                  onPress={() => setMode(opt.mode)}
                  className={`min-h-[40px] flex-1 items-center justify-center rounded-xl border px-2 py-2 ${
                    active
                      ? "border-civora-teal bg-civora-teal/15"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      active
                        ? "text-civora-teal"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4 gap-2.5">
          {canSwitchWorkspace ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/workspace-switch")}
              className="min-h-[46px] items-center justify-center rounded-full border border-civora-teal bg-civora-teal/10 px-4 py-2.5"
            >
              <Text className="text-xs font-bold text-civora-teal">
                Switch Active Workspace (Engineer / Stakeholder)
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(engineer)/profile/preferences")}
            className="min-h-[46px] items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-4 py-2.5"
          >
            <Text className="text-xs font-semibold text-civora-midnight dark:text-white">
              Notification & Sync Preferences
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(engineer)/profile/support")}
            className="min-h-[46px] items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight px-4 py-2.5"
          >
            <Text className="text-xs font-semibold text-civora-midnight dark:text-white">
              Field Engineering Help & Support
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => signOut()}
            className="min-h-[46px] items-center justify-center rounded-full border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/60 px-4 py-2.5"
          >
            <Text className="text-xs font-bold text-red-700 dark:text-red-300">
              Sign Out & Clear Protected Cache
            </Text>
          </Pressable>
        </View>
      </View>
    </WorkspaceShell>
  );
}

export function EngineerPreferencesScreen() {
  const [, setTick] = useState(0);
  const { mode, setMode } = useCivoraTheme();

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const prefs = uiStore.getPreferences();

  return (
    <WorkspaceShell
      workspaceTitle="Engineer Preferences"
      workspaceSubtitle="Configure push alerts, conflict notifications, and theme"
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Appearance Mode"
          subtitle="Automatically follows your phone OS theme or override manually"
        />
        <View className="flex-row gap-2">
          {THEME_MODES.map((opt) => {
            const active = mode === opt.mode;
            return (
              <Pressable
                key={opt.mode}
                accessibilityRole="button"
                onPress={() => setMode(opt.mode)}
                className={`min-h-[40px] flex-1 items-center justify-center rounded-xl border px-2 py-2 ${
                  active
                    ? "border-civora-teal bg-civora-teal/15"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active
                      ? "text-civora-teal"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-2 flex-row items-center justify-between py-2">
          <Text className="text-sm font-semibold text-civora-midnight dark:text-white">
            Push Notifications
          </Text>
          <Switch
            value={prefs.pushEnabled}
            onValueChange={(v) => uiStore.updatePreferences({ pushEnabled: v })}
          />
        </View>
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-sm font-semibold text-civora-midnight dark:text-white">
            Task Assignment Alerts
          </Text>
          <Switch
            value={prefs.taskAssignments}
            onValueChange={(v) =>
              uiStore.updatePreferences({ taskAssignments: v })
            }
          />
        </View>
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-sm font-semibold text-civora-midnight dark:text-white">
            Submission Conflict Warnings
          </Text>
          <Switch
            value={prefs.submissionConflicts}
            onValueChange={(v) =>
              uiStore.updatePreferences({ submissionConflicts: v })
            }
          />
        </View>
      </View>
    </WorkspaceShell>
  );
}

export function EngineerSupportScreen() {
  return (
    <WorkspaceShell
      workspaceTitle="Civora Field Support"
      workspaceSubtitle="Technical guidance for site engineers"
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Offline & Evidence Upload Guidance"
          subtitle="How Civora protects your field submissions on low-connectivity sites"
        />
        <Text className="text-xs leading-5 text-slate-600 dark:text-slate-300">
          1. Field submissions are always saved locally on your device first (`Saved on this device`).{"\n"}
          2. Every upload uses a unique `Idempotency-Key` so retrying a failed upload never creates duplicate records.{"\n"}
          3. If another engineer updates the same submission on the server, Civora flags a `409 Conflict` so you can review changes safely.
        </Text>
      </View>
    </WorkspaceShell>
  );
}

export function EngineerNotificationsScreen() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const notifications = uiStore.getNotifications("engineer");

  return (
    <WorkspaceShell
      workspaceTitle="Engineer Notifications"
      workspaceSubtitle="Task assignments, AI job completions, and upload alerts"
      roleBadgeLabel="ENGINEER"
      showBackButton
    >
      <View className="gap-3">
        {notifications.map((n) => (
          <NotificationRow
            key={n.id}
            notification={n}
            onPress={() => uiStore.markNotificationRead(n.id)}
          />
        ))}
      </View>
    </WorkspaceShell>
  );
}
