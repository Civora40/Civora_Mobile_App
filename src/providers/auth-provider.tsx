import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ENV } from "@/constants/env";
import { draftStorage } from "@/lib/offline/draft-storage";
import { sessionStorage } from "@/lib/secure-storage/session-storage";
import { LoginFormValues, RegisterFormValues } from "@/lib/validation/contracts";
import { registerUnauthorizedHandler } from "@/services/api-client";
import {
  authService,
  ResolvedWorkspaceRoute,
  resolveWorkspaceFromPermissions,
} from "@/services/auth-service";
import { uiStore } from "@/store/ui-store";
import {
  AuthenticatedUser,
  AuthSessionTokens,
  CivoraRole,
} from "@/types/contracts";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isInitializing: boolean;
  isSessionExpired: boolean;
  workspaceRoute: ResolvedWorkspaceRoute;
  signIn: (credentials: LoginFormValues) => Promise<AuthenticatedUser>;
  register: (values: RegisterFormValues) => Promise<AuthenticatedUser>;
  signInWithBiometricsOrPasscode: (params: {
    method: "face_id" | "device_passcode";
    emailHint?: string;
  }) => Promise<AuthenticatedUser>;
  signOut: () => Promise<void>;
  switchWorkspace: (role: CivoraRole) => void;
  triggerSessionExpirySimulation: () => Promise<void>;
  activateDevelopmentRolePreview: (
    role: CivoraRole | "dual_role"
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [workspaceOverride, setWorkspaceOverride] =
    useState<CivoraRole | null>(() => uiStore.getActiveWorkspaceOverride());

  /**
   * When a session expires mid-field-work, preserve local unsent drafts (`draftStorage`)
   * while clearing protected server query caches and session tokens.
   */
  const handleSessionExpired = useCallback(async () => {
    await authService.expireSessionPreservingDrafts(queryClient);
    setUser(null);
    setIsSessionExpired(true);
  }, [queryClient]);

  useEffect(() => {
    registerUnauthorizedHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      try {
        const [tokens, storedUser] = await Promise.all([
          sessionStorage.getTokens(),
          sessionStorage.getUser(),
        ]);

        if (!tokens || !storedUser) {
          if (mounted) setUser(null);
          return;
        }

        if (sessionStorage.isTokenExpired(tokens)) {
          const refreshed = await authService.refreshSession();
          if (mounted) {
            if (refreshed) {
              setUser(refreshed.user);
            } else {
              setUser(null);
              setIsSessionExpired(true);
            }
          }
          return;
        }

        if (mounted) {
          setUser(storedUser);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(
    async (credentials: LoginFormValues): Promise<AuthenticatedUser> => {
      const previousUser = await sessionStorage.getUser();
      const session = await authService.signInWithCredentials(credentials);

      // Clear local drafts only if switching to a different user account
      if (previousUser && previousUser.id !== session.user.id) {
        draftStorage.clearAllOnLogout();
      }
      queryClient.clear();
      uiStore.setActiveWorkspaceOverride(session.user.role);
      setWorkspaceOverride(session.user.role);
      setIsSessionExpired(false);
      setUser(session.user);
      return session.user;
    },
    [queryClient]
  );

  const register = useCallback(
    async (values: RegisterFormValues): Promise<AuthenticatedUser> => {
      const session = await authService.registerAccount(values);
      queryClient.clear();
      uiStore.setActiveWorkspaceOverride(session.user.role);
      setWorkspaceOverride(session.user.role);
      setIsSessionExpired(false);
      setUser(session.user);
      return session.user;
    },
    [queryClient]
  );

  const signInWithBiometricsOrPasscode = useCallback(
    async (params: {
      method: "face_id" | "device_passcode";
      emailHint?: string;
    }): Promise<AuthenticatedUser> => {
      const previousUser = await sessionStorage.getUser();
      const session = await authService.signInWithBiometricsOrPasscode(params);

      if (previousUser && previousUser.id !== session.user.id) {
        draftStorage.clearAllOnLogout();
      }
      queryClient.clear();
      uiStore.setActiveWorkspaceOverride(session.user.role);
      setWorkspaceOverride(session.user.role);
      setIsSessionExpired(false);
      setUser(session.user);
      return session.user;
    },
    [queryClient]
  );

  const signOut = useCallback(async () => {
    await authService.signOut(queryClient);
    setWorkspaceOverride(null);
    setIsSessionExpired(false);
    setUser(null);
  }, [queryClient]);

  const switchWorkspace = useCallback((role: CivoraRole) => {
    uiStore.setActiveWorkspaceOverride(role);
    setWorkspaceOverride(role);
  }, []);

  const triggerSessionExpirySimulation = useCallback(async () => {
    await handleSessionExpired();
  }, [handleSessionExpired]);

  const activateDevelopmentRolePreview = useCallback(
    async (role: CivoraRole | "dual_role") => {
      if (ENV.appEnv === "production") {
        throw new Error(
          "Development role preview is disabled in production builds."
        );
      }

      const previousUser = user;
      const targetUserId =
        role === "engineer"
          ? "usr_eng_preview_01"
          : role === "stakeholder"
            ? "usr_stk_preview_01"
            : "usr_dual_preview_01";

      if (previousUser && previousUser.id !== targetUserId) {
        draftStorage.clearAllOnLogout();
      }
      queryClient.clear();

      const previewUser: AuthenticatedUser =
        role === "engineer"
          ? {
            id: "usr_eng_preview_01",
            email: "engineer@civora.internal",
            fullName: "Marcus Vance, PE",
            organizationName: "Civora Infrastructure Ltd",
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
          }
          : role === "stakeholder"
            ? {
              id: "usr_stk_preview_01",
              email: "stakeholder@civora.internal",
              fullName: "Elena Rostova",
              organizationName: "Civora Infrastructure Ltd (Oversight)",
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
            }
            : {
              id: "usr_dual_preview_01",
              email: "admin@civora.internal",
              fullName: "Sarah Chen (Lead Systems Architect)",
              organizationName: "Civora Infrastructure Ltd",
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

      const resolvedRole: CivoraRole =
        role === "stakeholder" ? "stakeholder" : "engineer";

      uiStore.setActiveWorkspaceOverride(resolvedRole);
      setWorkspaceOverride(resolvedRole);

      const previewTokens: AuthSessionTokens = {
        accessToken: `dev_preview_token_${role}`,
        refreshToken: `dev_preview_refresh_${role}`,
        expiresAtIso: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      await sessionStorage.saveSession(previewTokens, previewUser);
      setIsSessionExpired(false);
      setUser(previewUser);
    },
    [queryClient, user]
  );

  const workspaceRoute = useMemo(
    () => resolveWorkspaceFromPermissions(user, workspaceOverride),
    [user, workspaceOverride]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      isSessionExpired,
      workspaceRoute,
      signIn,
      register,
      signInWithBiometricsOrPasscode,
      signOut,
      switchWorkspace,
      triggerSessionExpirySimulation,
      activateDevelopmentRolePreview,
    }),
    [
      user,
      isInitializing,
      isSessionExpired,
      workspaceRoute,
      signIn,
      register,
      signInWithBiometricsOrPasscode,
      signOut,
      switchWorkspace,
      triggerSessionExpirySimulation,
      activateDevelopmentRolePreview,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
