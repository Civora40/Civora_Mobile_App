/// <reference types="jest" />
import { draftStorage } from "@/lib/offline/draft-storage";
import { createClientSubmissionDraft } from "@/services/upload-service";

describe("Civora Truthful Draft & Conflict Lifecycle", () => {
  beforeEach(() => {
    draftStorage.clearAllOnLogout();
  });

  it("creates drafts marked saved_on_device with unique idempotency keys and never claims server submission prematurely", () => {
    const draftA = createClientSubmissionDraft({
      projectId: "proj_horizon_tower",
      title: "Column C4 Concrete Slump Test",
      category: "materials",
      notes: "Measured 105mm slump on batch #18 prior to placement.",
    });

    const draftB = createClientSubmissionDraft({
      projectId: "proj_horizon_tower",
      title: "Column C5 Concrete Slump Test",
      category: "materials",
      notes: "Measured 100mm slump on batch #19 prior to placement.",
    });

    expect(draftA.syncState).toBe("saved_on_device");
    expect(draftA.idempotencyKey).toBeTruthy();
    expect(draftA.clientSubmissionId).not.toBe(draftB.clientSubmissionId);
    expect(draftA.idempotencyKey).not.toBe(draftB.idempotencyKey);
  });

  it("surfaces 409 server conflicts without silently overwriting newer server versions", () => {
    const draft = createClientSubmissionDraft({
      projectId: "proj_horizon_tower",
      title: "Electrical Conduit Routing L3",
      category: "electrical",
      notes: "Initial conduit inspection notes.",
    });

    const conflicted = draftStorage.markConflict(
      draft.clientSubmissionId,
      4,
      "Server record is at version 4; local draft was based on version 2."
    );

    expect(conflicted?.syncState).toBe("conflict");
    expect(conflicted?.baseServerVersion).toBe(4);
    expect(conflicted?.lastErrorMessage).toContain("version 4");
  });

  it("transitions to submitted_to_civora only when explicitly confirmed with a server version", () => {
    const draft = createClientSubmissionDraft({
      projectId: "proj_horizon_tower",
      title: "Perimeter Guardrail Check",
      category: "safety",
      notes: "All top rails and toe boards verified on North elevation.",
    });

    expect(draft.syncState).toBe("saved_on_device");

    const confirmed = draftStorage.markSubmittedToCivora(
      draft.clientSubmissionId,
      1
    );

    expect(confirmed?.syncState).toBe("submitted_to_civora");
    expect(confirmed?.baseServerVersion).toBe(1);
  });
});
