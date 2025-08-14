import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../endpoints/dashboard_GET.schema";

export const DASHBOARD_QUERY_KEY = "dashboard";

export const useDashboard = () => {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY],
    queryFn: getDashboard,
    placeholderData: (prev) => prev,
  });
};