import { useCallback, useEffect } from "react";
import {
  fetchProjects,
  selectPayments,
  selectProjects,
} from "@/features/projects/projectsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export function useProjects() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const projects = useAppSelector(selectProjects);
  const payments = useAppSelector(selectPayments);
  const status = useAppSelector((state) => state.projects.status);
  const error = useAppSelector((state) => state.projects.error);

  useEffect(() => {
    if (userId && status === "idle") void dispatch(fetchProjects(userId));
  }, [dispatch, userId, status]);

  const reload = useCallback(() => {
    if (userId) void dispatch(fetchProjects(userId));
  }, [dispatch, userId]);

  return {
    projects,
    payments,
    status,
    error,
    isLoading: status === "idle" || status === "loading",
    reload,
  };
}
