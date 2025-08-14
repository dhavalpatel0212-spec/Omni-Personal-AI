import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./Dialog";
import AddActionForm from "./AddActionForm";
import EditActionForm from "./EditActionForm";
import type { GoalActionType } from "../endpoints/goal/actions_GET.schema";

type ActionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  goalId: number;
  action?: GoalActionType;
};

const ActionDialog: React.FC<ActionDialogProps> = ({
  isOpen,
  onOpenChange,
  goalId,
  action,
}) => {
  const isEditMode = !!action;

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Action" : "Add New Action"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of this action." : "Add a new action to your goal."}
          </DialogDescription>
        </DialogHeader>

        {isEditMode && action ? (
          <EditActionForm
            goalId={goalId}
            action={action}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isOpen={isOpen}
          />
        ) : (
          <AddActionForm
            goalId={goalId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isOpen={isOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActionDialog;