import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import {
  AuthenticatedUserSchema,
  AuthSessionTokensSchema,
} from "@/lib/validation/contracts";
import { AuthenticatedUser, AuthSessionTokens } from "@/types/contracts";

const SESSION_TOKENS_KEY = "civora.auth.tokens.v1";
const SESSION_USER_KEY = "civora.auth.user.v1";

/**
 * In-memory fallback used only in test runners or web environments where
 * OS Keychain / Keystore via `expo-secure-store` is unavailable.
 * Never persists tokens to plain localStorage.
 */
const memoryFallback = new Map<string, string>();

async function isSecureStoreSupported(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (await isSecureStoreSupported()) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }
  memoryFallback.set(key, value);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (await isSecureStoreSupported()) {
    return SecureStore.getItemAsync(key);
  }
  return memoryFallback.get(key) ?? null;
}

async function deleteSecureItem(key: string): Promise<void> {
  if (await isSecureStoreSupported()) {
    await SecureStore.deleteItemAsync(key);
  }
  memoryFallback.delete(key);
}

export const sessionStorage = {
  async saveSession(
    tokens: AuthSessionTokens,
    user: AuthenticatedUser
  ): Promise<void> {
    const validatedTokens = AuthSessionTokensSchema.parse(tokens);
    const validatedUser = AuthenticatedUserSchema.parse(user);
    await Promise.all([
      setSecureItem(SESSION_TOKENS_KEY, JSON.stringify(validatedTokens)),
      setSecureItem(SESSION_USER_KEY, JSON.stringify(validatedUser)),
    ]);
  },

  async getTokens(): Promise<AuthSessionTokens | null> {
    const raw = await getSecureItem(SESSION_TOKENS_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const validated = AuthSessionTokensSchema.safeParse(parsed);
      return validated.success ? validated.data : null;
    } catch {
      return null;
    }
  },

  async getUser(): Promise<AuthenticatedUser | null> {
    const raw = await getSecureItem(SESSION_USER_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const validated = AuthenticatedUserSchema.safeParse(parsed);
      return validated.success ? validated.data : null;
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      deleteSecureItem(SESSION_TOKENS_KEY),
      deleteSecureItem(SESSION_USER_KEY),
    ]);
  },

  isTokenExpired(tokens: AuthSessionTokens, bufferSeconds = 30): boolean {
    const expiryMs = Date.parse(tokens.expiresAtIso);
    if (Number.isNaN(expiryMs)) {
      return true;
    }
    return Date.now() + bufferSeconds * 1000 >= expiryMs;
  },
};

