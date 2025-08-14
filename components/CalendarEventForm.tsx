import React from 'react';
import { z } from 'zod';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Button } from './Button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './Calendar';
import { format } from 'date-fns';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';
import { calendarEventSchema, CalendarEventFormValues } from '../helpers/calendarEventSchema';
import styles from './CalendarEventForm.module.css';

// Form-specific schema that handles string input for attendees
const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  startTime: z.date({ required_error: 'Start date and time are required.' }),
  endTime: z.date({ required_error: 'End date and time are required.' }),
  location: z.string().optional(),
  attendees: z.string().optional(),
}).refine(data => data.endTime >= data.startTime, {
  message: 'End time must be after start time.',
  path: ['endTime'],
});

type FormValues = z.infer<typeof eventFormSchema>;

interface CalendarEventFormProps {
  id: string;
  initialData?: Selectable<CalendarEvents> | null;
  onSubmit: (values: CalendarEventFormValues) => void;
  isSubmitting: boolean;
}

export type { CalendarEventFormValues };

export const CalendarEventForm = ({ id, initialData, onSubmit, isSubmitting }: CalendarEventFormProps) => {
  const form = useForm({
    schema: eventFormSchema,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      startTime: initialData?.startTime ? new Date(initialData.startTime) : new Date(),
      endTime: initialData?.endTime ? new Date(initialData.endTime) : new Date(new Date().getTime() + 60 * 60 * 1000),
      location: initialData?.location || '',
      attendees: Array.isArray(initialData?.attendees) ? initialData.attendees.join(', ') : '',
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    // Transform form values to match the expected schema
    const transformedValues: CalendarEventFormValues = {
      ...values,
      attendees: values.attendees 
        ? values.attendees.split(',').map(email => email.trim()).filter(email => z.string().email().safeParse(email).success)
        : [],
    };
    onSubmit(transformedValues);
  };

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(handleFormSubmit)} className={styles.form}>
        <FormItem name="title">
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Team Meeting"
              value={form.values.title}
              onChange={e => form.setValues(prev => ({ ...prev, title: e.target.value }))}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className={styles.dateTimeRow}>
          <FormItem name="startTime" className={styles.dateTimeItem}>
            <FormLabel>Start Time</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={styles.dateButton} disabled={isSubmitting}>
                    <CalendarIcon size={16} />
                    {form.values.startTime ? format(form.values.startTime, 'PPP p') : <span>Pick a date</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent removeBackgroundAndPadding>
                <Calendar
                  mode="single"
                  selected={form.values.startTime}
                  onSelect={date => form.setValues(prev => ({ ...prev, startTime: date || new Date() }))}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>

          <FormItem name="endTime" className={styles.dateTimeItem}>
            <FormLabel>End Time</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={styles.dateButton} disabled={isSubmitting}>
                    <CalendarIcon size={16} />
                    {form.values.endTime ? format(form.values.endTime, 'PPP p') : <span>Pick a date</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent removeBackgroundAndPadding>
                <Calendar
                  mode="single"
                  selected={form.values.endTime}
                  onSelect={date => form.setValues(prev => ({ ...prev, endTime: date || new Date() }))}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </div>

        <FormItem name="description">
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add details about the event..."
              value={form.values.description}
              onChange={e => form.setValues(prev => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="location">
          <FormLabel>Location</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Conference Room 4"
              value={form.values.location}
              onChange={e => form.setValues(prev => ({ ...prev, location: e.target.value }))}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="attendees">
          <FormLabel>Attendees</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., user1@example.com, user2@example.com"
              value={form.values.attendees}
              onChange={e => form.setValues(prev => ({ ...prev, attendees: e.target.value }))}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormDescription>Enter comma-separated email addresses.</FormDescription>
          <FormMessage />
        </FormItem>
      </form>
    </Form>
  );
};