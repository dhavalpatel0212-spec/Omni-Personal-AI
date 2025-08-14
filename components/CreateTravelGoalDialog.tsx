import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Form, FormItem, FormLabel, FormControl, FormMessage, useForm } from './Form';
import { useCreateTravelGoal } from '../helpers/useTravel';
import { TravelGoalPriorityArrayValues } from '../helpers/schema';
import { Calendar } from './Calendar';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { CalendarIcon } from 'lucide-react';
import { z } from 'zod';

const createTravelGoalSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  description: z.string().optional(),
  budget: z.number().min(1, 'Budget must be at least £1'),
  targetDate: z.date({ required_error: 'Target date is required' }),
  travelers: z.number().int().min(1, 'At least 1 traveler is required'),
  priority: z.enum(TravelGoalPriorityArrayValues),
});

interface CreateTravelGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTravelGoalDialog: React.FC<CreateTravelGoalDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const createTravelGoalMutation = useCreateTravelGoal();

  const form = useForm({
    defaultValues: {
      destination: '',
      description: '',
      budget: 1000,
      targetDate: new Date(),
      travelers: 2,
      priority: 'medium' as const,
    },
    schema: createTravelGoalSchema,
  });

  const onSubmit = (data: z.infer<typeof createTravelGoalSchema>) => {
    createTravelGoalMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.setValues({
          destination: '',
          description: '',
          budget: 1000,
          targetDate: new Date(),
          travelers: 2,
          priority: 'medium',
        });
      },
    });
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Travel Goal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <FormItem name="destination">
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input
                  placeholder="Where do you want to go?"
                  value={form.values.destination}
                  onChange={(e) => form.setValues(prev => ({ ...prev, destination: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="description">
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your travel plans..."
                  value={form.values.description}
                  onChange={(e) => form.setValues(prev => ({ ...prev, description: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <FormItem name="budget">
                <FormLabel>Budget (£)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    value={form.values.budget}
                    onChange={(e) => form.setValues(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem name="travelers">
                <FormLabel>Travelers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    value={form.values.travelers}
                    onChange={(e) => form.setValues(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <FormItem name="targetDate">
                <FormLabel>Target Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" style={{ justifyContent: 'flex-start' }}>
                        <CalendarIcon size={16} />
                        {formatDate(form.values.targetDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent removeBackgroundAndPadding>
                      <Calendar
                        mode="single"
                        selected={form.values.targetDate}
                        onSelect={(date) => date && form.setValues(prev => ({ ...prev, targetDate: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem name="priority">
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Select
                    value={form.values.priority}
                    onValueChange={(value) => form.setValues(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TravelGoalPriorityArrayValues.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTravelGoalMutation.isPending}>
                {createTravelGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};