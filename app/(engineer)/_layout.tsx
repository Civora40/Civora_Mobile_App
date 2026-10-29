import { Redirect, Tabs } from "expo-router";
import {
  FileText,
  FolderKanban,
  Home,
  Plus,
  User,
} from "lucide-react-native";
import React from "react";
import { View } from "react-native";

import { useAuth } from "@/providers/auth-provider";
import { useCivoraTheme } from "@/providers/theme-provider";
import { hasPermission } from "@/services/auth-service";

export default function EngineerLayout() {
  const { user } = useAuth();
  const { isDark } = useCivoraTheme();

  if (!hasPermission(user, "workspace:engineer")) {
    return <Redirect href="/(auth)/access-denied" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#18243D" : "#FFFFFF",
          borderTopColor: isDark ? "#1E293B" : "#E2E8F0",
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: isDark ? "#4FAAA7" : "#001237",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color, size }) => (
            <FolderKanban color={color} size={size} />
          ),
        }}
      />
      {/* Center Prominent Action Tab inspired by Reference Image 4 */}
      <Tabs.Screen
        name="submissions"
        options={{
          title: "Submittals",
          tabBarIcon: () => (
            <View className="-mt-3 h-12 w-12 items-center justify-center rounded-full bg-civora-teal shadow-md">
              <Plus color="#001237" size={24} strokeWidth={2.6} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
