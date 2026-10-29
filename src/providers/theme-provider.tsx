import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { createContext, useContext, useMemo, useState } from "react";
import {
  Appearance,
  useColorScheme as useSystemColorScheme,
} from "react-native";

export type ThemePreference = "system" | "light" | "dark";
export type ThemeMode = ThemePreference;

interface CivoraThemeContextValue {
  mode: ThemeMode;
  colorScheme: "light" | "dark";
  isDark: boolean;
  setMode: (scheme: ThemeMode) => void;
  setColorScheme: (scheme: ThemePreference) => void;
  toggleColorScheme: () => void;
}

const CivoraThemeContext = createContext<CivoraThemeContextValue | null>(null);

/**
 * Synchronizes with the mobile OS Light/Dark mode by default ("system"),
 * while also allowing manual override when testing on device/simulator.
 * Ensures NativeWind's `colorScheme` and `isDark` are always 100% in lockstep.
 */
export function CivoraThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useSystemColorScheme();
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  // Always use NativeWind's active `colorScheme` as the single source of truth
  // so `isDark` and `dark:` Tailwind classes never disagree.
  const resolvedScheme: "light" | "dark" =
    colorScheme === "dark" || colorScheme === "light"
      ? colorScheme
      : systemScheme === "dark"
        ? "dark"
        : "light";

  const applyScheme = (pref: ThemeMode) => {
    setModeState(pref);
    setColorScheme(pref);
    try {
      if (typeof Appearance?.setColorScheme === "function") {
        Appearance.setColorScheme(pref === "system" ? "unspecified" : pref);
      }
    } catch {
      // Ignore in test environments where Appearance.setColorScheme is a no-op
    }
  };

  const value = useMemo<CivoraThemeContextValue>(
    () => ({
      mode,
      colorScheme: resolvedScheme,
      isDark: resolvedScheme === "dark",
      setMode: applyScheme,
      setColorScheme: applyScheme,
      toggleColorScheme: () => {
        const next: "light" | "dark" =
          resolvedScheme === "dark" ? "light" : "dark";
        applyScheme(next);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, resolvedScheme]
  );

  return (
    <CivoraThemeContext.Provider value={value}>
      {children}
    </CivoraThemeContext.Provider>
  );
}

export function useCivoraTheme(): CivoraThemeContextValue {
  const ctx = useContext(CivoraThemeContext);
  if (!ctx) {
    return {
      mode: "system",
      colorScheme: "light",
      isDark: false,
      setMode: () => {},
      setColorScheme: () => {},
      toggleColorScheme: () => {},
    };
  }
  return ctx;
}
