import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { GoalCelebration } from '../components/GoalCelebration';

/**
 * Defines the types of celebrations supported.
 * This can be extended with more types like 'milestone', 'achievement', etc.
 */
type CelebrationType = 'goal' | 'action';

interface Celebration {
  id: string;
  type: CelebrationType;
}

interface CelebrationContextType {
  /**
   * Triggers a celebration for completing a goal.
   */
  celebrateGoalCompletion: () => void;
  /**
   * Triggers a celebration for completing an action.
   */
  celebrateActionCompletion: () => void;
  /**
   * A generic function to trigger a celebration of a specific type.
   * @param type The type of celebration to trigger.
   */
  celebrate: (type: CelebrationType) => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(
  undefined
);

/**
 * Provides a global celebration state and queueing system.
 * It should be added to `_globalContextProviders.tsx` to be available across the app.
 */
export const CelebrationProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [currentCelebration, setCurrentCelebration] =
    useState<Celebration | null>(null);

  // Function to add a new celebration to the queue
  const celebrate = useCallback((type: CelebrationType) => {
    const newCelebration: Celebration = {
      id: `celebration-${Date.now()}-${Math.random()}`,
      type,
    };
    setQueue((prevQueue) => [...prevQueue, newCelebration]);
    console.log(`Queued celebration: ${type}`);
  }, []);

  // Effect to process the celebration queue
  useEffect(() => {
    if (!currentCelebration && queue.length > 0) {
      const [nextCelebration, ...remainingQueue] = queue;
      setCurrentCelebration(nextCelebration);
      setQueue(remainingQueue);
      console.log(`Displaying celebration: ${nextCelebration.type}`);
    }
  }, [queue, currentCelebration]);

  const handleClose = useCallback(() => {
    console.log(`Closing celebration: ${currentCelebration?.type}`);
    setCurrentCelebration(null);
  }, [currentCelebration]);

  const contextValue: CelebrationContextType = {
    celebrate,
    celebrateGoalCompletion: () => celebrate('goal'),
    celebrateActionCompletion: () => celebrate('action'),
  };

  return (
    <CelebrationContext.Provider value={contextValue}>
      {children}
      {currentCelebration && (
        <GoalCelebration
          isOpen={!!currentCelebration}
          onClose={handleClose}
          type={currentCelebration.type}
        />
      )}
    </CelebrationContext.Provider>
  );
};

/**
 * Hook to access celebration functions.
 * Allows any component to trigger a global celebration animation.
 *
 * @example
 * const { celebrateGoalCompletion } = useCelebration();
 *
 * const handleCompleteGoal = () => {
 *   // ... logic to complete goal
 *   celebrateGoalCompletion();
 * };
 */
export const useCelebration = (): CelebrationContextType => {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
};