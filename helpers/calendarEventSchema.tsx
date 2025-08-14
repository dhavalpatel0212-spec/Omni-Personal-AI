import { z } from 'zod';

export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  startTime: z.date({ required_error: 'Start date and time are required.' }),
  endTime: z.date({ required_error: 'End date and time are required.' }),
  location: z.string().optional(),
  attendees: z.array(z.string().email()).default([]),
}).refine(data => data.endTime >= data.startTime, {
  message: 'End time must be after start time.',
  path: ['endTime'],
});

export type CalendarEventFormValues = z.infer<typeof calendarEventSchema>;