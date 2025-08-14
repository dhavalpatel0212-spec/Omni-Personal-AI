import React from "react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Checkbox } from "./Checkbox";
import { Calendar as CalendarIcon } from "lucide-react";
import { ActionPriority, ActionPriorityArrayValues } from "../helpers/schema";

type ActionFieldsProps = {
  values: {
    title: string;
    description?: string | null;
    priority?: ActionPriority | null;
    dueDate?: string | null;
    isCompleted?: boolean;
  };
  setValues: (updater: (prev: any) => any) => void;
  isEditMode: boolean;
};

const ActionFields: React.FC<ActionFieldsProps> = ({
  values,
  setValues,
  isEditMode,
}) => {
  return (
    <>
      <FormItem name="title">
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input
            value={values.title || ""}
            onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Draft project proposal"
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem name="description">
        <FormLabel>Description (Optional)</FormLabel>
        <FormControl>
          <Textarea
            value={values.description || ""}
            onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Add more details about this action..."
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-end' }}>
        <FormItem name="priority" style={{ flex: 1 }}>
          <FormLabel>Priority</FormLabel>
          <Select
            value={values.priority || 'medium'}
            onValueChange={(value) => setValues((prev) => ({ ...prev, priority: value as ActionPriority }))}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {ActionPriorityArrayValues.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>

        <FormItem name="dueDate" style={{ flex: 1 }}>
          <FormLabel>Due Date (Optional)</FormLabel>
          <Popover>
            <FormControl>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  style={{ width: '100%', justifyContent: 'flex-start', fontWeight: 400 }}
                >
                  <CalendarIcon style={{ marginRight: 'var(--spacing-2)', height: '1rem', width: '1rem' }} />
                  {values.dueDate ? new Date(values.dueDate).toLocaleDateString() : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent removeBackgroundAndPadding style={{ width: "auto" }}>
              <Calendar
                mode="single"
                selected={values.dueDate ? new Date(values.dueDate) : undefined}
                onSelect={(date) => setValues((prev) => ({ 
                  ...prev, 
                  dueDate: date ? date.toISOString() : null 
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      </div>

      {isEditMode && (
        <FormItem name="isCompleted">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <FormControl>
              <Checkbox
                id="isCompleted"
                checked={values.isCompleted || false}
                onChange={(e) => setValues((prev) => ({ 
                  ...prev, 
                  isCompleted: e.target.checked 
                }))}
              />
            </FormControl>
            <FormLabel htmlFor="isCompleted" style={{ marginBottom: 0 }}>Mark as completed</FormLabel>
          </div>
          <FormMessage />
        </FormItem>
      )}
    </>
  );
};

export default ActionFields;