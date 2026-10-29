import { useRouter } from "expo-router";
import { ArrowLeft, Bell, LogOut, Moon, Sun } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkAndContractBanner } from "@/components/feedback/network-banner";
import { useAuth } from "@/providers/auth-provider";
import { useCivoraTheme } from "@/providers/theme-provider";

interface WorkspaceShellProps {
  workspaceTitle: string;
  workspaceSubtitle: string;
  roleBadgeLabel: string;
  showBackButton?: boolean;
  notificationRoute?:
    | "/(engineer)/notifications"
    | "/(stakeholder)/notifications";
  children: React.ReactNode;
}

export function WorkspaceShell({
  workspaceTitle,
  workspaceSubtitle,
  roleBadgeLabel,
  showBackButton = false,
  notificationRoute,
  children,
}: WorkspaceShellProps) {
  const { user, signOut } = useAuth();
  const { isDark, toggleColorScheme } = useCivoraTheme();
  const router = useRouter();

  const initials = (user?.fullName ?? "CV")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? "#001237" : "#F8FAFC" }}
      className="flex-1 bg-slate-50 dark:bg-civora-midnight"
    >
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "left", "right"]}
      >
      {/* Top Bar inspired by Reference 4 + Civora Web Header */}
      <View className="border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-civora-steel">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3 pr-2">
            {showBackButton ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-civora-midnight"
              >
                <ArrowLeft
                  size={18}
                  color={isDark ? "#4FAAA7" : "#001237"}
                />
              </Pressable>
            ) : (
              <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-civora-teal bg-civora-midnight">
                <Text className="text-xs font-extrabold text-white">
                  {initials}
                </Text>
              </View>
            )}

            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-300"
                  numberOfLines={1}
                >
                  {user ? `Welcome, ${user.fullName.split(",")[0]} 👋` : "Civora Control Plane"}
                </Text>
                <View className="rounded-full bg-civora-midnight/10 px-2 py-0.5 dark:bg-civora-teal/20">
                  <Text className="text-[9px] font-bold uppercase tracking-wider text-civora-midnight dark:text-civora-teal">
                    {roleBadgeLabel}
                  </Text>
                </View>
              </View>
              <Text
                className="mt-0.5 text-base font-extrabold text-civora-midnight dark:text-white"
                numberOfLines={1}
              >
                {workspaceTitle}
              </Text>
              <Text
                className="text-[11px] text-slate-500 dark:text-slate-400"
                numberOfLines={1}
              >
                {workspaceSubtitle}
              </Text>
            </View>
          </View>

          {/* Right Circular Action Pills (Theme Toggle, Alerts Bell, Sign Out) */}
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle Light or Dark Mode"
              onPress={toggleColorScheme}
              className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 active:opacity-80 dark:border-slate-700 dark:bg-civora-midnight"
            >
              {isDark ? (
                <Sun size={17} color="#4FAAA7" />
              ) : (
                <Moon size={17} color="#001237" />
              )}
            </Pressable>

            {notificationRoute ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open notifications"
                onPress={() => router.push(notificationRoute as never)}
                className="relative h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 active:opacity-80 dark:border-slate-700 dark:bg-civora-midnight"
              >
                <Bell size={17} color={isDark ? "#FFFFFF" : "#001237"} />
                <View className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-civora-teal" />
              </Pressable>
            ) : null}

            {user ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign out and clear local session"
                onPress={() => signOut()}
                className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 active:opacity-80 dark:border-slate-700 dark:bg-civora-midnight"
              >
                <LogOut size={16} color={isDark ? "#F87171" : "#DC2626"} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <NetworkAndContractBanner />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-12 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}
