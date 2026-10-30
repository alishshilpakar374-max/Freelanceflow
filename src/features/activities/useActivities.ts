import { useCallback, useEffect } from "react";
import {
  fetchActivities,
  selectAllActivities,
} from "@/features/activities/activitiesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export function useActivities() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const activities = useAppSelector(selectAllActivities);
  const status = useAppSelector((state) => state.activities.status);
  const error = useAppSelector((state) => state.activities.error);

  useEffect(() => {
    if (userId && status === "idle") void dispatch(fetchActivities(userId));
  }, [dispatch, userId, status]);

  const reload = useCallback(() => {
    if (userId) void dispatch(fetchActivities(userId));
  }, [dispatch, userId]);

  return {
    activities,
    status,
    error,
    isLoading: status === "idle" || status === "loading",
    reload,
  };
}
