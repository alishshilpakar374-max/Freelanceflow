import { useCallback, useEffect } from "react";
import { fetchLeads, selectAllLeads } from "@/features/leads/leadsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export function useLeads() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const leads = useAppSelector(selectAllLeads);
  const status = useAppSelector((state) => state.leads.status);
  const error = useAppSelector((state) => state.leads.error);

  // Load once per user. Status 'failed' does NOT retry automatically (no infinite loops).
  useEffect(() => {
    if (userId && status === "idle") void dispatch(fetchLeads(userId));
  }, [dispatch, userId, status]);

  const reload = useCallback(() => {
    if (userId) void dispatch(fetchLeads(userId));
  }, [dispatch, userId]);

  return {
    leads,
    status,
    error,
    isLoading: status === "idle" || status === "loading",
    reload,
  };
}
