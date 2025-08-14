import React from "react";
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
import { useCreateStandaloneAction } from "../helpers/useStandaloneActions";
import { schema as createActionSchema, type InputType } from "../endpoints/actions_POST.schema";
import ActionFields from "./ActionFields";

type CreateStandaloneActionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export const CreateStandaloneActionDialog: React.FC<CreateStandaloneActionDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const createActionMutation = useCreateStandaloneAction();

  // Create a form schema that matches ActionFields expectations (string dates)
  const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
    description: z.string().max(1000, "Description must be 1000 characters or less").optional().nullable(),
    priority: z.enum(["high", "medium", "low"]).optional().nullable(),
    dueDate: z.string().optional().nullable(),
  });

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      title: "",
      description: null,
      priority: "medium",
      dueDate: null,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert form values to API format (string dates to Date objects)
    const apiValues: InputType = {
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate) : null,
    };

    createActionMutation.mutate(apiValues, {
      onSuccess: () => {
        form.setValues({
          title: "",
          description: null,
          priority: "medium",
          dueDate: null,
        });
        onOpenChange(false);
      },
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      form.setValues({
        title: "",
        description: null,
        priority: "medium",
        dueDate: null,
      });
    }
    onOpenChange(open);
  };

  const isLoading = createActionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Action</DialogTitle>
          <DialogDescription>
            Add a new standalone task to your to-do list.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-action-form"
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
          >
            <ActionFields
              values={form.values}
              setValues={form.setValues}
              isEditMode={false}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleDialogClose(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-action-form"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};