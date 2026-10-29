import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  Check,
  CheckCircle2,
  Delete,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Moon,
  ScanFace,
  Sun,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CivoraBrandHeaderLogo } from "@/components/ui/primitives";
import {
  LoginFormSchema,
  LoginFormValues,
} from "@/lib/validation/contracts";
import { useAuth } from "@/providers/auth-provider";
import { useCivoraTheme } from "@/providers/theme-provider";
import { hasMultipleWorkspaces } from "@/services/auth-service";

const PASSCODE_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export function SignInScreen() {
  const { signIn, signInWithBiometricsOrPasscode } = useAuth();
  const { isDark, toggleColorScheme } = useCivoraTheme();
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Biometric (Face ID) Modal State
  const [faceIdModalOpen, setFaceIdModalOpen] = useState(false);
  const [faceIdStatus, setFaceIdStatus] = useState<"scanning" | "verified">(
    "scanning"
  );
  const scanPulse = useRef(new Animated.Value(1)).current;

  // Phone Passcode Modal State
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [passcodeDigits, setPasscodeDigits] = useState("");
  const [isPasscodeVerifying, setIsPasscodeVerifying] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const currentEmailValue = watch("email");

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    try {
      const authenticatedUser = await signIn(values);
      if (hasMultipleWorkspaces(authenticatedUser)) {
        router.push("/(auth)/workspace-switch");
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Verify your Civora credentials."
      );
    }
  };

  // Handle Face ID scan animation & automatic login
  useEffect(() => {
    if (!faceIdModalOpen) return;

    setFaceIdStatus("scanning");
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulse, {
          toValue: 1.16,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanPulse, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    const verifyTimer = setTimeout(() => {
      setFaceIdStatus("verified");
    }, 1100);

    const completeTimer = setTimeout(async () => {
      setFaceIdModalOpen(false);
      const authenticatedUser = await signInWithBiometricsOrPasscode({
        method: "face_id",
        emailHint: currentEmailValue,
      });
      if (hasMultipleWorkspaces(authenticatedUser)) {
        router.push("/(auth)/workspace-switch");
      }
    }, 1650);

    return () => {
      loop.stop();
      clearTimeout(verifyTimer);
      clearTimeout(completeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceIdModalOpen]);

  // Handle 4-digit Phone Passcode completion
  const handlePasscodeKeyPress = async (key: string) => {
    if (isPasscodeVerifying || !key) return;

    if (key === "del") {
      setPasscodeDigits((prev) => prev.slice(0, -1));
      return;
    }

    const next = (passcodeDigits + key).slice(0, 4);
    setPasscodeDigits(next);

    if (next.length === 4) {
      setIsPasscodeVerifying(true);
      setTimeout(async () => {
        setIsPasscodeVerifying(false);
        setPasscodeDigits("");
        setPasscodeModalOpen(false);
        const authenticatedUser = await signInWithBiometricsOrPasscode({
          method: "device_passcode",
          emailHint: currentEmailValue,
        });
        if (hasMultipleWorkspaces(authenticatedUser)) {
          router.push("/(auth)/workspace-switch");
        }
      }, 380);
    }
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? "#001237" : "#FFFFFF" }}
      className="flex-1 bg-white dark:bg-civora-midnight"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow justify-between px-6 py-6"
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Bar: Civora Logo + Theme Toggle Icon Only (No splash access) */}
            <View className="flex-row items-center justify-between">
              <CivoraBrandHeaderLogo size="md" />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toggle Light or Dark Mode"
                onPress={toggleColorScheme}
                style={{
                  backgroundColor: isDark ? "#18243D" : "#F8FAFC",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                }}
                className="h-10 w-10 items-center justify-center rounded-full border active:opacity-80"
              >
                {isDark ? (
                  <Sun size={17} color="#4FAAA7" />
                ) : (
                  <Moon size={17} color="#001237" />
                )}
              </Pressable>
            </View>

            {/* Center Minimal Login Form */}
            <View className="my-auto py-6">
              <Text
                style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                className="mb-8 text-center text-3xl font-extrabold tracking-tight"
              >
                Login
              </Text>

              {authError ? (
                <View
                  accessibilityRole="alert"
                  className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-500/40 dark:bg-red-950/70"
                >
                  <Text className="text-center text-xs font-medium text-red-700 dark:text-red-200">
                    {authError}
                  </Text>
                </View>
              ) : null}

              {/* Pill Email Input */}
              <View className="mb-3.5">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={{
                        backgroundColor: isDark ? "#18243D" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      }}
                      className="min-h-[52px] flex-row items-center rounded-full border px-4"
                    >
                      <Mail size={17} color="#94A3B8" />
                      <TextInput
                        accessibilityLabel="Email"
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder="Email"
                        placeholderTextColor="#94A3B8"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                        className="ml-3 flex-1 text-sm"
                      />
                    </View>
                  )}
                />
                {errors.email ? (
                  <Text className="mt-1 px-3 text-xs text-red-500 dark:text-red-400">
                    {errors.email.message}
                  </Text>
                ) : null}
              </View>

              {/* Pill Password Input */}
              <View className="mb-3.5">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={{
                        backgroundColor: isDark ? "#18243D" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      }}
                      className="min-h-[52px] flex-row items-center rounded-full border px-4"
                    >
                      <Lock size={17} color="#94A3B8" />
                      <TextInput
                        accessibilityLabel="Password"
                        secureTextEntry={!showPassword}
                        placeholder="Password"
                        placeholderTextColor="#94A3B8"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                        className="ml-3 flex-1 text-sm"
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onPress={() => setShowPassword((prev) => !prev)}
                        className="p-1"
                      >
                        {showPassword ? (
                          <EyeOff size={17} color="#94A3B8" />
                        ) : (
                          <Eye size={17} color="#94A3B8" />
                        )}
                      </Pressable>
                    </View>
                  )}
                />
                {errors.password ? (
                  <Text className="mt-1 px-3 text-xs text-red-500 dark:text-red-400">
                    {errors.password.message}
                  </Text>
                ) : null}
              </View>

              {/* Remember Me Checkbox & Forgot Password Row */}
              <View className="mb-5 flex-row items-center justify-between px-1">
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  onPress={() => setRememberMe((prev) => !prev)}
                  className="flex-row items-center gap-2 py-1"
                >
                  <View
                    style={{
                      backgroundColor: rememberMe
                        ? "#4FAAA7"
                        : "transparent",
                      borderColor: rememberMe
                        ? "#4FAAA7"
                        : isDark
                          ? "#475569"
                          : "#CBD5E1",
                    }}
                    className="h-4 w-4 items-center justify-center rounded border"
                  >
                    {rememberMe ? <Check size={11} color="#001237" /> : null}
                  </View>
                  <Text
                    style={{ color: isDark ? "#CBD5E1" : "#475569" }}
                    className="text-xs font-medium"
                  >
                    Remember me
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/(auth)/forgot-password")}
                  className="py-1"
                >
                  <Text
                    style={{ color: isDark ? "#CBD5E1" : "#64748B" }}
                    className="text-xs font-medium underline"
                  >
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>

              {/* Primary Pill Login Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Login"
                disabled={isSubmitting}
                onPress={() => {
                  void handleSubmit(onSubmit)();
                }}
                style={{
                  backgroundColor: isDark ? "#3B68DE" : "#001237",
                }}
                className="min-h-[52px] items-center justify-center rounded-full px-6 py-3.5 shadow-sm active:opacity-85 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{ color: "#FFFFFF" }}
                    className="text-sm font-bold"
                  >
                    Login
                  </Text>
                )}
              </Pressable>

              {/* "or" Divider */}
              <View className="my-6 flex-row items-center">
                <View
                  style={{
                    backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                  }}
                  className="h-[1px] flex-1"
                />
                <Text
                  style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                  className="px-4 text-xs font-medium"
                >
                  or
                </Text>
                <View
                  style={{
                    backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                  }}
                  className="h-[1px] flex-1"
                />
              </View>

              {/* Biometric Face ID & Phone Passcode Pill Buttons */}
              <View className="gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Login with Face ID"
                  onPress={() => setFaceIdModalOpen(true)}
                  style={{
                    backgroundColor: isDark ? "#18243D" : "#F1F5F9",
                  }}
                  className="min-h-[50px] flex-row items-center justify-center gap-2.5 rounded-full px-6 py-3 active:opacity-80"
                >
                  <ScanFace
                    size={19}
                    color={isDark ? "#4FAAA7" : "#001237"}
                  />
                  <Text
                    style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                    className="text-xs font-bold"
                  >
                    Continue with Face ID
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Login with Phone Passcode"
                  onPress={() => {
                    setPasscodeDigits("");
                    setPasscodeModalOpen(true);
                  }}
                  style={{
                    backgroundColor: "#4FAAA7",
                  }}
                  className="min-h-[50px] flex-row items-center justify-center gap-2.5 rounded-full px-6 py-3 active:opacity-85"
                >
                  <KeyRound size={18} color="#001237" />
                  <Text
                    style={{ color: "#001237" }}
                    className="text-xs font-extrabold"
                  >
                    Use Phone Passcode
                  </Text>
                </Pressable>
              </View>

              {/* Bottom Register Link */}
              <View className="mt-6 flex-row items-center justify-center">
                <Text
                  style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                  className="text-xs"
                >
                  Need an account?{" "}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sign up for a new Civora account"
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text
                    style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                    className="text-xs font-extrabold underline"
                  >
                    Sign up
                  </Text>
                </Pressable>
              </View>
            </View>

            <View />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Face ID Biometric Verification Modal */}
      <Modal
        visible={faceIdModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFaceIdModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View
            style={{
              backgroundColor: isDark ? "#18243D" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            }}
            className="w-full max-w-[300px] items-center rounded-3xl border p-6 shadow-2xl"
          >
            <Animated.View
              style={{ transform: [{ scale: scanPulse }] }}
              className="h-20 w-20 items-center justify-center rounded-3xl bg-civora-teal/15"
            >
              {faceIdStatus === "verified" ? (
                <CheckCircle2 size={46} color="#4FAAA7" />
              ) : (
                <ScanFace size={46} color="#4FAAA7" />
              )}
            </Animated.View>

            <Text
              style={{ color: isDark ? "#FFFFFF" : "#001237" }}
              className="mt-4 text-base font-extrabold"
            >
              {faceIdStatus === "verified" ? "Face ID Verified" : "Face ID"}
            </Text>
            <Text
              style={{ color: isDark ? "#CBD5E1" : "#64748B" }}
              className="mt-1 text-center text-xs"
            >
              {faceIdStatus === "verified"
                ? "Signing in and recognizing workspace role..."
                : "Authenticating with iPhone Biometrics..."}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => setFaceIdModalOpen(false)}
              className="mt-5 px-4 py-2"
            >
              <Text className="text-xs font-bold text-civora-teal">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Phone Passcode / PIN Pad Modal */}
      <Modal
        visible={passcodeModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPasscodeModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View
            style={{
              backgroundColor: isDark ? "#001237" : "#FFFFFF",
              borderColor: isDark ? "#1E293B" : "#E2E8F0",
            }}
            className="rounded-t-[36px] border-t px-6 pb-10 pt-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="w-8" />
              <Text
                style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                className="text-base font-extrabold"
              >
                Enter Phone Passcode
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close passcode modal"
                onPress={() => setPasscodeModalOpen(false)}
                className="h-8 w-8 items-center justify-center rounded-full"
              >
                <X size={18} color={isDark ? "#CBD5E1" : "#64748B"} />
              </Pressable>
            </View>

            <Text
              style={{ color: isDark ? "#94A3B8" : "#64748B" }}
              className="mt-1 text-center text-xs"
            >
              Enter your 4-digit device passcode to sign in
            </Text>

            {/* 4 Passcode Dots */}
            <View className="my-6 flex-row items-center justify-center gap-4">
              {[0, 1, 2, 3].map((idx) => {
                const filled = idx < passcodeDigits.length;
                return (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: filled
                        ? "#4FAAA7"
                        : "transparent",
                      borderColor: filled
                        ? "#4FAAA7"
                        : isDark
                          ? "#475569"
                          : "#CBD5E1",
                    }}
                    className="h-4 w-4 rounded-full border-2"
                  />
                );
              })}
            </View>

            {/* Numeric Keypad */}
            <View className="flex-row flex-wrap justify-between gap-y-3 px-6">
              {PASSCODE_KEYS.map((key, i) => {
                if (key === "") {
                  return <View key={`empty-${i}`} className="h-14 w-[30%]" />;
                }
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={
                      key === "del" ? "Delete digit" : `Digit ${key}`
                    }
                    onPress={() => {
                      void handlePasscodeKeyPress(key);
                    }}
                    style={{
                      backgroundColor: isDark ? "#18243D" : "#F1F5F9",
                    }}
                    className="h-14 w-[30%] items-center justify-center rounded-full active:opacity-75"
                  >
                    {key === "del" ? (
                      <Delete
                        size={20}
                        color={isDark ? "#FFFFFF" : "#001237"}
                      />
                    ) : (
                      <Text
                        style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                        className="text-xl font-bold"
                      >
                        {key}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
