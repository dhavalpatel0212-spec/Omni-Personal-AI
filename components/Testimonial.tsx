import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import styles from './Testimonial.module.css';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
}

export const Testimonial = ({ quote, author, role, company, avatarUrl }: TestimonialProps) => {
  const initials = author
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <div className={styles.testimonial}>
      <div className={styles.quote}>
        "{quote}"
      </div>
      <div className={styles.author}>
        <Avatar>
          <AvatarImage src={avatarUrl} alt={author} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className={styles.authorInfo}>
          <div className={styles.name}>{author}</div>
          <div className={styles.position}>{role} at {company}</div>
        </div>
      </div>
    </div>
  );
};