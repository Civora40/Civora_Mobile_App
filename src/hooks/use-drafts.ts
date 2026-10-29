import { useEffect, useState } from "react";

import { draftStorage } from "@/lib/offline/draft-storage";
import { FieldSubmissionDraft } from "@/types/contracts";

export function useLocalDrafts(projectId?: string): FieldSubmissionDraft[] {
  const [drafts, setDrafts] = useState<FieldSubmissionDraft[]>(() =>
    draftStorage.listDraftsByProject(projectId)
  );

  useEffect(() => {
    setDrafts(draftStorage.listDraftsByProject(projectId));
    return draftStorage.subscribe(() => {
      setDrafts(draftStorage.listDraftsByProject(projectId));
    });
  }, [projectId]);

  return drafts;
}

