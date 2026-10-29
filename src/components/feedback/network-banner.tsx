import React from "react";
import { Text, View } from "react-native";

import { useConnectivity } from "@/hooks/use-connectivity";

export function NetworkAndContractBanner() {
  const { isOffline } = useConnectivity();

  if (!isOffline) {
    return null;
  }

  return (
    <View className="px-4 pt-2">
      <View
        accessibilityRole="alert"
        className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-500/40 dark:bg-amber-950/90"
      >
        <Text className="text-xs font-semibold text-amber-900 dark:text-amber-200">
          Site Offline — Field drafts are saved on this device only. Uploads will not be marked Submitted to Civora until server confirmation.
        </Text>
      </View>
    </View>
  );
}
