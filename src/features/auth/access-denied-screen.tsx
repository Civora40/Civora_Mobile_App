import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/providers/auth-provider";

export function AccessDeniedScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-50 p-6 dark:bg-civora-midnight">
      <View className="rounded-3xl border border-red-300 bg-white p-5 shadow-xs dark:border-red-500/40 dark:bg-civora-steel">
        <Text className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-300">
          Access Denied (403)
        </Text>
        <Text className="mt-1 text-xl font-extrabold text-civora-midnight dark:text-white">
          Insufficient Workspace Permissions
        </Text>
        <Text className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Your authenticated profile ({user?.email ?? "unknown"}) does not hold the required backend permission scope for this route or project. Contact your Civora project administrator to request role or project assignment.
        </Text>

        <View className="mt-5 gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/")}
            className="min-h-[48px] items-center justify-center rounded-full bg-civora-midnight px-4 py-3 dark:bg-civora-blue"
          >
            <Text className="text-sm font-bold text-white">
              Return to Authorized Workspace
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              await signOut();
              router.replace("/(auth)/sign-in");
            }}
            className="min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-civora-midnight"
          >
            <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
