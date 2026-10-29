import { Redirect } from "expo-router";
import React from "react";

import { useAuth } from "@/providers/auth-provider";
import { uiStore } from "@/store/ui-store";

export default function IndexGateScreen() {
  const { user, workspaceRoute } = useAuth();

  if (!user && !uiStore.getHasCompletedOnboarding()) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href={workspaceRoute} />;
}
