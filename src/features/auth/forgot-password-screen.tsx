import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ForgotPasswordFormSchema,
  ForgotPasswordFormValues,
} from "@/lib/validation/contracts";
import { apiClient } from "@/services/api-client";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await apiClient.request({
        method: "POST",
        path: "/v1/auth/forgot-password",
        body: { email: values.email.trim().toLowerCase() },
        requiresAuth: false,
      });
      setFeedback(
        "If an authorized Civora account matches this email, password recovery instructions have been dispatched."
      );
    } catch (err) {
      setFeedback(
        err instanceof Error
          ? err.message
          : "Unable to reach Civora password recovery endpoint."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-6 dark:bg-civora-midnight">
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="mb-6 self-start rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-civora-steel"
      >
        <Text className="text-xs font-bold text-civora-midnight dark:text-civora-teal">
          ← Back to Sign In
        </Text>
      </Pressable>

      <Text className="text-2xl font-extrabold text-civora-midnight dark:text-white">
        Password Recovery
      </Text>
      <Text className="mt-1.5 text-xs text-slate-500 dark:text-slate-300">
        Enter your organization email address to request a secure password reset link from the Civora identity service.
      </Text>

      <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-civora-steel">
        {feedback ? (
          <View className="mb-4 rounded-xl border border-civora-teal/40 bg-teal-50/70 p-3 dark:bg-civora-midnight">
            <Text className="text-xs text-civora-midnight dark:text-slate-200">
              {feedback}
            </Text>
          </View>
        ) : null}

        <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Work Email
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Work Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="engineer@civora.internal"
              placeholderTextColor="#94A3B8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="min-h-[48px] rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-civora-midnight dark:border-slate-700 dark:bg-civora-midnight dark:text-white"
            />
          )}
        />
        {errors.email ? (
          <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
            {errors.email.message}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
          className="mt-5 min-h-[48px] items-center justify-center rounded-full bg-civora-midnight px-4 py-3 dark:bg-civora-blue"
        >
          <Text className="text-sm font-bold text-white">
            Send Recovery Instructions
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
