import Constants from "expo-constants";
import { z } from "zod";

const EnvSchema = z.object({
  appEnv: z.enum(["development", "preview", "production"]).default("development"),
  apiBaseUrl: z
    .string()
    .url("EXPO_PUBLIC_API_BASE_URL must be a valid URL")
    .default("https://api.example.invalid"),
});

export type AppEnvironmentConfig = z.infer<typeof EnvSchema>;

function loadEnvironment(): AppEnvironmentConfig {
  const rawAppEnv =
    process.env.EXPO_PUBLIC_APP_ENV ??
    Constants.expoConfig?.extra?.appEnv ??
    "development";

  const rawApiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    Constants.expoConfig?.extra?.apiBaseUrl ??
    "https://api.example.invalid";

  const parsed = EnvSchema.safeParse({
    appEnv: rawAppEnv,
    apiBaseUrl: rawApiBaseUrl,
  });

  if (!parsed.success) {
    return {
      appEnv: "development",
      apiBaseUrl: "https://api.example.invalid",
    };
  }

  return parsed.data;
}

export const ENV = loadEnvironment();

/**
 * Checks whether the current API base URL is still set to the unconfigured placeholder.
 * Used to surface truthful contract status banners rather than faking network responses.
 */
export function isPlaceholderApiUrl(url: string = ENV.apiBaseUrl): boolean {
  return url.includes(".invalid") || url.includes("example.invalid");
}

