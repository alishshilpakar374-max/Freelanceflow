import { useCallback, useEffect } from "react";
import {
  fetchFollowUps,
  selectAllFollowUps,
} from "@/features/follow-ups/followUpsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export function useFollowUps() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const followUps = useAppSelector(selectAllFollowUps);
  const status = useAppSelector((state) => state.followUps.status);
  const error = useAppSelector((state) => state.followUps.error);

  useEffect(() => {
    if (userId && status === "idle") void dispatch(fetchFollowUps(userId));
  }, [dispatch, userId, status]);

  const reload = useCallback(() => {
    if (userId) void dispatch(fetchFollowUps(userId));
  }, [dispatch, userId]);

  return {
    followUps,
    status,
    error,
    isLoading: status === "idle" || status === "loading",
    reload,
  };
}
