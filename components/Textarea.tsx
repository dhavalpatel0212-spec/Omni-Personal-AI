import React, { forwardRef, TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  disableResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disableResize, ...props }, ref) => {
    const textareaClassName = `${styles.textarea} ${
      disableResize ? styles.noResize : ""
    } ${className || ""}`;

    return (
      <textarea
        ref={ref}
        className={textareaClassName}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";