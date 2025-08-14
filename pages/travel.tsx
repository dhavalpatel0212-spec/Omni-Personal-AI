import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, MapPin, Search, Sparkles } from 'lucide-react';
import { useGetTravelGoals } from '../helpers/useTravel';
import { Button } from '../components/Button';
import { TravelGoalCard } from '../components/TravelGoalCard';
import { CreateTravelGoalDialog } from '../components/CreateTravelGoalDialog';
import { EditTravelGoalDialog } from '../components/EditTravelGoalDialog';
import { TravelSearchSection } from '../components/TravelSearchSection';
import { Skeleton } from '../components/Skeleton';
import type { Selectable } from 'kysely';
import type { TravelGoals } from '../helpers/schema';
import styles from './travel.module.css';

export default function TravelPage() {
  const [isCreateGoalOpen, setCreateGoalOpen] = useState(false);
  const [isEditGoalOpen, setEditGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Selectable<TravelGoals> | null>(null);
  const [searchDestination, setSearchDestination] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState<'flights' | 'hotels' | 'packages'>('flights');
  const [searchData, setSearchData] = useState<any>(null);

  const { data: travelGoalsData, isFetching, error } = useGetTravelGoals({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const travelGoals = travelGoalsData?.travelGoals || [];

  const handleFindDeals = (goal: Selectable<TravelGoals>) => {
    setSearchDestination(goal.destination);
    setSearchType('packages');
    setSearchData({
      destination: goal.destination,
      budget: Number(goal.budget),
      travelers: goal.travelers,
      targetDate: new Date(goal.targetDate),
    });
    setShowSearch(true);
  };

  const renderTravelGoals = () => {
    if (isFetching) {
      return (
        <div className={styles.goalsGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p>Failed to load travel goals: {error.message}</p>
        </div>
      );
    }

    if (travelGoals.length === 0) {
      return (
        <div className={styles.emptyState}>
          <MapPin size={48} className={styles.emptyIcon} />
          <h3>No Travel Goals Yet</h3>
          <p>Create your first travel goal to start planning your next adventure.</p>
          <Button onClick={() => setCreateGoalOpen(true)}>
            <Plus size={16} />
            Create Travel Goal
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.goalsGrid}>
        {travelGoals.map((goal) => (
          <TravelGoalCard
            key={goal.id}
            goal={goal}
            onEdit={() => {
              setSelectedGoal(goal);
              setEditGoalOpen(true);
            }}
            onFindDeals={() => handleFindDeals(goal)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Travel Planning | OmniPA</title>
        <meta name="description" content="Plan your next adventure with AI-powered travel planning." />
      </Helmet>
      
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Travel Planning</h1>
              <p className={styles.subtitle}>
                Discover, plan, and book your perfect getaway with AI assistance
              </p>
            </div>
            <div className={styles.headerActions}>
              <Button
                variant="secondary"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={16} />
                Search flights, Hotels and Deals
              </Button>
              <Button onClick={() => setCreateGoalOpen(true)}>
                <Plus size={16} />
                Create Goal
              </Button>
            </div>
          </div>
        </header>

        {/* Travel Goals Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <MapPin size={20} />
              Your Travel Goals
            </h2>
            {travelGoals.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setCreateGoalOpen(true)}>
                <Plus size={14} />
                Add Goal
              </Button>
            )}
          </div>
          {renderTravelGoals()}
        </section>

        {/* Travel Search Section */}
        {(showSearch || searchDestination) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Search size={20} />
                Search Travel Deals
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSearch(false);
                  setSearchDestination('');
                }}
              >
                Hide Search
              </Button>
            </div>
            <TravelSearchSection
              defaultSearchType={searchType}
              defaultDestination={searchDestination}
              prePopulatedData={searchData}
              onSearchComplete={() => {
                // Optional: scroll to results or show success message
              }}
            />
          </section>
        )}

        {/* AI Travel Assistant Teaser */}
        <section className={styles.aiSection}>
          <div className={styles.aiCard}>
            <div className={styles.aiContent}>
              <Sparkles size={32} className={styles.aiIcon} />
              <div>
                <h3 className={styles.aiTitle}>AI Travel Assistant</h3>
                <p className={styles.aiDescription}>
                  Get personalized travel recommendations, itinerary planning, and booking assistance powered by AI.
                </p>
              </div>
            </div>
            <Button variant="outline">
              Chat with AI
            </Button>
          </div>
        </section>
      </div>

      <CreateTravelGoalDialog
        isOpen={isCreateGoalOpen}
        onOpenChange={setCreateGoalOpen}
      />

      {selectedGoal && (
        <EditTravelGoalDialog
          isOpen={isEditGoalOpen}
          onOpenChange={setEditGoalOpen}
          goal={selectedGoal}
        />
      )}
    </>
  );
}