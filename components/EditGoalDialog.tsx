import React from "react";
import * as z from "zod";
import { toUtcStartOfDay, parseUtcDateString, formatUtcDate } from "../helpers/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Calendar } from "./Calendar";
import { Slider } from "./Slider";
import { Calendar as CalendarIcon } from "lucide-react";
import { useUpdateGoal } from "../helpers/useGoals";
import { schema as updateGoalSchema } from "../endpoints/goals/update_POST.schema";
import { GoalPriority, GoalStatus, GoalPriorityArrayValues, GoalStatusArrayValues } from "../helpers/schema";
import type { Selectable } from "kysely";
import type { Goals } from "../helpers/schema";

type EditGoalDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  goal: Selectable<Goals>;
};

export const EditGoalDialog: React.FC<EditGoalDialogProps> = ({
  isOpen,
  onOpenChange,
  goal,
}) => {
  const updateGoalMutation = useUpdateGoal();

  const form = useForm({
    schema: updateGoalSchema,
    defaultValues: {
      goalId: goal.id,
      title: goal.title,
      description: goal.description,
      priority: goal.priority ?? "medium",
      status: goal.status ?? "not_started",
      progress: goal.progress ?? 0,
      dueDate: parseUtcDateString(goal.dueDate),
    },
  });

  const onSubmit = (values: z.infer<typeof updateGoalSchema>) => {
    const submitValues = {
      ...values,
      dueDate: values.dueDate ? toUtcStartOfDay(values.dueDate) : null,
    };
    updateGoalMutation.mutate(submitValues, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update the details of your goal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="edit-goal-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormItem name="title">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  value={form.values.title}
                  onChange={(e) =>
                    form.setValues((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="description">
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  value={form.values.description || ""}
                  onChange={(e) =>
                    form.setValues((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="progress">
              <FormLabel>Progress: {form.values.progress}%</FormLabel>
              <FormControl>
                <Slider
                  value={[form.values.progress ?? 0]}
                  onValueChange={(value) =>
                    form.setValues((prev) => ({ ...prev, progress: value[0] }))
                  }
                  max={100}
                  step={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
              <FormItem name="status" style={{ flex: 1 }}>
                <FormLabel>Status</FormLabel>
                <Select
                  value={form.values.status}
                  onValueChange={(value) =>
                    form.setValues((prev) => ({ ...prev, status: value as GoalStatus }))
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GoalStatusArrayValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem name="priority" style={{ flex: 1 }}>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={form.values.priority}
                  onValueChange={(value) =>
                    form.setValues((prev) => ({ ...prev, priority: value as GoalPriority }))
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GoalPriorityArrayValues.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </div>

            <FormItem name="dueDate">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      style={{ width: '100%', justifyContent: 'flex-start', fontWeight: 400 }}
                    >
                      <CalendarIcon style={{ marginRight: 'var(--spacing-2)', height: '1rem', width: '1rem' }} />
                      {form.values.dueDate ? (
                        formatUtcDate(form.values.dueDate)
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent removeBackgroundAndPadding style={{ width: "auto" }}>
                  <Calendar
                    mode="single"
                    selected={form.values.dueDate || undefined}
                    onSelect={(date) =>
                      form.setValues((prev) => ({ ...prev, dueDate: date ? toUtcStartOfDay(date) : null }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          </form>
        </Form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={updateGoalMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-goal-form"
            disabled={updateGoalMutation.isPending}
          >
            {updateGoalMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};