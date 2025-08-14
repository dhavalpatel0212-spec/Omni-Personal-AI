import React, { useEffect } from "react";
import * as z from "zod";
import { Form, useForm } from "./Form";
import { Button } from "./Button";
import ActionFields from "./ActionFields";
import { useAddGoalAction } from "../helpers/useGoalActions";
import { schema as addActionSchema } from "../endpoints/goal/actions_POST.schema";
import { ActionPriority } from "../helpers/schema";

type AddActionFormProps = {
  goalId: number;
  onSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
};

const AddActionForm: React.FC<AddActionFormProps> = ({
  goalId,
  onSuccess,
  onCancel,
  isOpen,
}) => {
  const addActionMutation = useAddGoalAction();

  const form = useForm({
    schema: addActionSchema,
    defaultValues: {
      goalId: goalId,
      title: "",
      description: null,
      priority: "medium" as ActionPriority,
      dueDate: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setValues({
        goalId: goalId,
        title: "",
        description: null,
        priority: "medium" as ActionPriority,
        dueDate: null,
      });
    }
  }, [isOpen, goalId, form.setValues]);

  const onSubmit = (values: z.infer<typeof addActionSchema>) => {
    addActionMutation.mutate(values, {
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
          isEditMode={false}
        />
      </form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
        <Button variant="ghost" onClick={onCancel} disabled={addActionMutation.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="action-form"
          disabled={addActionMutation.isPending}
        >
          {addActionMutation.isPending ? "Saving..." : "Add Action"}
        </Button>
      </div>
    </Form>
  );
};

export default AddActionForm;