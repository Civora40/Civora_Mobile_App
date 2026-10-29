/// <reference types="jest" />
import { filterStakeholderAccessibleReports } from "@/features/reports/stakeholder-workspace-screen";
import { CivoraApiError } from "@/lib/errors/api-error";
import { draftStorage } from "@/lib/offline/draft-storage";
import { sessionStorage } from "@/lib/secure-storage/session-storage";
import {
  FieldSubmissionFormSchema,
  LoginFormSchema,
} from "@/lib/validation/contracts";
import { isRequestSafeToRetry } from "@/services/api-client";
import {
  authService,
  hasMultipleWorkspaces,
  hasPermission,
  isAuthorizedForProject,
  recognizeIdentityFromEmail,
  resolveWorkspaceFromPermissions,
} from "@/services/auth-service";
import { uiStore } from "@/store/ui-store";
import { AuthenticatedUser, CivoraReport } from "@/types/contracts";

describe("Civora Validation, Permission Routing, and Stakeholder Isolation", () => {
  const engineerUser: AuthenticatedUser = {
    id: "usr_eng_1",
    email: "eng@civora.com",
    fullName: "Amara Okafor",
    organizationName: "Civora Engineering",
    role: "engineer",
    permissions: [
      "workspace:engineer",
      "projects:read",
      "submissions:create",
      "uploads:create",
    ],
    assignedProjectIds: ["proj_alpha"],
  };

  const stakeholderUser: AuthenticatedUser = {
    id: "usr_stk_1",
    email: "stakeholder@partner.com",
    fullName: "David Vance",
    organizationName: "Partner Capital",
    role: "stakeholder",
    permissions: [
      "workspace:stakeholder",
      "projects:read",
      "reports:read_released",
      "documents:download_released",
    ],
    assignedProjectIds: ["proj_alpha"],
  };

  it("validates login and field submission forms strictly", () => {
    expect(
      LoginFormSchema.safeParse({ email: "not-an-email", password: "123" })
        .success
    ).toBe(false);

    expect(
      LoginFormSchema.safeParse({
        email: "engineer@civora.com",
        password: "securePassword123",
      }).success
    ).toBe(true);

    expect(
      FieldSubmissionFormSchema.safeParse({
        projectId: "proj_alpha",
        title: "abc", // Too short
        category: "structural",
        notes: "short", // Too short
      }).success
    ).toBe(false);

    expect(
      FieldSubmissionFormSchema.safeParse({
        projectId: "proj_alpha",
        title: "Level 8 Slab Pour Inspection",
        category: "structural",
        notes: "Verified rebar spacing and moisture barrier integrity across grid B4.",
      }).success
    ).toBe(true);
  });

  it("derives workspace routes strictly from backend permissions and supports dual-role workspace switching", () => {
    expect(resolveWorkspaceFromPermissions(null)).toBe("/(auth)/sign-in");
    expect(resolveWorkspaceFromPermissions(engineerUser)).toBe("/(engineer)");
    expect(resolveWorkspaceFromPermissions(stakeholderUser)).toBe(
      "/(stakeholder)"
    );

    const dualRoleUser: AuthenticatedUser = {
      ...engineerUser,
      permissions: ["workspace:engineer", "workspace:stakeholder", "projects:read"],
    };
    expect(hasMultipleWorkspaces(dualRoleUser)).toBe(true);
    expect(resolveWorkspaceFromPermissions(dualRoleUser, "stakeholder")).toBe(
      "/(stakeholder)"
    );
    expect(resolveWorkspaceFromPermissions(dualRoleUser, "engineer")).toBe(
      "/(engineer)"
    );

    const userWithNoWorkspacePerm: AuthenticatedUser = {
      ...engineerUser,
      permissions: ["projects:read"],
    };
    expect(resolveWorkspaceFromPermissions(userWithNoWorkspacePerm)).toBe(
      "/(auth)/sign-in"
    );

    // Automatic role recognition from login email
    const autoEng = recognizeIdentityFromEmail("marcus@civora.com");
    expect(autoEng.role).toBe("engineer");
    expect(resolveWorkspaceFromPermissions(autoEng)).toBe("/(engineer)");

    const autoStk = recognizeIdentityFromEmail("stakeholder@civora.internal");
    expect(autoStk.role).toBe("stakeholder");
    expect(resolveWorkspaceFromPermissions(autoStk)).toBe("/(stakeholder)");

    const autoDual = recognizeIdentityFromEmail("admin@civora.internal");
    expect(hasMultipleWorkspaces(autoDual)).toBe(true);
  });

  it("enforces project assignment boundaries and released-only report access for stakeholders", () => {
    expect(isAuthorizedForProject(stakeholderUser, "proj_alpha")).toBe(true);
    expect(isAuthorizedForProject(stakeholderUser, "proj_unauthorized")).toBe(
      false
    );
    expect(hasPermission(stakeholderUser, "submissions:create")).toBe(false);

    const sampleReports: CivoraReport[] = [
      {
        id: "r1",
        projectId: "proj_alpha",
        title: "Released Report",
        summary: "Official release",
        visibilityStatus: "released",
        version: 1,
        releasedAtIso: "2026-10-20T00:00:00Z",
        downloadUrl: "/v1/reports/r1/download",
      },
      {
        id: "r2",
        projectId: "proj_alpha",
        title: "Internal Draft",
        summary: "Draft only",
        visibilityStatus: "draft",
        version: 1,
        releasedAtIso: null,
        downloadUrl: null,
      },
      {
        id: "r3",
        projectId: "proj_other",
        title: "Other Project Released Report",
        summary: "Unassigned project",
        visibilityStatus: "released",
        version: 1,
        releasedAtIso: "2026-10-20T00:00:00Z",
        downloadUrl: "/v1/reports/r3/download",
      },
    ];

    const visible = filterStakeholderAccessibleReports(
      sampleReports,
      stakeholderUser.assignedProjectIds,
      hasPermission(stakeholderUser, "reports:read_released")
    );

    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe("r1");
  });

  it("preserves local drafts on session expiry, and clears session + drafts on explicit signOut", async () => {
    const validTokens = {
      accessToken: "tok_valid",
      refreshToken: "ref_1",
      expiresAtIso: new Date(Date.now() + 3600_000).toISOString(),
    };

    await sessionStorage.saveSession(validTokens, engineerUser);
    draftStorage.saveDraft({
      clientSubmissionId: "sub_test_expiry",
      idempotencyKey: "idem_test_expiry",
      projectId: "proj_alpha",
      title: "Draft preserved across session expiry",
      category: "safety",
      notes: "Harness check completed on scaffolding.",
      attachments: [],
      syncState: "saved_on_device",
      lastSavedAtIso: new Date().toISOString(),
    });

    // Session expires: tokens cleared, local draft preserved
    await authService.expireSessionPreservingDrafts();
    expect(await sessionStorage.getTokens()).toBeNull();
    expect(draftStorage.listDraftsByProject()).toHaveLength(1);

    // Explicit sign-out: clears local drafts as well
    await authService.signOut();
    expect(draftStorage.listDraftsByProject()).toHaveLength(0);
  });

  it("treats AI report suggestions as proposals until explicitly accepted or discarded by an engineer", () => {
    uiStore.resetOnLogout();
    const initialJob = uiStore.getAiJob();
    expect(initialJob.suggestions[0].accepted).toBeNull();

    uiStore.decideAiSuggestion(initialJob.suggestions[0].id, true);
    expect(uiStore.getAiJob().suggestions[0].accepted).toBe(true);

    uiStore.decideAiSuggestion(initialJob.suggestions[1].id, false);
    expect(uiStore.getAiJob().suggestions[1].accepted).toBe(false);
  });

  it("never retries non-idempotent mutations without an explicit Idempotency-Key", () => {
    const networkError = new CivoraApiError({
      code: "NETWORK_ERROR",
      message: "Socket closed",
    });

    expect(isRequestSafeToRetry("GET", undefined, networkError)).toBe(true);
    expect(isRequestSafeToRetry("POST", undefined, networkError)).toBe(false);
    expect(isRequestSafeToRetry("POST", "idem_key_123", networkError)).toBe(
      true
    );
  });

  it("enforces Splash -> Onboarding -> Sign-In flow progression and supports replay", () => {
    expect(uiStore.getHasCompletedOnboarding()).toBe(false);

    uiStore.setHasCompletedOnboarding(true);
    expect(uiStore.getHasCompletedOnboarding()).toBe(true);

    const beforeReplay = uiStore.getSplashReplayCounter();
    uiStore.replaySplashAndOnboarding();
    expect(uiStore.getHasCompletedOnboarding()).toBe(false);
    expect(uiStore.getSplashReplayCounter()).toBe(beforeReplay + 1);
  });
});
