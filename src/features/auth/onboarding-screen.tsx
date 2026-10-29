import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  BellRing,
  ClipboardCheck,
  Moon,
  Sun,
  Users,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCivoraTheme } from "@/providers/theme-provider";
import { uiStore } from "@/store/ui-store";

const ONBOARDING_SLIDES = [
  {
    id: "track",
    title: "Track site work and\nget verified results",
    description:
      "Centralize field pour cards, Kamsteel & Dangote lab certificates, and site inspections with truthful offline draft protection.",
    accentColor: "#4FAAA7",
    icon: "clipboard",
  },
  {
    id: "team",
    title: "Stay coordinated\nwith field & QA teams",
    description:
      "Connect WhatsApp, Telegram, and mobile portal submissions directly to COREN-registered engineering tasks and SLA workflows.",
    accentColor: "#3B68DE",
    icon: "users",
  },
  {
    id: "notify",
    title: "Get notified when\nmilestones release",
    description:
      "Real-time SLA alerts for site engineers and verified statutory report releases for executive stakeholders.",
    accentColor: "#001237",
    icon: "bell",
  },
] as const;

export function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const { isDark, toggleColorScheme } = useCivoraTheme();
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const slide = ONBOARDING_SLIDES[stepIndex];
  const isLast = stepIndex === ONBOARDING_SLIDES.length - 1;

  useEffect(() => {
    slideAnim.setValue(0);
    scaleAnim.setValue(0.88);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stepIndex, slideAnim, scaleAnim]);

  const finishOnboarding = () => {
    uiStore.setHasCompletedOnboarding(true);
    router.replace("/(auth)/sign-in");
  };

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? "#001237" : "#FFFFFF" }}
      className="flex-1 bg-white dark:bg-civora-midnight"
    >
      <SafeAreaView
        style={{ flex: 1, justifyContent: "space-between" }}
        className="flex-1 justify-between px-6 py-6"
      >
        {/* Top Bar with Brand Mark & Theme Toggle (Splash text removed) */}
        <View className="flex-row items-center justify-between">
          <Image
            source={
              isDark
                ? require("../../../assets/brand/brand_logo_white.png")
                : require("../../../assets/brand/brand_logo.png")
            }
            style={{ width: 120, height: 32 }}
            contentFit="contain"
            accessibilityLabel="Civora Logo"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle Light or Dark Mode"
            onPress={toggleColorScheme}
            style={{
              backgroundColor: isDark ? "#18243D" : "#F8FAFC",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            }}
            className="h-10 w-10 items-center justify-center rounded-full border"
          >
            {isDark ? (
              <Sun size={18} color="#4FAAA7" />
            ) : (
              <Moon size={18} color="#001237" />
            )}
          </Pressable>
        </View>

        {/* Center Illustration Circle + Pagination Dots + Copy (Reference Image 1) */}
        <Animated.View
          style={{
            opacity: slideAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center px-2"
        >
          <View
            style={{
              backgroundColor: isDark ? "#18243D" : "#F1F5F9",
            }}
            className="h-60 w-60 items-center justify-center rounded-full"
          >
            <View
              style={{
                backgroundColor: isDark ? "#001237" : "#FFFFFF",
                borderColor: "rgba(79, 170, 167, 0.35)",
              }}
              className="h-40 w-40 items-center justify-center rounded-full border shadow-sm"
            >
              {slide.icon === "clipboard" ? (
                <ClipboardCheck size={64} color="#4FAAA7" />
              ) : slide.icon === "users" ? (
                <Users size={64} color="#3B68DE" />
              ) : (
                <BellRing size={64} color="#4FAAA7" />
              )}
            </View>
          </View>

          {/* Pagination Dots (● ○ ○) */}
          <View className="mt-8 flex-row items-center gap-2">
            {ONBOARDING_SLIDES.map((s, idx) => {
              const active = idx === stepIndex;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to onboarding slide ${idx + 1}`}
                  onPress={() => setStepIndex(idx)}
                  style={{
                    backgroundColor: active
                      ? isDark
                        ? "#4FAAA7"
                        : "#001237"
                      : "transparent",
                    borderColor: active
                      ? "transparent"
                      : isDark
                        ? "#475569"
                        : "#94A3B8",
                    borderWidth: active ? 0 : 1.5,
                  }}
                  className={`h-2.5 rounded-full ${active ? "w-6" : "w-2.5"}`}
                />
              );
            })}
          </View>

          <Text
            style={{ color: isDark ? "#FFFFFF" : "#001237" }}
            className="mt-6 text-center text-2xl font-extrabold leading-8"
          >
            {slide.title}
          </Text>
          <Text
            style={{ color: isDark ? "#CBD5E1" : "#475569" }}
            className="mt-3 text-center text-sm leading-5"
          >
            {slide.description}
          </Text>
        </Animated.View>

        {/* Bottom Bar: SKIP + Pill NEXT/START Button */}
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            accessibilityRole="button"
            onPress={finishOnboarding}
            className="px-4 py-3"
          >
            <Text
              style={{ color: isDark ? "#CBD5E1" : "#334155" }}
              className="text-xs font-extrabold uppercase tracking-wider"
            >
              SKIP
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleNext}
            style={{
              backgroundColor: isDark ? "#3B68DE" : "#001237",
            }}
            className="min-w-[128px] items-center justify-center rounded-full px-8 py-4 shadow-md active:opacity-85"
          >
            <Text
              style={{ color: "#FFFFFF" }}
              className="text-xs font-extrabold uppercase tracking-widest"
            >
              {isLast ? "START" : "NEXT"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
