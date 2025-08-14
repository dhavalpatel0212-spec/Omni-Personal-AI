import React from 'react';
import {
  Mic,
  Users,
  Calendar,
  Wifi,
  Puzzle,
  Target,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from './Badge';
import { Progress } from './Progress';
import styles from './LandingUpcomingFeatures.module.css';

const upcomingFeaturesData = [
  {
    icon: <Mic />,
    title: 'Voice Commands & AI Assistant',
    badge: { text: 'In Development', variant: 'secondary' as const },
    description:
      'Control your entire productivity suite with natural voice commands. Create tasks, set reminders, and get AI insights hands-free.',
    progress: 80,
    expectedDate: 'Expected: Q1 2025',
    keyFeatures: [
      'Natural language processing',
      'Multi-language voice support',
      'Contextual AI responses',
    ],
  },
  {
    icon: <Users />,
    title: 'Team Collaboration & Sharing',
    badge: { text: 'Beta Testing', variant: 'success' as const },
    description:
      'Share goals, shopping lists, and projects with family and team members. Real-time collaboration with smart conflict resolution.',
    progress: 92,
    expectedDate: 'Expected: February 2025',
    keyFeatures: [
      'Real-time collaborative editing',
      'Permission-based sharing',
      'Activity feeds & notifications',
    ],
  },
  {
    icon: <Calendar />,
    title: 'Advanced Calendar Scheduling AI',
    badge: { text: 'Coming Soon', variant: 'default' as const },
    description:
      'AI-powered scheduling that learns your preferences, finds optimal meeting times, and automatically blocks focus time based on your goals.',
    progress: 65,
    expectedDate: 'Expected: Q2 2025',
    keyFeatures: [
      'Smart meeting optimization',
      'Focus time protection',
      'Multi-timezone coordination',
    ],
  },
  {
    icon: <Wifi />,
    title: 'Real-time Sync & Offline Mode',
    badge: { text: 'In Development', variant: 'secondary' as const },
    description:
      'Seamless synchronization across all devices with robust offline capabilities. Never lose your data, even without internet connection.',
    progress: 70,
    expectedDate: 'Expected: Q1 2025',
    keyFeatures: [
      'Offline-first architecture',
      'Conflict-free data merging',
      'Cross-device synchronization',
    ],
  },
  {
    icon: <Puzzle />,
    title: 'Integration Marketplace',
    badge: { text: 'Planning', variant: 'outline' as const },
    description:
      'Connect with your favorite tools like Slack, Notion, GitHub, and more. Build custom automations with our no-code integration builder.',
    progress: 35,
    expectedDate: 'Expected: Q3 2025',
    keyFeatures: [
      'Pre-built app integrations',
      'Custom webhook support',
      'No-code automation builder',
    ],
  },
  {
    icon: <Target />,
    title: 'Smart Habit Formation & Streaks',
    badge: { text: 'Coming Soon', variant: 'default' as const },
    description:
      'Advanced habit tracking with AI coaching, personalized streak challenges, and behavioral insights to help you build lasting positive changes.',
    progress: 50,
    expectedDate: 'Expected: Q2 2025',
    keyFeatures: [
      'AI-powered habit coaching',
      'Personalized streak challenges',
      'Behavioral pattern analysis',
    ],
  },
];

export const LandingUpcomingFeatures = () => {
  return (
    <section id="upcoming" className={styles.upcomingSection}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div className={styles.titleWrapper}>
            <Zap className={styles.titleIcon} />
            <h2 className={styles.title}>What's Coming Next</h2>
          </div>
          <p className={styles.subtitle}>
            We're building the future of personal productivity. Here are the game-changing features 
            coming to OmniPA that will transform how you work and live.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {upcomingFeaturesData.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  badge: { text: string; variant: 'default' | 'secondary' | 'success' | 'outline' };
  description: string;
  progress: number;
  expectedDate: string;
  keyFeatures: string[];
}

const FeatureCard = ({
  icon,
  title,
  badge,
  description,
  progress,
  expectedDate,
  keyFeatures,
}: FeatureCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardTitleWrapper}>
          <h4 className={styles.cardTitle}>{title}</h4>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
      </div>
      <p className={styles.cardDescription}>{description}</p>
      <div className={styles.progressWrapper}>
        <div className={styles.progressContainer}>
          <Progress value={progress} />
          <div className={styles.progressGlow} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.progressDetails}>
          <span className={styles.progressPercent}>{progress}% complete</span>
          <span className={styles.expectedDate}>{expectedDate}</span>
        </div>
      </div>
      <div className={styles.keyFeatures}>
        <h5 className={styles.keyFeaturesTitle}>Key Highlights:</h5>
        <ul className={styles.keyFeaturesList}>
          {keyFeatures.map((item, i) => (
            <li key={i}>
              <CheckCircle2 size={16} className={styles.keyFeatureIcon} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};