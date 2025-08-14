import React, { useEffect } from "react";
import * as z from "zod";
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
  useForm,
} from "./Form";
import { Button } from "./Button";
import { useUpdateStandaloneAction } from "../helpers/useStandaloneActions";
import { schema as updateActionSchema, type InputType as UpdateActionInputType } from "../endpoints/action/update_POST.schema";
import ActionFields from "./ActionFields";
import type { Selectable } from "kysely";
import type { StandaloneActions, ActionPriority } from "../helpers/schema";

type EditStandaloneActionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  action: Selectable<StandaloneActions>;
};

// Form schema for the UI, using string for date for compatibility with ActionFields
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional().nullable(),
  priority: z.enum(["high", "medium", "low"]).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const EditStandaloneActionDialog: React.FC<EditStandaloneActionDialogProps> = ({
  isOpen,
  onOpenChange,
  action,
}) => {
  const updateActionMutation = useUpdateStandaloneAction();

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      title: action.title,
      description: action.description,
      priority: action.priority,
      dueDate: action.dueDate ? new Date(action.dueDate).toISOString() : null,
      isCompleted: action.isCompleted ?? false,
    },
  });

  // Reset form if the action prop changes
  useEffect(() => {
    form.setValues({
      title: action.title,
      description: action.description,
      priority: action.priority,
      dueDate: action.dueDate ? new Date(action.dueDate).toISOString() : null,
      isCompleted: action.isCompleted ?? false,
    });
  }, [action, form.setValues]);


  const onSubmit = (values: FormValues) => {
    const apiValues: UpdateActionInputType = {
      actionId: action.id,
      title: values.title,
      description: values.description,
      priority: values.priority as ActionPriority,
      dueDate: values.dueDate ? new Date(values.dueDate) : null,
      isCompleted: values.isCompleted,
    };

    updateActionMutation.mutate(apiValues, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const isLoading = updateActionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Action</DialogTitle>
          <DialogDescription>
            Update the details of your action.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="edit-action-form"
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
          >
            <ActionFields
              values={form.values}
              setValues={form.setValues}
              isEditMode={true}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-action-form"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};