import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/providers/auth-provider";
import { hasPermission } from "@/services/auth-service";

export function WorkspaceSwitchScreen() {
  const { user, switchWorkspace } = useAuth();
  const router = useRouter();

  const canEngineer = hasPermission(user, "workspace:engineer");
  const canStakeholder = hasPermission(user, "workspace:stakeholder");

  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-50 p-6 dark:bg-civora-midnight">
      <View className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-civora-steel">
        <Text className="text-xs font-bold uppercase tracking-wider text-civora-teal">
          Multi-Role Account
        </Text>
        <Text className="mt-1 text-xl font-extrabold text-civora-midnight dark:text-white">
          Select Active Workspace
        </Text>
        <Text className="mt-1.5 text-xs text-slate-500 dark:text-slate-300">
          Signed in as {user?.fullName}. Your backend profile grants access to the following workspaces:
        </Text>

        <View className="mt-5 gap-3">
          {canEngineer ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                switchWorkspace("engineer");
                router.replace("/(engineer)");
              }}
              className="rounded-2xl border border-civora-teal bg-teal-50/40 p-4 active:opacity-85 dark:bg-civora-midnight"
            >
              <Text className="text-sm font-extrabold text-civora-midnight dark:text-civora-teal">
                Engineer Field Workspace
              </Text>
              <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Field submittals, evidence capture, tasks, Reporting Studio, and AI analysis.
              </Text>
            </Pressable>
          ) : null}

          {canStakeholder ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                switchWorkspace("stakeholder");
                router.replace("/(stakeholder)");
              }}
              className="rounded-2xl border border-civora-blue bg-blue-50/40 p-4 active:opacity-85 dark:bg-civora-midnight"
            >
              <Text className="text-sm font-extrabold text-civora-midnight dark:text-blue-300">
                Stakeholder Executive Workspace
              </Text>
              <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Assigned projects, officially released reports, approved milestones, and published updates.
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
