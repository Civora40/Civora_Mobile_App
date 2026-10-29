import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLocalDrafts } from "@/hooks/use-drafts";
import { useAuth } from "@/providers/auth-provider";

export function SessionExpiredScreen() {
  const drafts = useLocalDrafts();
  const { activateDevelopmentRolePreview, signOut } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-50 p-6 dark:bg-civora-midnight">
      <View className="rounded-3xl border border-amber-400/50 bg-white p-5 shadow-xs dark:bg-civora-steel">
        <Text className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
          Session Expired
        </Text>
        <Text className="mt-1 text-xl font-extrabold text-civora-midnight dark:text-white">
          Re-Authentication Required
        </Text>
        <Text className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Your Civora access token has expired. Protected server caches have been cleared, while{" "}
          <Text className="font-bold text-civora-teal">
            {drafts.length} unsent local field draft(s)
          </Text>{" "}
          remain safely preserved on this device for recovery once you sign back in.
        </Text>

        <View className="mt-5 gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              await activateDevelopmentRolePreview("engineer");
              router.replace("/(engineer)");
            }}
            className="min-h-[48px] items-center justify-center rounded-full bg-civora-midnight px-4 py-3 dark:bg-civora-blue"
          >
            <Text className="text-sm font-bold text-white">
              Re-Authenticate & Resume Field Drafts
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
              Sign Out Completely (Clears Local Drafts)
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
