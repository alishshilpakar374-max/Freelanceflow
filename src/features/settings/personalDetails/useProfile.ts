import { useEffect, useState } from "react";
import { getErrorMessage } from "@/features/leads/leadsApi";
import { getProfile } from "@/features/settings/personalDetails/profileApi";
import type { ProfileFormValues } from "@/features/settings/personalDetails/profileSchema";

type State =
  | { status: "loading" }
  | { status: "ready"; profile: ProfileFormValues | null }
  | { status: "failed"; error: string };

export function useProfile(userId: string) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getProfile(userId)
      .then((profile) => {
        if (!cancelled) {
          setState({ status: "ready", profile });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "failed",
            error: getErrorMessage(error, "Could not load your profile."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  return { state, reload: () => setAttempt((count) => count + 1) };
}
