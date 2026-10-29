import "../global.css";

import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";

import { AnimatedSplashScreen } from "@/components/splash/animated-splash-screen";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { CivoraQueryProvider } from "@/providers/query-provider";
import {
  CivoraThemeProvider,
  useCivoraTheme,
} from "@/providers/theme-provider";
import { uiStore } from "@/store/ui-store";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash screen is already prevented in test environment
});

function PermissionAwareNavigator() {
  const { user, isInitializing, isSessionExpired, workspaceRoute } = useAuth();
  const { isDark } = useCivoraTheme();
  const segments = useSegments();
  const router = useRouter();

  const [isSplashActive, setIsSplashActive] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() =>
    uiStore.getHasCompletedOnboarding()
  );
  const [replayCount, setReplayCount] = useState(() =>
    uiStore.getSplashReplayCounter()
  );

  // Subscribe to onboarding & splash replay state changes
  useEffect(() => {
    return uiStore.subscribe(() => {
      setHasCompletedOnboarding(uiStore.getHasCompletedOnboarding());
      const nextReplay = uiStore.getSplashReplayCounter();
      setReplayCount((prev) => {
        if (nextReplay !== prev) {
          setIsSplashActive(true);
        }
        return nextReplay;
      });
    });
  }, []);

  // Hide native OS splash screen as soon as our custom AnimatedSplashScreen mounts
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (isInitializing || isSplashActive) return;

    const segmentList = segments as string[];
    const currentGroup = segmentList[0];
    const currentScreen = segmentList[1];

    if (!user) {
      if (isSessionExpired) {
        if (currentGroup !== "(auth)" || currentScreen !== "session-expired") {
          router.replace("/(auth)/session-expired");
        }
        return;
      }

      // Immediately after the animated splash screen finishes, show the Onboarding flow
      if (!hasCompletedOnboarding) {
        if (currentGroup !== "(auth)" || currentScreen !== "onboarding") {
          router.replace("/(auth)/onboarding");
        }
        return;
      }

      if (currentGroup !== "(auth)") {
        router.replace("/(auth)/sign-in");
      }
      return;
    }

    // Allow authenticated multi-role users to visit workspace-switch, access-denied, or onboarding
    if (
      currentGroup === "(auth)" &&
      (currentScreen === "workspace-switch" ||
        currentScreen === "access-denied" ||
        currentScreen === "onboarding")
    ) {
      return;
    }

    if (workspaceRoute === "/(engineer)" && currentGroup !== "(engineer)") {
      router.replace("/(engineer)");
    } else if (
      workspaceRoute === "/(stakeholder)" &&
      currentGroup !== "(stakeholder)"
    ) {
      router.replace("/(stakeholder)");
    } else if (
      workspaceRoute === "/(auth)/sign-in" &&
      currentGroup !== "(auth)"
    ) {
      router.replace("/(auth)/sign-in");
    }
  }, [
    user,
    isInitializing,
    isSplashActive,
    isSessionExpired,
    hasCompletedOnboarding,
    workspaceRoute,
    segments,
    router,
  ]);

  if (isInitializing || isSplashActive) {
    return (
      <>
        <StatusBar style="light" />
        <AnimatedSplashScreen
          key={`splash-${replayCount}`}
          onAnimationComplete={() => setIsSplashActive(false)}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <CivoraThemeProvider>
      <CivoraQueryProvider>
        <AuthProvider>
          <PermissionAwareNavigator />
        </AuthProvider>
      </CivoraQueryProvider>
    </CivoraThemeProvider>
  );
}
