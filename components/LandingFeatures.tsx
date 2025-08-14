import React from 'react';
import {
  Target,
  BotMessageSquare,
  ShoppingCart,
  Plane,
  Smile,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import styles from './LandingFeatures.module.css';

const features = [
  {
    icon: <Target />,
    title: 'Smart Goal Tracking',
    points: [
      'Goal progress tracking',
      'AI-powered insights',
      'Achievement analytics',
    ],
  },
  {
    icon: <BotMessageSquare />,
    title: 'AI Chat Assistant',
    points: [
      'Natural language processing',
      'Contextual understanding',
      '24/7 availability',
    ],
  },
  {
    icon: <ShoppingCart />,
    title: 'Smart Shopping Lists',
    points: [
      'Automatic categorization',
      'Price comparison',
      'Shopping reminders',
    ],
  },
  {
    icon: <Plane />,
    title: 'Travel Planning',
    points: [
      'Flight search & booking',
      'Hotel recommendations',
      'Itinerary planning',
    ],
  },
  {
    icon: <Smile />,
    title: 'Mood & Wellness',
    points: [
      'Daily mood tracking',
      'Long-term trend analysis',
      'Actionable wellness insights',
    ],
  },
  {
    icon: <Lock />,
    title: 'Secure & Private',
    points: [
      'End-to-end encryption',
      'You control your data',
      'GDPR compliant',
    ],
  },
];

export const LandingFeatures = () => {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Everything You Need to Stay Organized</h2>
          <p className={styles.subtitle}>
            OmniPA is more than just a planner. It's a comprehensive suite of
            tools designed to bring clarity and control to your life.
          </p>
        </div>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardIcon}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <ul className={styles.cardPoints}>
                {feature.points.map((point, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className={styles.pointIcon} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};