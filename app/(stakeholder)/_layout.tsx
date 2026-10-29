import { Redirect, Tabs } from "expo-router";
import {
  BellRing,
  FileCheck2,
  FolderKanban,
  LayoutDashboard,
  User,
} from "lucide-react-native";
import React from "react";

import { useAuth } from "@/providers/auth-provider";
import { useCivoraTheme } from "@/providers/theme-provider";
import { hasPermission } from "@/services/auth-service";

export default function StakeholderLayout() {
  const { user } = useAuth();
  const { isDark } = useCivoraTheme();

  if (!hasPermission(user, "workspace:stakeholder")) {
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
        tabBarActiveTintColor: isDark ? "#4FAAA7" : "#3B68DE",
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
          title: "Overview",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
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
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <FileCheck2 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          title: "Updates",
          tabBarIcon: ({ color, size }) => (
            <BellRing color={color} size={size} />
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
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
