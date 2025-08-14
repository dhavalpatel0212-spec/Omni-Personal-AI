import React from 'react';
import styles from './MessageContent.module.css';

export interface MessageContentProps {
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
  isUser?: boolean;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  isUser = false,
}) => {
  // Handle legacy string content
  if (typeof content === 'string') {
    return <div className={styles.textContent}>{content}</div>;
  }

  // Handle array content with text and images
  return (
    <div className={styles.contentArray}>
      {content.map((part, index) => {
        if (part.type === 'text' && part.text) {
          return (
            <div key={index} className={styles.textContent}>
              {part.text}
            </div>
          );
        } else if (part.type === 'image_url' && part.image_url?.url) {
          return (
            <div key={index} className={styles.imageContent}>
              <img
                src={part.image_url.url}
                alt="Uploaded image"
                className={styles.messageImage}
                loading="lazy"
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};