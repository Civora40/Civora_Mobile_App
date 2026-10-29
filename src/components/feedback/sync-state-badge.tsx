import React from "react";
import { Text, View } from "react-native";

import { SubmissionSyncState } from "@/types/contracts";

const STATE_CONFIG: Record<
  SubmissionSyncState,
  { label: string; badgeClass: string; textClass: string }
> = {
  saved_on_device: {
    label: "Saved on this device (Not submitted)",
    badgeClass:
      "bg-amber-100 border-amber-300 dark:bg-amber-500/20 dark:border-amber-500/50",
    textClass: "text-amber-800 dark:text-amber-300",
  },
  pending_upload: {
    label: "Pending upload",
    badgeClass:
      "bg-sky-100 border-sky-300 dark:bg-sky-500/20 dark:border-sky-500/50",
    textClass: "text-sky-800 dark:text-sky-300",
  },
  uploading: {
    label: "Uploading to Civora…",
    badgeClass:
      "bg-blue-100 border-civora-blue dark:bg-civora-blue/30 dark:border-civora-blue",
    textClass: "text-civora-blue dark:text-blue-200",
  },
  failed: {
    label: "Upload failed — Saved on this device",
    badgeClass:
      "bg-red-100 border-red-300 dark:bg-red-500/20 dark:border-red-500/50",
    textClass: "text-red-800 dark:text-red-300",
  },
  conflict: {
    label: "Server conflict detected — Review required",
    badgeClass:
      "bg-purple-100 border-purple-300 dark:bg-purple-500/20 dark:border-purple-500/50",
    textClass: "text-purple-800 dark:text-purple-300",
  },
  submitted_to_civora: {
    label: "Submitted to Civora (Server Confirmed)",
    badgeClass:
      "bg-emerald-100 border-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/50",
    textClass: "text-emerald-800 dark:text-emerald-300",
  },
};

export function SyncStateBadge({ state }: { state: SubmissionSyncState }) {
  const config = STATE_CONFIG[state];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Sync status: ${config.label}`}
      className={`self-start rounded-full border px-2.5 py-1 ${config.badgeClass}`}
    >
      <Text className={`text-xs font-semibold ${config.textClass}`}>
        {config.label}
      </Text>
    </View>
  );
}
