import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog';
import { Button } from './Button';
import { CalendarEventForm, CalendarEventFormValues } from './CalendarEventForm';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';

interface CalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Selectable<CalendarEvents> | null;
  onSubmit: (values: CalendarEventFormValues) => void;
  isSubmitting: boolean;
}

export const CalendarEventDialog = ({
  open,
  onOpenChange,
  event,
  onSubmit,
  isSubmitting,
}: CalendarEventDialogProps) => {
  const isEditing = !!event;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your event.' : 'Fill in the details to create a new calendar event.'}
          </DialogDescription>
        </DialogHeader>
        
        <CalendarEventForm
          id="event-form"
          initialData={event}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button type="submit" form="event-form" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Event')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};