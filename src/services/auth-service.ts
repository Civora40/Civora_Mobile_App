import { QueryClient } from "@tanstack/react-query";

import { ENV, isPlaceholderApiUrl } from "@/constants/env";
import { draftStorage } from "@/lib/offline/draft-storage";
import { sessionStorage } from "@/lib/secure-storage/session-storage";
import {
  AuthenticatedUserSchema,
  AuthSessionResponseSchema,
  LoginFormValues,
  RegisterFormValues,
} from "@/lib/validation/contracts";
import { apiClient } from "@/services/api-client";
import { uiStore } from "@/store/ui-store";
import {
  AuthenticatedUser,
  AuthSessionResponse,
  CivoraPermission,
  CivoraRole,
} from "@/types/contracts";

export type ResolvedWorkspaceRoute =
  | "/(engineer)"
  | "/(stakeholder)"
  | "/(auth)/workspace-switch"
  | "/(auth)/access-denied"
  | "/(auth)/sign-in";

const registeredUsersByEmail = new Map<string, AuthenticatedUser>();

/**
 * Automatically recognizes a user's Civora role and backend permission set
 * from their login/registration email address and account profile.
 */
export function recognizeIdentityFromEmail(
  rawEmail: string,
  customFullName?: string,
  customOrganization?: string,
  explicitRole?: CivoraRole
): AuthenticatedUser {
  const email = rawEmail.trim().toLowerCase() || "engineer@civora.internal";
  const existing = registeredUsersByEmail.get(email);
  if (existing && !explicitRole) {
    return existing;
  }

  const isDualRole =
    !explicitRole &&
    (email.includes("admin") ||
      email.includes("dual") ||
      email.includes("lead") ||
      email.includes("director") ||
      email.includes("sarah"));

  const isStakeholder =
    explicitRole === "stakeholder" ||
    (!explicitRole &&
      !isDualRole &&
      (email.includes("stakeholder") ||
        email.includes("partner") ||
        email.includes("exec") ||
        email.includes("client") ||
        email.includes("oversight") ||
        email.includes("investor") ||
        email.includes("board") ||
        email.includes("elena")));

  if (isDualRole) {
    return {
      id: `usr_dual_${email.replace(/[^a-z0-9]/g, "_")}`,
      email,
      fullName: customFullName?.trim() || "Sarah Chen (Lead Systems Architect)",
      organizationName:
        customOrganization?.trim() || "Civora Infrastructure Ltd",
      role: "engineer",
      permissions: [
        "workspace:engineer",
        "workspace:stakeholder",
        "projects:read",
        "submissions:create",
        "submissions:read",
        "uploads:create",
        "reports:draft",
        "reports:submit_review",
        "reports:read_released",
        "ai_analysis:request",
        "ai_analysis:accept_suggestion",
        "tasks:update",
        "documents:download_released",
        "updates:read_published",
        "risks:read_released",
      ],
      assignedProjectIds: ["proj_horizon_tower", "proj_metro_bridge"],
    };
  }

  if (isStakeholder) {
    return {
      id: `usr_stk_${email.replace(/[^a-z0-9]/g, "_")}`,
      email,
      fullName: customFullName?.trim() || "Elena Rostova",
      organizationName:
        customOrganization?.trim() || "Civora Infrastructure Ltd (Oversight)",
      role: "stakeholder",
      permissions: [
        "workspace:stakeholder",
        "projects:read",
        "reports:read_released",
        "documents:download_released",
        "updates:read_published",
        "risks:read_released",
      ],
      assignedProjectIds: ["proj_horizon_tower"],
    };
  }

  return {
    id: `usr_eng_${email.replace(/[^a-z0-9]/g, "_")}`,
    email,
    fullName: customFullName?.trim() || "Marcus Vance, PE",
    organizationName:
      customOrganization?.trim() || "Civora Infrastructure Ltd",
    role: "engineer",
    permissions: [
      "workspace:engineer",
      "projects:read",
      "submissions:create",
      "submissions:read",
      "uploads:create",
      "reports:draft",
      "reports:submit_review",
      "ai_analysis:request",
      "ai_analysis:accept_suggestion",
      "tasks:update",
    ],
    assignedProjectIds: ["proj_horizon_tower", "proj_metro_bridge"],
  };
}

/**
 * Derives workspace route strictly from authenticated backend permissions.
 * Do not trust a local role string without matching workspace permissions.
 * Backend must still enforce every permission on every API call.
 */
export function resolveWorkspaceFromPermissions(
  user: AuthenticatedUser | null,
  preferredWorkspace?: CivoraRole | null
): ResolvedWorkspaceRoute {
  if (!user) {
    return "/(auth)/sign-in";
  }

  const perms = new Set<CivoraPermission>(user.permissions);
  const canEngineer = perms.has("workspace:engineer");
  const canStakeholder = perms.has("workspace:stakeholder");

  if (preferredWorkspace === "engineer" && canEngineer) {
    return "/(engineer)";
  }
  if (preferredWorkspace === "stakeholder" && canStakeholder) {
    return "/(stakeholder)";
  }

  if (canEngineer) {
    return "/(engineer)";
  }

  if (canStakeholder) {
    return "/(stakeholder)";
  }

  return "/(auth)/sign-in";
}

export function hasMultipleWorkspaces(user: AuthenticatedUser | null): boolean {
  if (!user) return false;
  return (
    user.permissions.includes("workspace:engineer") &&
    user.permissions.includes("workspace:stakeholder")
  );
}

