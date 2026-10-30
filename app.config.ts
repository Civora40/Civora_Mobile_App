import { ConfigContext, ExpoConfig } from "expo/config";

type AppEnvironment = "development" | "preview" | "production";

function resolveAppEnv(): AppEnvironment {
  const raw = process.env.EXPO_PUBLIC_APP_ENV ?? "development";
  if (raw === "development" || raw === "preview" || raw === "production") {
    return raw;
  }
  return "development";
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = resolveAppEnv();
  const isProd = appEnv === "production";
  const isPreview = appEnv === "preview";

  const appName = isProd
    ? "Civora"
    : isPreview
      ? "Civora (Preview)"
      : "Civora (Dev)";

  const bundleIdentifier = isProd
    ? "com.civora.mobile"
    : isPreview
      ? "com.civora.mobile.preview"
      : "com.civora.mobile.dev";

  return {
    ...config,
    name: appName,
    slug: "civora-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "civora",
    userInterfaceStyle: "automatic",
    ios: {
      ...config.ios,
      supportsTablet: false,
      bundleIdentifier,
      infoPlist: {
        NSCameraUsageDescription:
          "Civora uses the camera so engineers can capture on-site construction evidence and attach photos to field submissions.",
        NSPhotoLibraryUsageDescription:
          "Civora accesses your photo library so you can attach existing site inspection photos to submissions and reports.",
      },
    },
    android: {
      ...config.android,
      package: bundleIdentifier,
      adaptiveIcon: {
        backgroundColor: "#001237",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      permissions: ["CAMERA", "READ_MEDIA_IMAGES"],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow Civora to access your photos to attach site evidence to field submissions.",
          cameraPermission:
            "Allow Civora to access your camera to capture construction site evidence.",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#001237",
          image: "./assets/images/splash-icon.png",
          imageWidth: 96,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      appEnv,
      apiBaseUrl:
        process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.example.invalid",
    },
  };
};

