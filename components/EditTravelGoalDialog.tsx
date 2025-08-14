import React from 'react';
import { z } from 'zod';
import type { Selectable } from 'kysely';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Calendar } from './Calendar';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { useUpdateTravelGoal, useDeleteTravelGoal } from '../helpers/useTravel';
import { TravelGoals, TravelGoalPriority, TravelGoalPriorityArrayValues } from '../helpers/schema';
import { schema as updateTravelGoalSchema } from '../endpoints/travel/goal/update_POST.schema';

type EditTravelGoalDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  goal: Selectable<TravelGoals>;
};

export const EditTravelGoalDialog: React.FC<EditTravelGoalDialogProps> = ({
  isOpen,
  onOpenChange,
  goal,
}) => {
  const updateTravelGoalMutation = useUpdateTravelGoal();
  const deleteTravelGoalMutation = useDeleteTravelGoal();

  const form = useForm({
    schema: updateTravelGoalSchema,
    defaultValues: {
      goalId: goal.id,
      destination: goal.destination,
      description: goal.description,
      budget: typeof goal.budget === 'string' ? parseFloat(goal.budget) : goal.budget,
      targetDate: typeof goal.targetDate === 'string' ? new Date(goal.targetDate) : goal.targetDate,
      travelers: goal.travelers,
      priority: goal.priority,
    },
  });

  const onSubmit = (values: z.infer<typeof updateTravelGoalSchema>) => {
    updateTravelGoalMutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this travel goal? This action cannot be undone.')) {
      deleteTravelGoalMutation.mutate({ goalId: goal.id }, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return 'Select date';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Travel Goal</DialogTitle>
          <DialogDescription>
            Update the details of your travel goal to {goal.destination}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="edit-travel-goal-form"
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
          >
            <FormItem name="destination">
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input
                  value={form.values.destination || ''}
                  onChange={(e) =>
                    form.setValues((prev) => ({ ...prev, destination: e.target.value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="description">
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  value={form.values.description || ''}
                  onChange={(e) =>
                    form.setValues((prev) => ({ ...prev, description: e.target.value }))
                  }
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
                    value={form.values.budget || 0}
                    onChange={(e) =>
                      form.setValues((prev) => ({ ...prev, budget: parseInt(e.target.value, 10) || 0 }))
                    }
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
                    value={form.values.travelers || 1}
                    onChange={(e) =>
                      form.setValues((prev) => ({ ...prev, travelers: parseInt(e.target.value, 10) || 1 }))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <FormItem name="targetDate">
                <FormLabel>Target Date</FormLabel>
                <Popover>
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        style={{ width: '100%', justifyContent: 'flex-start', fontWeight: 400 }}
                      >
                        <CalendarIcon style={{ marginRight: 'var(--spacing-2)', height: '1rem', width: '1rem' }} />
                        {formatDate(form.values.targetDate)}
                      </Button>
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent removeBackgroundAndPadding style={{ width: "auto" }}>
                    <Calendar
                      mode="single"
                      selected={form.values.targetDate ? new Date(form.values.targetDate) : undefined}
                      onSelect={(date) =>
                        form.setValues((prev) => ({ ...prev, targetDate: date || undefined }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>

              <FormItem name="priority">
                <FormLabel>Priority</FormLabel>
                <Select
                  value={form.values.priority}
                  onValueChange={(value) =>
                    form.setValues((prev) => ({ ...prev, priority: value as TravelGoalPriority }))
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TravelGoalPriorityArrayValues.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTravelGoalMutation.isPending || updateTravelGoalMutation.isPending}
            style={{ marginRight: 'auto' }}
          >
            <Trash2 size={16} />
            {deleteTravelGoalMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={updateTravelGoalMutation.isPending || deleteTravelGoalMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-travel-goal-form"
            disabled={updateTravelGoalMutation.isPending || deleteTravelGoalMutation.isPending}
          >
            {updateTravelGoalMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};