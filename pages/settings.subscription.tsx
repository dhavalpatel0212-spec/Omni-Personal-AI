import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Crown, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useAuth } from '../helpers/useAuth';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Switch } from '../components/Switch';
import { Skeleton } from '../components/Skeleton';
import styles from './settings.subscription.module.css';

type BillingCycle = 'monthly' | 'yearly';

const pricingTiers = [
  {
    name: 'Free Trial',
    price: { monthly: 0, yearly: 0 },
    description: 'Get a taste of our core features for 14 days.',
    buttonText: 'Start Free Trial',
    buttonVariant: 'primary' as const,
    badge: 'Most Popular',
    features: [
      { text: 'Up to 5 Goals', included: true },
      { text: 'Up to 3 Shopping Lists', included: true },
      { text: 'Basic AI Analysis', included: true },
      { text: '1 Calendar Sync', included: true },
      { text: 'Email Support', included: true },
      { text: 'Advanced AI Insights', included: false },
      { text: 'Family Sharing', included: false },
      { text: 'Business Tools', included: false },
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 9.99, yearly: 99.99 },
    description: 'For individuals who want to maximize their productivity.',
    buttonText: 'Upgrade Now',
    buttonVariant: 'primary' as const,
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited Goals', included: true },
      { text: 'Unlimited Shopping Lists', included: true },
      { text: 'Advanced AI Analysis', included: true },
      { text: '5 Calendar Syncs', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Advanced AI Insights', included: true },
      { text: 'Family Sharing', included: false },
      { text: 'Business Tools', included: false },
    ],
  },
  {
    name: 'Family',
    price: { monthly: 19.99, yearly: 199.99 },
    description: 'Sync and collaborate with your entire family.',
    buttonText: 'Coming Soon',
    buttonVariant: 'secondary' as const,
    badge: 'Coming Soon',
    disabled: true,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Up to 6 Members', included: true },
      { text: 'Shared Goals & Lists', included: true },
      { text: 'Family Calendar View', included: true },
      { text: 'Centralized Billing', included: true },
      { text: 'Advanced AI Insights', included: true },
      { text: 'Business Tools', included: false },
    ],
  },
  {
    name: 'Business',
    price: { monthly: 49.99, yearly: 499.99 },
    description: 'For teams and professionals to achieve more together.',
    buttonText: 'Coming Soon',
    buttonVariant: 'outline' as const,
    badge: 'Coming Soon',
    disabled: true,
    features: [
      { text: 'Everything in Family', included: true },
      { text: 'Team Management', included: true },
      { text: 'Admin Dashboard', included: true },
      { text: 'Advanced Security', included: true },
      { text: 'Dedicated Support', included: true },
      { text: 'API Access', included: true },
    ],
  },
];

const CurrentPlanSkeleton = () => (
  <div className={styles.currentPlanCard}>
    <div className={styles.planHeader}>
      <Skeleton style={{ height: '1.5rem', width: '150px' }} />
      <Skeleton style={{ height: '1.5rem', width: '100px' }} />
    </div>
    <div className={styles.planFeatures}>
      <Skeleton style={{ height: '1.25rem', width: '120px' }} />
      <Skeleton style={{ height: '1.25rem', width: '140px' }} />
      <Skeleton style={{ height: '1.25rem', width: '110px' }} />
      <Skeleton style={{ height: '1.25rem', width: '130px' }} />
    </div>
  </div>
);

