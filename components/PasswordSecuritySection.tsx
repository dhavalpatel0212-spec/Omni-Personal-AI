import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Lock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import { usePasswordSecurity, passwordChangeSchema, PasswordChangeFormData } from '../helpers/usePasswordSecurity';
import styles from './PasswordSecuritySection.module.css';

export const PasswordSecuritySection = ({ className }: { className?: string }) => {
  const { 
    passwordInfoQuery, 
    changePasswordMutation, 
    canChangePassword, 
    getNextAvailableChangeDate, 
    getDaysUntilNextChange 
  } = usePasswordSecurity();

  const { data: passwordInfo, isFetching, error } = passwordInfoQuery;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const newPassword = watch('newPassword');
  const isPasswordChangeAllowed = passwordInfo ? canChangePassword(passwordInfo.lastPasswordChange) : false;
  const daysRemaining = passwordInfo ? getDaysUntilNextChange(passwordInfo.lastPasswordChange) : 0;
  const nextAvailableDate = passwordInfo ? getNextAvailableChangeDate(passwordInfo.lastPasswordChange) : null;

  const onSubmit = async (data: PasswordChangeFormData) => {
    console.log('Submitting password change...');
    try {
      await changePasswordMutation.mutateAsync(data);
      reset();
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: 'No password' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { strength, label: labels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  const getStrengthClassName = (strength: number): string => {
    const strengthKey = `strength${strength}` as keyof typeof styles;
    return styles[strengthKey] || '';
  };

  if (isFetching) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <h3 className={styles.sectionTitle}>
          <Shield size={20} />
          <Skeleton style={{ width: '180px', height: '24px' }} />
        </h3>
        <div className={styles.content}>
          <Skeleton style={{ height: '120px', marginBottom: 'var(--spacing-4)' }} />
          <Skeleton style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    const isPasswordNotFound = error instanceof Error && 
      (error.message.includes('404') || 
       error.message.includes('not found') || 
       error.message.includes('No password'));

    if (isPasswordNotFound) {
      // OAuth user without password setup
      return (
        <div className={`${styles.container} ${className || ''}`}>
          <h3 className={styles.sectionTitle}>
            <Shield size={20} />
            Password & Security
          </h3>

          <div className={styles.content}>
            <div className={styles.oauthUserInfo}>
              <div className={styles.oauthHeader}>
                <CheckCircle size={20} />
                <h4>Account Security Status</h4>
              </div>
              
              <div className={styles.oauthContent}>
                <p>
                  Your account is currently secured through social authentication (Google/GitHub). 
                  You don't have a traditional password set up for this account.
                </p>
                
                <div className={styles.securityOptions}>
                  <h5>Enhanced Security Option</h5>
                  <p>
                    For additional security, you can set up a password for your account. 
                    This allows you to sign in with either your social account or a password, 
                    and provides an extra layer of protection.
                  </p>
                  
                  <div className={styles.passwordSetupNotice}>
                    <Lock size={16} />
                    <div>
                      <p><strong>Password setup is optional</strong></p>
                      <p>
                        Setting up a password won't affect your ability to sign in with your social accounts. 
                        It simply provides an alternative sign-in method and enhanced security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Generic error for other cases
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.error}>
          <AlertTriangle size={20} />
          Error loading password information
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h3 className={styles.sectionTitle}>
        <Shield size={20} />
        Password & Security
      </h3>

      <div className={styles.content}>
        {/* Security Status */}
        <div className={styles.securityStatus}>
          <div className={styles.statusHeader}>
            <h4>Password Security Status</h4>
            <Badge variant={isPasswordChangeAllowed ? 'success' : 'warning'}>
              {isPasswordChangeAllowed ? 'Can Change' : 'Restricted'}
            </Badge>
          </div>
          
          <div className={styles.statusInfo}>
            <div className={styles.statusItem}>
              <Calendar size={16} />
              <span>Last changed: {passwordInfo ? formatDate(passwordInfo.lastPasswordChange) : 'Unknown'}</span>
            </div>
            
            {!isPasswordChangeAllowed && nextAvailableDate && (
              <>
                <div className={styles.statusItem}>
                  <Lock size={16} />
                  <span>Next available: {formatDate(nextAvailableDate)}</span>
                </div>
                <div className={styles.statusItem}>
                  <AlertTriangle size={16} />
                  <span className={styles.warningText}>
                    {daysRemaining} days remaining until you can change your password
                  </span>
                </div>
              </>
            )}
          </div>

          <div className={styles.securityPolicy}>
            <h5>Security Policy</h5>
            <p>
              For your security, passwords can only be changed once every 90 days. 
              This helps protect your account from unauthorized changes and ensures 
              you have time to notice any suspicious activity.
            </p>
          </div>
        </div>

        {/* Password Change Form */}
        <div className={styles.passwordChangeSection}>
          <h4>Change Password</h4>
          
          {!isPasswordChangeAllowed && (
            <div className={styles.restrictionNotice}>
              <AlertTriangle size={16} />
              <div>
                <p><strong>Password change is currently restricted</strong></p>
                <p>
                  You'll be able to change your password on {nextAvailableDate ? formatDate(nextAvailableDate) : 'a future date'}. 
                  This restriction helps keep your account secure.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="currentPassword">Current Password</label>
              <Controller
                name="currentPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    disabled={!isPasswordChangeAllowed}
                    {...field}
                  />
                )}
              />
              {errors.currentPassword && (
                <p className={styles.fieldError}>{errors.currentPassword.message}</p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="newPassword">New Password</label>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    disabled={!isPasswordChangeAllowed}
                    {...field}
                  />
                )}
              />
              {errors.newPassword && (
                <p className={styles.fieldError}>{errors.newPassword.message}</p>
              )}
              
              {newPassword && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthMeter}>
                    <div 
                      className={`${styles.strengthBar} ${getStrengthClassName(passwordStrength.strength)}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={styles.strengthLabel}>
                    Password strength: {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <Controller
                name="confirmNewPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    disabled={!isPasswordChangeAllowed}
                    {...field}
                  />
                )}
              />
              {errors.confirmNewPassword && (
                <p className={styles.fieldError}>{errors.confirmNewPassword.message}</p>
              )}
            </div>

            <div className={styles.passwordRequirements}>
              <h5>Password Requirements</h5>
              <ul>
                <li className={newPassword && newPassword.length >= 8 ? styles.requirementMet : ''}>
                  <CheckCircle size={16} />
                  At least 8 characters long
                </li>
                <li className={newPassword && /[a-z]/.test(newPassword) ? styles.requirementMet : ''}>
                  <CheckCircle size={16} />
                  Contains lowercase letters
                </li>
                <li className={newPassword && /[A-Z]/.test(newPassword) ? styles.requirementMet : ''}>
                  <CheckCircle size={16} />
                  Contains uppercase letters
                </li>
                <li className={newPassword && /\d/.test(newPassword) ? styles.requirementMet : ''}>
                  <CheckCircle size={16} />
                  Contains numbers
                </li>
              </ul>
            </div>

            <div className={styles.formActions}>
              <Button
                type="submit"
                disabled={!isPasswordChangeAllowed || isSubmitting || changePasswordMutation.isPending}
              >
                {isSubmitting || changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};