import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '../helpers/useSettings';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Skeleton } from './Skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Badge } from './Badge';
import { Camera, Phone, CreditCard, Calendar, DollarSign, Upload, Trash2 } from 'lucide-react';
import { PasswordSecuritySection } from './PasswordSecuritySection';
import styles from './ProfileSettings.module.css';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  phoneCountryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT)' },
];

export const ProfileSettings = ({ className }: { className?: string }) => {
  const { profileQuery, updateUserProfile } = useSettings();
  const { data: profile, isFetching, error } = profileQuery;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: profile?.displayName || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      phoneCountryCode: profile?.phoneCountryCode || '+1',
      phoneNumber: profile?.phoneNumber || '',
      location: profile?.location || '',
      timezone: profile?.timezone || 'UTC',
    },
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  React.useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        email: profile.email,
        bio: profile.bio || '',
        phoneCountryCode: profile.phoneCountryCode || '+1',
        phoneNumber: profile.phoneNumber || '',
        location: profile.location || '',
        timezone: profile.timezone || 'UTC',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormData) => {
    console.log('Updating profile with:', data);
    updateUserProfile.mutate(data);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const getPlanBadgeVariant = (plan?: string | null) => {
    switch (plan?.toLowerCase()) {
      case 'pro':
        return 'default';
      case 'premium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'inactive':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const handleAvatarUpload = () => {
    console.log('Avatar upload functionality to be implemented');
    // TODO: Implement avatar upload functionality
  };

  const handleAvatarDelete = () => {
    console.log('Avatar delete functionality to be implemented');
    // TODO: Implement avatar delete functionality
  };

  if (isFetching) {
    return <ProfileSettingsSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Error loading profile: {error.message}</div>;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h2 className={styles.title}>Profile & Account</h2>
      <p className={styles.description}>Update your photo and personal details here.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Avatar Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Camera size={20} />
            Profile Picture
          </h3>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <Avatar className={styles.avatar}>
                <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.displayName} />
                <AvatarFallback>{getInitials(profile?.displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <div className={styles.avatarActions}>
              <div className={styles.uploadActions}>
                <Button type="button" variant="primary" onClick={handleAvatarUpload}>
                  <Upload size={16} />
                  Upload new picture
                </Button>
                {profile?.avatarUrl && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className={styles.deleteButton}
                    onClick={handleAvatarDelete}
                  >
                    <Trash2 size={16} />
                    Remove picture
                  </Button>
                )}
              </div>
              <p className={styles.avatarHint}>
                Upload a square image for best results. Supported formats: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.fieldsContainer}>
            <div className={styles.field}>
              <label htmlFor="displayName">Display Name</label>
              <Controller
                name="displayName"
                control={control}
                render={({ field }) => <Input id="displayName" {...field} />}
              />
              {errors.displayName && <p className={styles.fieldError}>{errors.displayName.message}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input id="email" type="email" {...field} disabled />}
              />
              {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
              <p className={styles.fieldHint}>Your email address cannot be changed.</p>
            </div>

            <div className={styles.field}>
              <label htmlFor="bio">Bio</label>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => <Textarea id="bio" placeholder="Tell us about yourself" {...field} />}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Contact Information</h3>
          <div className={styles.fieldsContainer}>
            <div className={styles.field}>
              <label htmlFor="phone">Phone Number</label>
              <div className={styles.phoneContainer}>
                <Controller
                  name="phoneCountryCode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={styles.countryCodeSelect}>
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className={styles.countryOption}>
                              <span className={styles.flag}>{country.flag}</span>
                              <span>{country.code}</span>
                              <span className={styles.countryName}>{country.country}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="Your phone number" 
                      className={styles.phoneInput}
                      {...field} 
                    />
                  )}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="location">Location</label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => <Input id="location" placeholder="Your location" {...field} />}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="timezone">Timezone</label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Password & Security */}
        <PasswordSecuritySection />

        {/* Subscription Management */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <CreditCard size={20} />
            Subscription & Billing
          </h3>
          <div className={styles.subscriptionContainer}>
            <div className={styles.subscriptionStatus}>
              <div className={styles.planInfo}>
                <div className={styles.planHeader}>
                  <h4>Current Plan</h4>
                  <Badge variant={getPlanBadgeVariant(profile?.subscriptionPlan)}>
                    {profile?.subscriptionPlan || 'Free'}
                  </Badge>
                </div>
                <div className={styles.statusInfo}>
                  <div className={styles.statusItem}>
                    <span>Status:</span>
                    <Badge variant={getStatusBadgeVariant(profile?.subscriptionStatus)}>
                      {profile?.subscriptionStatus || 'Active'}
                    </Badge>
                  </div>
                  {profile?.billingCycle && (
                    <div className={styles.statusItem}>
                      <Calendar size={16} />
                      <span>Billing: {profile.billingCycle}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.subscriptionActions}>
                <Button type="button" variant="outline">
                  <DollarSign size={16} />
                  Billing History
                </Button>
                {profile?.subscriptionPlan === 'free' || !profile?.subscriptionPlan ? (
                  <Button type="button">
                    Upgrade Plan
                  </Button>
                ) : (
                  <Button type="button" variant="outline">
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>
            
            {/* Plan Features */}
            <div className={styles.planFeatures}>
              <h5>Plan Features</h5>
              <div className={styles.featuresGrid}>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Goals</span>
                  <span className={styles.featureValue}>
                    {profile?.subscriptionPlan === 'free' || !profile?.subscriptionPlan ? '5' : 'Unlimited'}
                  </span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Shopping Lists</span>
                  <span className={styles.featureValue}>
                    {profile?.subscriptionPlan === 'free' || !profile?.subscriptionPlan ? '3' : 'Unlimited'}
                  </span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>AI Analysis</span>
                  <span className={styles.featureValue}>
                    {profile?.subscriptionPlan === 'free' || !profile?.subscriptionPlan ? 'Basic' : 'Advanced'}
                  </span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Calendar Sync</span>
                  <span className={styles.featureValue}>
                    {profile?.subscriptionPlan === 'free' || !profile?.subscriptionPlan ? '1 Calendar' : 'All Calendars'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </footer>
      </form>
    </div>
  );
};

const ProfileSettingsSkeleton = () => (
  <div className={styles.container}>
    <h2 className={styles.title}><Skeleton style={{ width: '200px', height: '28px' }} /></h2>
    <p className={styles.description}><Skeleton style={{ width: '300px', height: '20px' }} /></p>
    
    <div className={styles.form}>
      {/* Avatar Section Skeleton */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><Skeleton style={{ width: '150px', height: '24px' }} /></h3>
        <div className={styles.avatarSection}>
          <Skeleton style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)' }} />
          <div className={styles.avatarActions}>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Skeleton style={{ width: '150px', height: '40px' }} />
              <Skeleton style={{ width: '120px', height: '40px' }} />
            </div>
            <Skeleton style={{ width: '300px', height: '16px' }} />
          </div>
        </div>
      </div>
      
      {/* Fields Skeleton */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><Skeleton style={{ width: '180px', height: '24px' }} /></h3>
        <Skeleton style={{ height: '66px', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ height: '66px', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ height: '100px', marginBottom: 'var(--spacing-4)' }} />
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><Skeleton style={{ width: '200px', height: '24px' }} /></h3>
        <Skeleton style={{ height: '66px', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ height: '66px', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ height: '66px', marginBottom: 'var(--spacing-4)' }} />
      </div>
      
      {/* Subscription Skeleton */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><Skeleton style={{ width: '220px', height: '24px' }} /></h3>
        <Skeleton style={{ height: '120px', marginBottom: 'var(--spacing-4)' }} />
        <Skeleton style={{ height: '80px' }} />
      </div>
      
      <footer className={styles.footer}>
        <Skeleton style={{ width: '120px', height: '40px' }} />
      </footer>
    </div>
  </div>
);