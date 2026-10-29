import { Image } from "expo-image";
import { HardHat, ShieldCheck, Sparkles, Wifi } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { useCivoraTheme } from "@/providers/theme-provider";

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

/**
 * Animated Brand Splash Screen with Civora Midnight theme (`bg-civora-midnight`),
 * single centered Civora logo (`civora-logo.png`), expanding pulse rings,
 * and rising bottom horizon wave.
 * (Removed duplicate horizontal logo, top-left/right corner pills, and loader UI.)
 */
export function AnimatedSplashScreen({
  onAnimationComplete,
}: AnimatedSplashScreenProps) {
  const { isDark } = useCivoraTheme();

  // Animation values
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  const logoScale = useRef(new Animated.Value(0.62)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(24)).current;

  const ring1Scale = useRef(new Animated.Value(0.8)).current;
  const ring1Opacity = useRef(new Animated.Value(0.55)).current;
  const ring2Scale = useRef(new Animated.Value(0.8)).current;
  const ring2Opacity = useRef(new Animated.Value(0.35)).current;

  const horizonTranslateY = useRef(new Animated.Value(110)).current;
  const horizonOpacity = useRef(new Animated.Value(0)).current;

  const badgeFloat = useRef(new Animated.Value(0)).current;
  const hasCompletedRef = useRef(false);

  const triggerExit = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1.05,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete();
    });
  };

  useEffect(() => {
    const pulseLoop1 = Animated.loop(
      Animated.parallel([
        Animated.timing(ring1Scale, {
          toValue: 1.65,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ring1Opacity, {
          toValue: 0,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 1.95,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeFloat, {
          toValue: -7,
          duration: 950,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgeFloat, {
          toValue: 0,
          duration: 950,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop1.start();
    pulseLoop2.start();
    floatLoop.start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(horizonTranslateY, {
          toValue: 0,
          duration: 680,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(horizonOpacity, {
          toValue: 1,
          duration: 580,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1450),
    ]).start(() => {
      triggerExit();
    });

    return () => {
      pulseLoop1.stop();
      pulseLoop2.stop();
      floatLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        opacity: containerOpacity,
        transform: [{ scale: containerScale }],
      }}
      className="flex-1 justify-between bg-civora-midnight dark:bg-civora-midnight"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Civora Splash Screen — Tap to continue to onboarding"
        onPress={triggerExit}
        className="flex-1 justify-between"
      >
        {/* Empty top spacer to keep the logo centered without top-corner clutter */}
        <View className="pt-14" />

        {/* Single Centered Official Civora Logo with Expanding Pulse Rings */}
        <View className="items-center justify-center px-6">
          <View className="items-center justify-center">
            {/* Expanding Pulse Ring 1 */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                width: 156,
                height: 156,
                borderRadius: 78,
                borderWidth: 2,
                borderColor: "#4FAAA7",
                opacity: ring1Opacity,
                transform: [{ scale: ring1Scale }],
              }}
            />
            {/* Expanding Pulse Ring 2 */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                width: 156,
                height: 156,
                borderRadius: 78,
                borderWidth: 1.5,
                borderColor: "#3B68DE",
                opacity: ring2Opacity,
                transform: [{ scale: ring2Scale }],
              }}
            />

            {/* Single Centered Civora Logo Medallion */}
            <Animated.View
              style={{
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { translateY: logoTranslateY },
                ],
              }}
              className="items-center"
            >
              <View className="h-36 w-36 items-center justify-center rounded-[36px] border border-civora-teal/40 bg-white p-4 shadow-2xl dark:bg-civora-steel">
                <Image
                  source={require("../../../assets/brand/civora-logo.png")}
                  style={{ width: 108, height: 108 }}
                  contentFit="contain"
                  accessibilityLabel="Civora Official Logo"
                />
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Bottom Cloud / Horizon Wave & Field Crew Badges */}
        <Animated.View
          style={{
            opacity: horizonOpacity,
            transform: [{ translateY: horizonTranslateY }],
          }}
          className="w-full"
        >
          <View className="w-full overflow-hidden">
            <Svg height={92} width="100%" viewBox="0 0 400 92">
              <Path
                d="M0 64 Q50 28 110 52 Q185 8 265 46 Q335 18 400 54 L400 92 L0 92 Z"
                fill="#4FAAA7"
                fillOpacity={0.22}
              />
              <Path
                d="M0 74 Q75 34 148 62 Q220 22 302 58 Q355 36 400 66 L400 92 L0 92 Z"
                fill={isDark ? "#18243D" : "#F8FAFC"}
              />
              <Circle cx="76" cy="36" r="5" fill="#4FAAA7" fillOpacity={0.6} />
              <Circle cx="324" cy="28" r="6" fill="#3B68DE" fillOpacity={0.7} />
            </Svg>
          </View>

          <View
            className={`px-6 pb-10 pt-2 ${
              isDark ? "bg-civora-steel" : "bg-slate-50"
            }`}
          >
            <Animated.View
              style={{ transform: [{ translateY: badgeFloat }] }}
              className="mb-3 flex-row items-center justify-center gap-2"
            >
              <View className="flex-row items-center gap-1.5 rounded-full bg-civora-teal/20 px-3 py-1">
                <Wifi size={12} color="#4FAAA7" />
                <Text className="text-[10px] font-extrabold text-civora-teal">
                  Offline-Safe Sync
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 rounded-full bg-civora-blue/20 px-3 py-1">
                <Sparkles size={12} color="#3B68DE" />
                <Text className="text-[10px] font-extrabold text-civora-blue dark:text-blue-300">
                  AI QA/QC Synthesis
                </Text>
              </View>
            </Animated.View>

            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-civora-midnight">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-civora-teal/20">
                  <HardHat size={20} color="#4FAAA7" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-extrabold text-civora-midnight dark:text-white">
                    Site Engineer
                  </Text>
                  <Text className="text-[10px] text-slate-500 dark:text-slate-400">
                    Field Pour & Lab QA
                  </Text>
                </View>
              </View>

              <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-civora-midnight">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-civora-blue/20">
                  <ShieldCheck size={20} color="#3B68DE" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-extrabold text-civora-midnight dark:text-white">
                    Stakeholder
                  </Text>
                  <Text className="text-[10px] text-slate-500 dark:text-slate-400">
                    Released Dossiers
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
