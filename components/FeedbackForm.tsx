import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Button } from './Button';
import { FileDropzone } from './FileDropzone';
import { Badge } from './Badge';
import { X, Paperclip, Send, Loader2 } from 'lucide-react';
import { useSubmitFeedback } from '../helpers/useSubmitFeedback';
import { schema as feedbackSchema } from '../endpoints/feedback/submit_POST.schema';
import { toast } from 'sonner';
import styles from './FeedbackForm.module.css';

const issueTypes = ["bug_report", "feature_request", "general_feedback", "account_issue", "performance_issue", "other"] as const;
const priorities = ["low", "medium", "high", "critical"] as const;
const categories = ["goals", "shopping", "travel", "chat", "calendar", "profile", "settings", "other"] as const;

const formSchema = feedbackSchema.extend({
    files: z.array(z.instanceof(File)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_FORM_VALUES: FormValues = {
    issueType: 'bug_report',
    subject: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    priority: 'medium',
    category: 'other',
    contactPreference: true,
    files: undefined,
};

export const FeedbackForm = ({ className }: { className?: string }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [deviceInfo, setDeviceInfo] = useState('');

    const submitFeedbackMutation = useSubmitFeedback();

    const form = useForm({
        schema: formSchema,
        defaultValues: DEFAULT_FORM_VALUES,
    });

    useEffect(() => {
        const info = `User Agent: ${navigator.userAgent}\nPlatform: ${navigator.platform}\nScreen: ${window.screen.width}x${window.screen.height}`;
        setDeviceInfo(info);
    }, []);

    const handleFileSelect = (selectedFiles: File[]) => {
        const newFiles = [...files, ...selectedFiles].slice(0, 5); // Limit to 5 files
        setFiles(newFiles);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const onSubmit = (values: FormValues) => {
        const formData = new FormData();
        
        // Append all form fields to FormData
        Object.entries(values).forEach(([key, value]) => {
            if (key !== 'files' && value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        formData.append('deviceInfo', deviceInfo);
        files.forEach(file => {
            formData.append('files', file);
        });

        submitFeedbackMutation.mutate(formData, {
            onSuccess: (data) => {
                toast.success(`Feedback submitted! Ticket ID: ${data.ticketId}`);
                form.setValues(DEFAULT_FORM_VALUES);
                setFiles([]);
            },
            onError: (error) => {
                toast.error(error instanceof Error ? error.message : 'Failed to submit feedback.');
            }
        });
    };

    const issueType = form.values.issueType;
    const isBugReport = issueType === 'bug_report' || issueType === 'performance_issue';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`${styles.form} ${className || ''}`}>
                <div className={styles.grid}>
                    <FormItem name="issueType" className={styles.gridSpan2}>
                        <FormLabel>Issue Type</FormLabel>
                        <FormControl>
                            <Select value={form.values.issueType} onValueChange={(value) => form.setValues(prev => ({ ...prev, issueType: value as FormValues['issueType'] }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the type of issue" />
                                </SelectTrigger>
                                <SelectContent>
                                    {issueTypes.map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>

                    <FormItem name="subject" className={styles.gridSpan2}>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Unable to add new goal"
                                value={form.values.subject}
                                onChange={(e) => form.setValues(prev => ({ ...prev, subject: e.target.value }))}
                                maxLength={100}
                            />
                        </FormControl>
                        <FormDescription>{100 - (form.values.subject?.length || 0)} characters remaining</FormDescription>
                        <FormMessage />
                    </FormItem>

                    <FormItem name="description" className={styles.gridSpan2}>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Please provide a detailed description of the issue or your feedback."
                                value={form.values.description}
                                onChange={(e) => form.setValues(prev => ({ ...prev, description: e.target.value }))}
                                rows={6}
                                maxLength={2000}
                            />
                        </FormControl>
                        <FormDescription>{2000 - (form.values.description?.length || 0)} characters remaining</FormDescription>
                        <FormMessage />
                    </FormItem>

                    {isBugReport && (
                        <>
                            <FormItem name="stepsToReproduce" className={styles.gridSpan2}>
                                <FormLabel>Steps to Reproduce</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="1. Go to '...'\n2. Click on '...'\n3. Scroll down to '...'\n4. See error"
                                        value={form.values.stepsToReproduce || ''}
                                        onChange={(e) => form.setValues(prev => ({ ...prev, stepsToReproduce: e.target.value }))}
                                        rows={4}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            <FormItem name="expectedBehavior">
                                <FormLabel>Expected Behavior</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="What you expected to happen."
                                        value={form.values.expectedBehavior || ''}
                                        onChange={(e) => form.setValues(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            <FormItem name="actualBehavior">
                                <FormLabel>Actual Behavior</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="What actually happened."
                                        value={form.values.actualBehavior || ''}
                                        onChange={(e) => form.setValues(prev => ({ ...prev, actualBehavior: e.target.value }))}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </>
                    )}

                    <FormItem name="priority">
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                            <Select value={form.values.priority} onValueChange={(value) => form.setValues(prev => ({ ...prev, priority: value as FormValues['priority'] }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>

                    <FormItem name="category">
                        <FormLabel>App Area</FormLabel>
                        <FormControl>
                            <Select value={form.values.category} onValueChange={(value) => form.setValues(prev => ({ ...prev, category: value as FormValues['category'] }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select area" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>

                    <div className={styles.gridSpan2}>
                        <div className={styles.sectionLabel}>Attachments (Optional)</div>
                        <FileDropzone
                            onFilesSelected={handleFileSelect}
                            maxFiles={5}
                            maxSize={5 * 1024 * 1024} // 5MB
                            accept="image/png, image/jpeg, image/gif, video/mp4"
                            title="Drag & drop files or click to browse"
                            subtitle="Max 5 files, 5MB each. (PNG, JPG, GIF, MP4)"
                        />
                        {files.length > 0 && (
                            <div className={styles.fileList}>
                                {files.map((file, index) => (
                                    <Badge key={index} variant="outline" className={styles.fileBadge}>
                                        <Paperclip size={14} />
                                        <span>{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => removeFile(index)}
                                            className={styles.removeFileButton}
                                        >
                                            <X size={14} />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button type="submit" disabled={submitFeedbackMutation.isPending}>
                        {submitFeedbackMutation.isPending ? (
                            <Loader2 className={styles.spinner} size={18} />
                        ) : (
                            <Send size={16} />
                        )}
                        Submit Feedback
                    </Button>
                </div>
            </form>
        </Form>
    );
};