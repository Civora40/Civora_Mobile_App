import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  HardHat,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
  RegisterFormSchema,
  RegisterFormValues,
} from "@/lib/validation/contracts";
import { useAuth } from "@/providers/auth-provider";
import { useCivoraTheme } from "@/providers/theme-provider";
import { hasMultipleWorkspaces } from "@/services/auth-service";
import { CivoraRole } from "@/types/contracts";

const REGISTER_ROLES: {
  role: CivoraRole;
  label: string;
  subtitle: string;
}[] = [
  {
    role: "engineer",
    label: "Site Engineer",
    subtitle: "Field capture & QA/QC",
  },
  {
    role: "stakeholder",
    label: "Stakeholder",
    subtitle: "Executive oversight",
  },
];

export function RegisterScreen() {
  const { register } = useAuth();
  const { isDark, toggleColorScheme } = useCivoraTheme();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      organizationName: "",
      role: "engineer",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setRegisterError(null);
    try {
      const createdUser = await register(values);
      if (hasMultipleWorkspaces(createdUser)) {
        router.replace("/(auth)/workspace-switch");
      }
    } catch (err) {
      setRegisterError(
        err instanceof Error
          ? err.message
          : "Unable to create your Civora account."
      );
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
            {/* Top Bar: Back Button + Brand Logo + Theme Toggle Icon */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to Login"
                  onPress={() => router.back()}
                  style={{
                    backgroundColor: isDark ? "#18243D" : "#F8FAFC",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  }}
                  className="h-10 w-10 items-center justify-center rounded-full border active:opacity-80"
                >
                  <ArrowLeft
                    size={17}
                    color={isDark ? "#4FAAA7" : "#001237"}
                  />
                </Pressable>
                <CivoraBrandHeaderLogo size="sm" />
              </View>

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

            {/* Center Minimal Register Form */}
            <View className="my-auto py-6">
              <Text
                style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                className="mb-2 text-center text-3xl font-extrabold tracking-tight"
              >
                Sign Up
              </Text>
              <Text
                style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                className="mb-6 text-center text-xs"
              >
                Create your Civora account and select your workspace role
              </Text>

              {registerError ? (
                <View
                  accessibilityRole="alert"
                  className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-500/40 dark:bg-red-950/70"
                >
                  <Text className="text-center text-xs font-medium text-red-700 dark:text-red-200">
                    {registerError}
                  </Text>
                </View>
              ) : null}

              {/* Role Selection Pills (Site Engineer vs Stakeholder) */}
              <View className="mb-4">
                <Text
                  style={{ color: isDark ? "#CBD5E1" : "#475569" }}
                  className="mb-2 px-1 text-xs font-bold"
                >
                  Select Role
                </Text>
                <Controller
                  control={control}
                  name="role"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row gap-2.5">
                      {REGISTER_ROLES.map((item) => {
                        const selected = value === item.role;
                        return (
                          <Pressable
                            key={item.role}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            onPress={() => onChange(item.role)}
                            style={{
                              backgroundColor: selected
                                ? isDark
                                  ? "rgba(79, 170, 167, 0.22)"
                                  : "rgba(0, 18, 55, 0.08)"
                                : isDark
                                  ? "#18243D"
                                  : "#F8FAFC",
                              borderColor: selected
                                ? "#4FAAA7"
                                : isDark
                                  ? "#334155"
                                  : "#E2E8F0",
                            }}
                            className="flex-1 flex-row items-center gap-2.5 rounded-2xl border p-3"
                          >
                            <View
                              style={{
                                backgroundColor: selected
                                  ? "#4FAAA7"
                                  : isDark
                                    ? "#001237"
                                    : "#FFFFFF",
                              }}
                              className="h-9 w-9 items-center justify-center rounded-full"
                            >
                              {item.role === "engineer" ? (
                                <HardHat
                                  size={17}
                                  color={
                                    selected
                                      ? "#001237"
                                      : isDark
                                        ? "#4FAAA7"
                                        : "#001237"
                                  }
                                />
                              ) : (
                                <ShieldCheck
                                  size={17}
                                  color={
                                    selected
                                      ? "#001237"
                                      : isDark
                                        ? "#3B68DE"
                                        : "#001237"
                                  }
                                />
                              )}
                            </View>
                            <View className="flex-1">
                              <Text
                                style={{
                                  color: isDark ? "#FFFFFF" : "#001237",
                                }}
                                className="text-xs font-extrabold"
                              >
                                {item.label}
                              </Text>
                              <Text
                                style={{
                                  color: isDark ? "#94A3B8" : "#64748B",
                                }}
                                className="text-[10px]"
                              >
                                {item.subtitle}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />
              </View>

              {/* Full Name Pill Input */}
              <View className="mb-3.5">
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={{
                        backgroundColor: isDark ? "#18243D" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      }}
                      className="min-h-[52px] flex-row items-center rounded-full border px-4"
                    >
                      <User size={17} color="#94A3B8" />
                      <TextInput
                        accessibilityLabel="Full Name"
                        placeholder="Full Name"
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
                {errors.fullName ? (
                  <Text className="mt-1 px-3 text-xs text-red-500 dark:text-red-400">
                    {errors.fullName.message}
                  </Text>
                ) : null}
              </View>

              {/* Work Email Pill Input */}
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
                        accessibilityLabel="Work Email"
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder="Work Email"
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

              {/* Organization Pill Input */}
              <View className="mb-3.5">
                <Controller
                  control={control}
                  name="organizationName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={{
                        backgroundColor: isDark ? "#18243D" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      }}
                      className="min-h-[52px] flex-row items-center rounded-full border px-4"
                    >
                      <Building2 size={17} color="#94A3B8" />
                      <TextInput
                        accessibilityLabel="Organization"
                        placeholder="Organization / Company"
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
                {errors.organizationName ? (
                  <Text className="mt-1 px-3 text-xs text-red-500 dark:text-red-400">
                    {errors.organizationName.message}
                  </Text>
                ) : null}
              </View>

              {/* Password Pill Input */}
              <View className="mb-6">
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
                        placeholder="Password (min 8 chars)"
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

              {/* Create Account Pill Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create Account"
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
                    Sign Up
                  </Text>
                )}
              </Pressable>

              {/* Already have an account? Login */}
              <View className="mt-6 flex-row items-center justify-center">
                <Text
                  style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                  className="text-xs"
                >
                  Already have an account?{" "}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go to Login"
                  onPress={() => router.replace("/(auth)/sign-in")}
                >
                  <Text
                    style={{ color: isDark ? "#FFFFFF" : "#001237" }}
                    className="text-xs font-extrabold underline"
                  >
                    Log in
                  </Text>
                </Pressable>
              </View>
            </View>

            <View />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
