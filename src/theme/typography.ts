/**
 * Civora Typography Configuration
 * Matches tailwind.config.js fontFamily definitions and expo-font registration.
 */

export const CIVORA_FONTS = {
  heading: "EncodeSansCondensed",
  body: "System",
  mono: "SpaceMono",
} as const;

export const TYPE_SCALE = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "700" as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "500" as const },
} as const;

