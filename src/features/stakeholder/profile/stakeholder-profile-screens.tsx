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

export function StakeholderProfileScreen() {
  const { user, signOut } = useAuth();
  const { mode, setMode, isDark } = useCivoraTheme();
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const prefs = uiStore.getPreferences();
  const canSwitchWorkspace = hasMultipleWorkspaces(user);

  return (
    <WorkspaceShell
      workspaceTitle="Stakeholder Profile & Access"
      workspaceSubtitle="Assigned project scope, appearance theme, and support"
      roleBadgeLabel="STAKEHOLDER"
      notificationRoute="/(stakeholder)/notifications"
    >
      {/* Profile & Assigned Access Summary */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <Text className="text-base font-extrabold text-civora-midnight dark:text-white">
          {user?.fullName}
        </Text>
        <Text className="mt-0.5 text-xs font-semibold text-civora-teal">
          {user?.email} · {user?.organizationName}
        </Text>

        <View className="mt-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-civora-midnight p-3.5">
          <Text className="text-xs font-bold text-civora-midnight dark:text-slate-200">
            Assigned Project Access Scope ({user?.assignedProjectIds.length ?? 0}):
          </Text>
          <Text className="mt-1 text-xs font-semibold text-civora-teal">
            {(user?.assignedProjectIds ?? []).join(", ") || "None"}
          </Text>

          <Text className="mt-2.5 text-xs font-bold text-civora-midnight dark:text-slate-200">
            Authorized Stakeholder Capabilities:
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

        {canSwitchWorkspace ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(auth)/workspace-switch")}
            className="mt-4 min-h-[46px] items-center justify-center rounded-full border border-civora-teal bg-civora-teal/10 px-4 py-2.5"
          >
            <Text className="text-xs font-bold text-civora-teal">
              Switch Active Workspace (Engineer / Stakeholder)
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Notification Preferences */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Notification Preferences"
          subtitle="Receive alerts when new reports or updates are released"
        />
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-sm font-semibold text-civora-midnight dark:text-white">
            Push Notifications for Released Reports
          </Text>
          <Switch
            value={prefs.reportReleases}
            onValueChange={(v) =>
              uiStore.updatePreferences({ reportReleases: v })
            }
          />
        </View>
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-sm font-semibold text-civora-midnight dark:text-white">
            Weekly Executive Email Digest
          </Text>
          <Switch
            value={prefs.emailDigestEnabled}
            onValueChange={(v) =>
              uiStore.updatePreferences({ emailDigestEnabled: v })
            }
          />
        </View>
      </View>

      {/* Support & Sign Out */}
      <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-civora-steel p-5 shadow-sm">
        <SectionHeader
          title="Stakeholder Governance & Support"
          subtitle="Need access to an additional project or historical report?"
        />
        <Text className="text-xs leading-5 text-slate-600 dark:text-slate-300">
          Project assignments and report releases are governed by your organization’s Project Controls Office on the Civora backend.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => signOut()}
          className="mt-4 min-h-[46px] items-center justify-center rounded-full border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/60 px-4 py-2.5"
        >
          <Text className="text-xs font-bold text-red-700 dark:text-red-300">
            Sign Out & Clear Protected Cache
          </Text>
        </Pressable>
      </View>
    </WorkspaceShell>
  );
}

export function StakeholderNotificationsScreen() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return uiStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const notifications = uiStore.getNotifications("stakeholder");

  return (
    <WorkspaceShell
      workspaceTitle="Stakeholder Notifications"
      workspaceSubtitle="Released report alerts and milestone updates"
      roleBadgeLabel="STAKEHOLDER"
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
