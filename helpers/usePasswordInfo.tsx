import { useQuery } from "@tanstack/react-query";
import { getPasswordInfo } from "../endpoints/auth/password_info_GET.schema";

export const PASSWORD_INFO_QUERY_KEY = ["auth", "passwordInfo"] as const;

export const usePasswordInfo = () => {
  return useQuery({
    queryKey: PASSWORD_INFO_QUERY_KEY,
    queryFn: () => getPasswordInfo(),
    // This data can be sensitive to time, so refetching on window focus is reasonable.
    // Stale time can be short to ensure data is fresh if the user navigates away and back.
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};