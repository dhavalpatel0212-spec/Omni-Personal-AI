import React, { useEffect } from "react";
import * as z from "zod";
import { Form, useForm } from "./Form";
import { Button } from "./Button";
import ActionFields from "./ActionFields";
import { useUpdateGoalAction } from "../helpers/useGoalActions";
import { schema as updateActionSchemaBase } from "../endpoints/goal/action/update_POST.schema";
import type { GoalActionType } from "../endpoints/goal/actions_GET.schema";

const updateActionSchema = updateActionSchemaBase.extend({
  title: z.string().min(1, "Title is required."),
});

type EditActionFormProps = {
  goalId: number;
  action: GoalActionType;
  onSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
};

const EditActionForm: React.FC<EditActionFormProps> = ({
  goalId,
  action,
  onSuccess,
  onCancel,
  isOpen,
}) => {
  const updateActionMutation = useUpdateGoalAction(goalId);

  const form = useForm({
    schema: updateActionSchema,
    defaultValues: {
      actionId: action.id,
      title: action.title,
      description: action.description,
      priority: action.priority,
      isCompleted: action.isCompleted,
      dueDate: action.dueDate ? action.dueDate.toISOString() : null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setValues({
        actionId: action.id,
        title: action.title,
        description: action.description,
        priority: action.priority,
        isCompleted: action.isCompleted,
        dueDate: action.dueDate ? action.dueDate.toISOString() : null,
      });
    }
  }, [isOpen, action, form.setValues]);

  const onSubmit = (values: z.infer<typeof updateActionSchema>) => {
    updateActionMutation.mutate(values, {
      onSuccess: onSuccess,
    });
  };

  return (
    <Form {...form}>
      <form
        id="action-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <ActionFields
          values={form.values}
          setValues={form.setValues}
          isEditMode={true}
        />
      </form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
        <Button variant="ghost" onClick={onCancel} disabled={updateActionMutation.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="action-form"
          disabled={updateActionMutation.isPending}
        >
          {updateActionMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Form>
  );
};

export default EditActionForm;