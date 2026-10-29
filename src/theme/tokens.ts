/**
 * Civora Design System Tokens
 * Product: Civora — Intelligent Construction. Clearer Control.
 */

export const CIVORA_COLORS = {
  midnight: "#001237",
  steel: "#18243D",
  teal: "#4FAAA7",
  blue: "#3B68DE",
  surface: {
    light: "#F8FAFC",
    cardLight: "#FFFFFF",
    dark: "#001237",
    cardDark: "#18243D",
  },
  status: {
    submitted: "#16A34A", // Only after server confirmation
    localDraft: "#D97706", // Saved on this device (not yet confirmed by server)
    uploading: "#3B68DE",
    failed: "#DC2626",
    conflict: "#9333EA",
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  touchTargetMin: 44, // Accessibility minimum touch target (px)
} as const;

