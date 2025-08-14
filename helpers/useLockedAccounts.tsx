import { useQuery } from "@tanstack/react-query";
import { getLockedAccounts, LockedAccount } from "../endpoints/admin/locked_accounts_GET.schema";

export const LOCKED_ACCOUNTS_QUERY_KEY = ["admin", "lockedAccounts"] as const;

/**
 * React Query hook to fetch the list of permanently locked user accounts.
 * This hook should only be used in components accessible to admin users.
 *
 * It provides the data, loading, and error states for the async operation.
 *
 * @example
 * const { data: lockedAccounts, isLoading, error } = useLockedAccounts();
 *
 * if (isLoading) return <p>Loading locked accounts...</p>;
 * if (error) return <p>Error: {error.message}</p>;
 *
 * return (
 *   <ul>
 *     {lockedAccounts?.map(account => (
 *       <li key={account.email}>
 *         {account.email} - {account.failedAttempts} failed attempts
 *       </li>
 *     ))}
 *   </ul>
 * );
 */
export const useLockedAccounts = () => {
  return useQuery<LockedAccount[], Error>({
    queryKey: LOCKED_ACCOUNTS_QUERY_KEY,
    queryFn: () => getLockedAccounts(),
    // Data is sensitive and can change, so refetching on window focus is reasonable.
    // Stale time can be set to a few minutes if real-time data isn't critical.
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};