import React, { useState } from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import styles from "./PasswordResetRequestForm.module.css";
import {
  schema,
  postPasswordResetRequest,
} from "../endpoints/auth/password_reset_request_POST.schema";

export type PasswordResetRequestFormData = z.infer<typeof schema>;

interface PasswordResetRequestFormProps {
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PasswordResetRequestForm: React.FC<PasswordResetRequestFormProps> = ({
  className,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    schema,
  });

  const handleSubmit = async (data: PasswordResetRequestFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await postPasswordResetRequest(data);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.successMessage}>
          <h3 className={styles.successTitle}>Check Your Email</h3>
          <p className={styles.successText}>
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </p>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className={styles.backButton}>
              Back to Login
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Reset Your Password</h3>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={styles.form}
        >
          {error && <div className={styles.errorMessage}>{error}</div>}

          <FormItem name="email">
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input
                placeholder="your@email.com"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                value={form.values.email}
                onChange={(e) =>
                  form.setValues((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <div className={styles.buttonGroup}>
            <Button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <span className={styles.loadingText}>
                  <Spinner className={styles.spinner} size="sm" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};