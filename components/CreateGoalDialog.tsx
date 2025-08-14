import React, { useState } from "react";
import * as z from "zod";
import { toUtcStartOfDay, formatUtcDate } from "../helpers/dateUtils";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { useCreateGoal } from "../helpers/useGoals";
import { useCreateGoalFromText } from "../helpers/useAI";
import { schema as createGoalSchema } from "../endpoints/goals_POST.schema";
import { schema as createGoalFromTextSchema } from "../endpoints/ai/create_goal_from_text_POST.schema";
import { GoalPriority, GoalPriorityArrayValues } from "../helpers/schema";

type CreateGoalDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("manual");
  const createGoalMutation = useCreateGoal();
  const createGoalFromTextMutation = useCreateGoalFromText();

  const manualForm = useForm({
    schema: createGoalSchema,
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
    },
  });

  const aiForm = useForm({
    schema: createGoalFromTextSchema,
    defaultValues: {
      text: "",
    },
  });

  const onManualSubmit = (values: z.infer<typeof createGoalSchema>) => {
    const submitValues = {
      ...values,
      dueDate: values.dueDate ? toUtcStartOfDay(values.dueDate) : null,
    };
    createGoalMutation.mutate(submitValues, {
      onSuccess: () => {
        manualForm.setValues({
          title: "",
          description: "",
          priority: "medium",
          dueDate: null,
        });
        onOpenChange(false);
      },
    });
  };

  const onAiSubmit = (values: z.infer<typeof createGoalFromTextSchema>) => {
    createGoalFromTextMutation.mutate(values, {
      onSuccess: (aiResult) => {
        // Chain the AI result with actual goal creation
        createGoalMutation.mutate({
          title: aiResult.title,
          description: aiResult.description || undefined,
          priority: aiResult.priority || undefined,
          dueDate: aiResult.dueDate ? toUtcStartOfDay(new Date(aiResult.dueDate)) : undefined,
        }, {
          onSuccess: () => {
            aiForm.setValues({
              text: "",
            });
            onOpenChange(false);
          },
        });
      },
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset forms when closing
      manualForm.setValues({
        title: "",
        description: "",
        priority: "medium",
        dueDate: null,
      });
      aiForm.setValues({
        text: "",
      });
      setActiveTab("manual");
    }
    onOpenChange(open);
  };

  const isLoading = createGoalMutation.isPending || createGoalFromTextMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
          <DialogDescription>
            Define your new objective using manual form or describe it in natural language.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles style={{ marginRight: 'var(--spacing-2)', height: '1rem', width: '1rem' }} />
              Natural Language
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Form {...manualForm}>
              <form
                id="create-goal-manual-form"
                onSubmit={manualForm.handleSubmit(onManualSubmit)}
                className="space-y-4"
              >
                <FormItem name="title">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Learn React for 2 months"
                      value={manualForm.values.title}
                      onChange={(e) =>
                        manualForm.setValues((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="description">
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about your goal..."
                      value={manualForm.values.description || ""}
                      onChange={(e) =>
                        manualForm.setValues((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
                  <FormItem name="priority" style={{ flex: 1 }}>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={manualForm.values.priority}
                      onValueChange={(value) =>
                        manualForm.setValues((prev) => ({ ...prev, priority: value as GoalPriority }))
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
                            {manualForm.values.dueDate ? (
                              formatUtcDate(manualForm.values.dueDate)
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent removeBackgroundAndPadding style={{ width: "auto" }}>
                        <Calendar
                          mode="single"
                          selected={manualForm.values.dueDate || undefined}
                          onSelect={(date) =>
                            manualForm.setValues((prev) => ({ ...prev, dueDate: date ? toUtcStartOfDay(date) : null }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="ai">
            <Form {...aiForm}>
              <form
                id="create-goal-ai-form"
                onSubmit={aiForm.handleSubmit(onAiSubmit)}
                className="space-y-4"
              >
                <FormItem name="text">
                  <FormLabel>Describe Your Goal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I want to learn React and build a personal project within the next 3 months because I want to switch to a frontend development role"
                      value={aiForm.values.text}
                      onChange={(e) =>
                        aiForm.setValues((prev) => ({ ...prev, text: e.target.value }))
                      }
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--muted-foreground)', 
                    marginTop: 'var(--spacing-2)' 
                  }}>
                    Describe your goal in natural language. AI will automatically extract the title, description, priority, and due date.
                  </p>
                </FormItem>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleDialogClose(false)} disabled={isLoading}>
            Cancel
          </Button>
          {activeTab === "manual" ? (
            <Button
              type="submit"
              form="create-goal-manual-form"
              disabled={isLoading}
            >
              {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          ) : (
            <Button
              type="submit"
              form="create-goal-ai-form"
              disabled={isLoading}
            >
              <Sparkles style={{ marginRight: 'var(--spacing-2)', height: '1rem', width: '1rem' }} />
              {createGoalFromTextMutation.isPending ? "Creating with AI..." : "Create with AI"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};