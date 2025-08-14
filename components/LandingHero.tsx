import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Testimonial } from './Testimonial';
import { TrustBadges } from './TrustBadges';
import { ProductPreview } from './ProductPreview';
import { StatCard } from './StatCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import styles from './LandingHero.module.css';

interface LandingHeroProps {
  onJoinWaitlistClick: () => void;
  joinedWaitlist: boolean;
}

export const LandingHero = ({ onJoinWaitlistClick, joinedWaitlist }: LandingHeroProps) => {
  const testimonials = [
    {
      quote: "OmniPA transformed how I manage my daily tasks. Everything I need is finally in one place.",
      author: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      avatarUrl: "https://i.pravatar.cc/150?img=1"
    },
    {
      quote: "The AI automation saves me 2 hours every day. It's like having a personal assistant.",
      author: "Mike Rodriguez",
      role: "Founder",
      company: "StartupXYZ",
      avatarUrl: "https://i.pravatar.cc/150?img=3"
    },
    {
      quote: "Finally, a productivity app that actually understands what I need. Game changer!",
      author: "Emily Watson",
      role: "Freelance Designer",
      company: "Creative Studio",
      avatarUrl: "https://i.pravatar.cc/150?img=9"
    }
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Main Content */}
        <div className={styles.content}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>AI-Powered Personal Assistant</span>
          </div>
          
          <h1 className={styles.headline}>
            Simplify Your Daily Life with AI-Powered Automation
          </h1>
          
          <p className={styles.subtitle}>
            Stop juggling multiple apps for goals, shopping, travel, and mood tracking. 
            OmniPA brings intelligent automation to every aspect of your daily routine, 
            saving you time and mental energy.
          </p>
          
          <div className={styles.ctaButtons}>
            {joinedWaitlist ? (
              <Button size="lg" disabled className={styles.primaryButton}>
                ✓ You're on the waitlist!
              </Button>
            ) : (
              <Button size="lg" onClick={onJoinWaitlistClick} className={styles.primaryButton}>
                Start Managing Now
                <ArrowRight className={styles.buttonIcon} />
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to="/#features">See How It Works</Link>
            </Button>
          </div>

          {/* <TrustBadges /> */}
        </div>

        {/* Enhanced Statistics */}
        {/* <div className={styles.stats}>
          <StatCard value="Launching" label="Early Access" trend="Growing Fast" icon="users" />
          <StatCard value="4.9★" label="App Rating" icon="star" />
          <StatCard value="2.5K+" label="Tasks Automated" trend="Growing Daily" icon="zap" />
          <StatCard value="Fresh" label="New Platform" icon="trending" />
        </div> */}

        {/* Testimonials */}
        {/* <div className={styles.testimonialsSection}>
          <h3 className={styles.testimonialsTitle}>Loved by thousands of users</h3>
          <div className={styles.testimonials}>
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </div>
        </div> */}

        {/* Product Preview */}
        <ProductPreview />
      </div>
    </section>
  );
};