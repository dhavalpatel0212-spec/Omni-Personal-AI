import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '../helpers/useSettings';
import { Button } from './Button';
import { Switch } from './Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Skeleton } from './Skeleton';
import styles from './NotificationSettings.module.css';

const notificationSettingsSchema = z.object({
  pushNotifications: z.boolean(),
  emailNotifications: z.boolean(),
  calendarNotifications: z.boolean(),
  goalReminders: z.boolean(),
  shoppingReminders: z.boolean(),
  travelNotifications: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
  }),
  notificationFrequency: z.string(),
});

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export const NotificationSettings = ({ className }: { className?: string }) => {
  const { notificationSettingsQuery, updateNotificationSettings } = useSettings();
  const { data: settings, isFetching, error } = notificationSettingsQuery;

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty, isSubmitting },
    reset,
  } = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    values: {
      pushNotifications: settings?.pushNotifications ?? true,
      emailNotifications: settings?.emailNotifications ?? true,
      calendarNotifications: settings?.calendarNotifications ?? true,
      goalReminders: settings?.goalReminders ?? true,
      shoppingReminders: settings?.shoppingReminders ?? true,
      travelNotifications: settings?.travelNotifications ?? true,
      quietHours: {
        enabled: settings?.quietHours.enabled ?? false,
        start: settings?.quietHours.start ?? '22:00',
        end: settings?.quietHours.end ?? '08:00',
      },
      notificationFrequency: settings?.notificationFrequency ?? 'as_it_happens',
    },
  });

  React.useEffect(() => {
    if (settings) {
      reset({
        ...settings,
        notificationFrequency: settings.notificationFrequency || 'as_it_happens',
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: NotificationSettingsFormData) => {
    console.log('Updating notification settings:', data);
    // updateNotificationSettings.mutate(data);
  };

  const quietHoursEnabled = watch('quietHours.enabled');

  if (isFetching) {
    return <NotificationSettingsSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Error loading notification settings: {error.message}</div>;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h2 className={styles.title}>Notifications</h2>
      <p className={styles.description}>Manage how you receive notifications.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Channels</h3>
          <div className={styles.switchItem}>
            <div>
              <label htmlFor="pushNotifications">Push Notifications</label>
              <p>Receive push notifications on your devices.</p>
            </div>
            <Controller name="pushNotifications" control={control} render={({ field }) => <Switch id="pushNotifications" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          <div className={styles.switchItem}>
            <div>
              <label htmlFor="emailNotifications">Email Notifications</label>
              <p>Receive email summaries and alerts.</p>
            </div>
            <Controller name="emailNotifications" control={control} render={({ field }) => <Switch id="emailNotifications" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Reminders</h3>
          <div className={styles.switchItem}>
            <div><label htmlFor="goalReminders">Goal Reminders</label></div>
            <Controller name="goalReminders" control={control} render={({ field }) => <Switch id="goalReminders" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          <div className={styles.switchItem}>
            <div><label htmlFor="shoppingReminders">Shopping Reminders</label></div>
            <Controller name="shoppingReminders" control={control} render={({ field }) => <Switch id="shoppingReminders" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          <div className={styles.switchItem}>
            <div><label htmlFor="travelNotifications">Travel Notifications</label></div>
            <Controller name="travelNotifications" control={control} render={({ field }) => <Switch id="travelNotifications" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          <div className={styles.switchItem}>
            <div><label htmlFor="calendarNotifications">Calendar Notifications</label></div>
            <Controller name="calendarNotifications" control={control} render={({ field }) => <Switch id="calendarNotifications" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Quiet Hours</h3>
          <div className={styles.switchItem}>
            <div>
              <label htmlFor="quietHoursEnabled">Enable Quiet Hours</label>
              <p>Mute notifications during specific times.</p>
            </div>
            <Controller name="quietHours.enabled" control={control} render={({ field }) => <Switch id="quietHoursEnabled" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          {quietHoursEnabled && (
            <div className={styles.timePickerGrid}>
              <div className={styles.field}>
                <label htmlFor="quietHoursStart">Start Time</label>
                <Controller name="quietHours.start" control={control} render={({ field }) => <input type="time" id="quietHoursStart" className={styles.timeInput} {...field} />} />
              </div>
              <div className={styles.field}>
                <label htmlFor="quietHoursEnd">End Time</label>
                <Controller name="quietHours.end" control={control} render={({ field }) => <input type="time" id="quietHoursEnd" className={styles.timeInput} {...field} />} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Frequency</h3>
          <div className={styles.field}>
            <label htmlFor="notificationFrequency">Notification Frequency</label>
            <Controller
              name="notificationFrequency"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="notificationFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="as_it_happens">As it happens</SelectItem>
                    <SelectItem value="daily_summary">Daily Summary</SelectItem>
                    <SelectItem value="weekly_summary">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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

const NotificationSettingsSkeleton = () => (
  <div className={styles.container}>
    <h2 className={styles.title}><Skeleton style={{ width: '200px', height: '28px' }} /></h2>
    <p className={styles.description}><Skeleton style={{ width: '300px', height: '20px' }} /></p>
    <div className={styles.form}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={styles.section}>
          <h3 className={styles.sectionTitle}><Skeleton style={{ width: '120px', height: '24px' }} /></h3>
          <div className={styles.switchItem}>
            <div style={{ flex: 1 }}><Skeleton style={{ width: '80%', height: '40px' }} /></div>
            <Skeleton style={{ width: '42px', height: '24px' }} />
          </div>
          <div className={styles.switchItem}>
            <div style={{ flex: 1 }}><Skeleton style={{ width: '70%', height: '40px' }} /></div>
            <Skeleton style={{ width: '42px', height: '24px' }} />
          </div>
        </div>
      ))}
      <footer className={styles.footer}>
        <Skeleton style={{ width: '120px', height: '40px' }} />
      </footer>
    </div>
  </div>
);