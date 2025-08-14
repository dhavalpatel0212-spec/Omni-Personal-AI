import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldAlert, Unlock, Loader2 } from 'lucide-react';

import { useAuth } from '../helpers/useAuth';
import { useLockedAccounts, LOCKED_ACCOUNTS_QUERY_KEY } from '../helpers/useLockedAccounts';
import { postUnlockAccount } from '../endpoints/admin/unlock_account_POST.schema';
import { LockedAccount } from '../endpoints/admin/locked_accounts_GET.schema';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { ConfirmationDialog } from './ConfirmationDialog';
import styles from './AdminAccountManagement.module.css';

const AdminAccountManagementSkeleton: React.FC = () => (
  <div className={styles.card}>
    <div className={styles.header}>
      <Skeleton style={{ height: '2rem', width: '250px' }} />
      <Skeleton style={{ height: '1.25rem', width: '350px' }} />
    </div>
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th><Skeleton style={{ height: '1rem', width: '150px' }} /></th>
            <th><Skeleton style={{ height: '1rem', width: '200px' }} /></th>
            <th><Skeleton style={{ height: '1rem', width: '80px' }} /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(3)].map((_, i) => (
            <tr key={i}>
              <td><Skeleton style={{ height: '1.25rem', width: '200px' }} /></td>
              <td><Skeleton style={{ height: '1.25rem', width: '250px' }} /></td>
              <td><Skeleton style={{ height: '2.5rem', width: '100px', borderRadius: 'var(--radius)' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const AdminAccountManagement: React.FC<{ className?: string }> = ({ className }) => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const [unlockTarget, setUnlockTarget] = useState<LockedAccount | null>(null);

  const { data: lockedAccounts, isLoading, isError, error } = useLockedAccounts();

  const unlockMutation = useMutation({
    mutationFn: postUnlockAccount,
    onSuccess: (data, variables) => {
      toast.success(`Account for ${variables.email} has been unlocked.`);
      queryClient.invalidateQueries({ queryKey: LOCKED_ACCOUNTS_QUERY_KEY });
    },
    onError: (err, variables) => {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`Failed to unlock account for ${variables.email}: ${errorMessage}`);
      console.error(`Error unlocking account ${variables.email}:`, err);
    },
    onSettled: () => {
      setUnlockTarget(null);
    },
  });

  const handleUnlockClick = (account: LockedAccount) => {
    setUnlockTarget(account);
  };

  const handleConfirmUnlock = () => {
    if (unlockTarget) {
      unlockMutation.mutate({ email: unlockTarget.email });
    }
  };

  if (authState.type === 'loading') {
    return <AdminAccountManagementSkeleton />;
  }

  if (authState.type !== 'authenticated' || authState.user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return <AdminAccountManagementSkeleton />;
  }

  if (isError) {
    return (
      <div className={`${styles.card} ${styles.errorState} ${className || ''}`}>
        <ShieldAlert className={styles.errorIcon} />
        <h3 className={styles.errorTitle}>Failed to load locked accounts</h3>
        <p className={styles.errorMessage}>{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.card} ${className || ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Locked Account Management</h2>
          <p className={styles.description}>
            Review and unlock user accounts that have been locked due to too many failed login attempts.
          </p>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Email</th>
                <th>Last Failed Attempt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lockedAccounts && lockedAccounts.length > 0 ? (
                lockedAccounts.map((account) => (
                  <tr key={account.email}>
                    <td data-label="User Email">{account.email}</td>
                    <td data-label="Last Failed Attempt">
                      {new Date(account.lastAttemptAt).toLocaleString()}
                    </td>
                    <td data-label="Actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlockClick(account)}
                        disabled={unlockMutation.isPending && unlockTarget?.email === account.email}
                      >
                        {unlockMutation.isPending && unlockTarget?.email === account.email ? (
                          <Spinner size="sm" />
                        ) : (
                          <Unlock size={16} />
                        )}
                        <span>Unlock</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                      <Unlock size={48} className={styles.emptyIcon} />
                      <p className={styles.emptyTitle}>No Locked Accounts</p>
                      <p className={styles.emptyDescription}>
                        There are currently no user accounts that are permanently locked.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!unlockTarget}
        onOpenChange={(isOpen) => !isOpen && setUnlockTarget(null)}
        title="Confirm Account Unlock"
        description={`Are you sure you want to unlock the account for ${unlockTarget?.email}? This will clear all their failed login attempts and allow them to try logging in again.`}
        confirmText="Unlock Account"
        onConfirm={handleConfirmUnlock}
        isConfirming={unlockMutation.isPending}
        variant="destructive"
      />
    </>
  );
};