const CurrentPlan = () => {
  const { authState } = useAuth();

  if (authState.type === 'loading') {
    return <CurrentPlanSkeleton />;
  }

  if (authState.type === 'unauthenticated') {
    return (
      <div className={`${styles.currentPlanCard} ${styles.unauthenticatedCard}`}>
        <Info size={24} className={styles.unauthenticatedIcon} />
        <p>Please log in to see your subscription details.</p>
      </div>
    );
  }

  const { user } = authState;
  const currentPlan = user.subscriptionPlan || 'No Plan';
  const status = user.subscriptionStatus || 'Inactive';
  const isInactive = status.toLowerCase() === 'inactive';

  const features = {
    'No Plan': { goals: 0, shoppingLists: 0, aiAnalysis: 'None', calendarSync: 'None' },
    'Free Trial': { goals: 5, shoppingLists: 3, aiAnalysis: 'Basic', calendarSync: '1' },
    'Pro': { goals: 'Unlimited', shoppingLists: 'Unlimited', aiAnalysis: 'Advanced', calendarSync: '5' },
    'Family': { goals: 'Unlimited', shoppingLists: 'Unlimited', aiAnalysis: 'Advanced', calendarSync: 'Shared' },
    'Business': { goals: 'Unlimited', shoppingLists: 'Unlimited', aiAnalysis: 'Advanced', calendarSync: 'Team' },
  };

  const planFeatures = features[currentPlan as keyof typeof features] || features['No Plan'];

  return (
    <div className={styles.currentPlanCard}>
      <div className={styles.planHeader}>
        <div className={styles.planInfo}>
          <span className={styles.planLabel}>Current Plan</span>
          <Badge variant={isInactive ? 'warning' : 'success'}>{currentPlan}</Badge>
        </div>
        <div className={styles.planInfo}>
          <span className={styles.planLabel}>Status</span>
          <Badge variant={isInactive ? 'warning' : 'success'}>{status}</Badge>
        </div>
      </div>
      <div className={styles.planFeatures}>
        <span>Goals: <strong>{planFeatures.goals}</strong></span>
        <span>Shopping Lists: <strong>{planFeatures.shoppingLists}</strong></span>
        <span>AI Analysis: <strong>{planFeatures.aiAnalysis}</strong></span>
        <span>Calendar Sync: <strong>{planFeatures.calendarSync}</strong></span>
      </div>
    </div>
  );
};

const SettingsSubscriptionPage = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  return (
    <>
      <Helmet>
        <title>Subscription & Billing - Settings</title>
        <meta name="description" content="Manage your subscription and billing details." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <Crown size={32} className={styles.headerIcon} />
          <h1>Subscription & Billing</h1>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Plan Status</h2>
          <CurrentPlan />
        </section>

        <section className={styles.section}>
          <div className={styles.billingToggleContainer}>
            <h2 className={styles.sectionTitle}>Choose Your Plan</h2>
            <div className={styles.billingToggle}>
              <label htmlFor="billing-cycle" className={billingCycle === 'monthly' ? styles.activeLabel : ''}>Monthly</label>
              <Switch
                id="billing-cycle"
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <label htmlFor="billing-cycle" className={billingCycle === 'yearly' ? styles.activeLabel : ''}>Yearly</label>
              <Badge variant="secondary" className={styles.savingsBadge}>Save 17%</Badge>
            </div>
          </div>

          <div className={styles.pricingGrid}>
            {pricingTiers.map((tier) => (
              <div key={tier.name} className={`${styles.pricingCard} ${tier.buttonVariant === 'primary' ? styles.popularCard : ''}`}>
                {tier.badge && <Badge className={styles.tierBadge}>{tier.badge}</Badge>}
                <h3 className={styles.tierName}>{tier.name}</h3>
                <p className={styles.tierPrice}>
                  <span className={styles.priceValue}>£{billingCycle === 'monthly' ? tier.price.monthly.toFixed(2) : (tier.price.yearly / 12).toFixed(2)}</span>
                  / month
                </p>
                <p className={styles.tierDescription}>{tier.description}</p>
                
                <Button 
                  variant={tier.buttonVariant} 
                  className={styles.tierButton} 
                  disabled={tier.disabled}
                >
                  {tier.buttonText}
                </Button>

                <ul className={styles.featureList}>
                  {tier.features.map((feature, index) => (
                    <li key={index} className={feature.included ? styles.included : styles.excluded}>
                      {feature.included ? <CheckCircle2 size={16} className={styles.featureIcon} /> : <XCircle size={16} className={styles.featureIcon} />}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default SettingsSubscriptionPage;