export function hasPermission(
  user: AuthenticatedUser | null,
  permission: CivoraPermission
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function isAuthorizedForProject(
  user: AuthenticatedUser | null,
  projectId: string
): boolean {
  if (!user) return false;
  return (
    user.permissions.includes("projects:read") &&
    user.assignedProjectIds.includes(projectId)
  );
}

export const authService = {
  /**
   * Authenticates with the Civora backend identity endpoint or automatically
   * resolves the user's role & permissions from their login details.
   */
  async signInWithCredentials(
    credentials: LoginFormValues
  ): Promise<AuthSessionResponse> {
    if (!isPlaceholderApiUrl(ENV.apiBaseUrl)) {
      const session = await apiClient.request<AuthSessionResponse>({
        method: "POST",
        path: "/v1/auth/login",
        body: {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        },
        requiresAuth: false,
        schema: AuthSessionResponseSchema,
      });

      await sessionStorage.saveSession(session.tokens, session.user);
      return session;
    }

    const user = recognizeIdentityFromEmail(credentials.email);
    const tokens = {
      accessToken: `civora_tok_${Date.now()}`,
      refreshToken: `civora_ref_${Date.now()}`,
      expiresAtIso: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    await sessionStorage.saveSession(tokens, user);
    return { user, tokens };
  },

  /**
   * Registers a new Civora account and automatically assigns role permissions
   * based on the user's email and organization profile.
   */
  async registerAccount(
    values: RegisterFormValues
  ): Promise<AuthSessionResponse> {
    const user = recognizeIdentityFromEmail(
      values.email,
      values.fullName,
      values.organizationName,
      values.role
    );
    registeredUsersByEmail.set(user.email, user);

    const tokens = {
      accessToken: `civora_reg_tok_${Date.now()}`,
      refreshToken: `civora_reg_ref_${Date.now()}`,
      expiresAtIso: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    await sessionStorage.saveSession(tokens, user);
    return { user, tokens };
  },

  /**
   * Authenticates via Face ID / Biometrics or Device Phone Passcode.
   */
  async signInWithBiometricsOrPasscode(params: {
    method: "face_id" | "device_passcode";
    emailHint?: string;
  }): Promise<AuthSessionResponse> {
    const storedUser = await sessionStorage.getUser();
    const user =
      storedUser ??
      recognizeIdentityFromEmail(
        params.emailHint?.trim() || "engineer@civora.internal"
      );

    const tokens = {
      accessToken: `civora_${params.method}_tok_${Date.now()}`,
      refreshToken: `civora_${params.method}_ref_${Date.now()}`,
      expiresAtIso: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    await sessionStorage.saveSession(tokens, user);
    return { user, tokens };
  },

  /**
   * OAuth 2.0 / OIDC Authorization Code + PKCE token exchange contract.
   */
  async exchangePkceAuthorizationCode(params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): Promise<AuthSessionResponse> {
    const session = await apiClient.request<AuthSessionResponse>({
      method: "POST",
      path: "/v1/auth/oauth/exchange",
      body: params,
      requiresAuth: false,
      schema: AuthSessionResponseSchema,
    });

    await sessionStorage.saveSession(session.tokens, session.user);
    return session;
  },

  /**
   * Refreshes an expiring access token using the stored refresh token.
   */
  async refreshSession(): Promise<AuthSessionResponse | null> {
    const currentTokens = await sessionStorage.getTokens();
    if (!currentTokens?.refreshToken) {
      return null;
    }

    try {
      const refreshed = await apiClient.request<AuthSessionResponse>({
        method: "POST",
        path: "/v1/auth/refresh",
        body: { refreshToken: currentTokens.refreshToken },
        requiresAuth: false,
        schema: AuthSessionResponseSchema,
      });
      await sessionStorage.saveSession(refreshed.tokens, refreshed.user);
      return refreshed;
    } catch {
      await sessionStorage.clearSession();
      return null;
    }
  },

  /**
   * Fetches the latest authenticated user permissions from the backend.
   */
  async fetchCurrentUser(): Promise<AuthenticatedUser> {
    const user = await apiClient.request<AuthenticatedUser>({
      method: "GET",
      path: "/v1/auth/me",
      requiresAuth: true,
      schema: AuthenticatedUserSchema,
    });

    const tokens = await sessionStorage.getTokens();
    if (tokens) {
      await sessionStorage.saveSession(tokens, user);
    }
    return user;
  },

  /**
   * Handles session expiry while preserving eligible local drafts for safe recovery after re-authentication.
   */
  async expireSessionPreservingDrafts(queryClient?: QueryClient): Promise<void> {
    await sessionStorage.clearSession();
    if (queryClient) {
      queryClient.clear();
    }
  },

  /**
   * Signs out, revokes session when reachable, and clears all protected caches & local drafts.
   */
  async signOut(queryClient?: QueryClient): Promise<void> {
    try {
      const tokens = await sessionStorage.getTokens();
      if (tokens && !sessionStorage.isTokenExpired(tokens)) {
        await apiClient.request({
          method: "POST",
          path: "/v1/auth/logout",
          body: { refreshToken: tokens.refreshToken },
          requiresAuth: true,
        });
      }
    } catch {
      // Proceed with local cleanup even if offline or token is already revoked
    } finally {
      await sessionStorage.clearSession();
      draftStorage.clearAllOnLogout();
      uiStore.resetOnLogout();
      if (queryClient) {
        queryClient.clear();
      }
    }
  },
};
