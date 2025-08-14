import React, { useState } from "react";
import { Button } from "./Button";
import { Lightbulb, Loader, AlertTriangle } from "lucide-react";
import { useAnalyzeGoals } from "../helpers/useAI";
import styles from "./AIInsightsCard.module.css";
import { Skeleton } from "./Skeleton";

// A simple markdown parser for basic formatting
const SimpleMarkdown = ({ text }: { text: string }) => {
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/(\r\n|\n|\r)/gm, "<br />"); // Line breaks

  return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
};

interface AIInsightsCardProps {
  className?: string;
}

export const AIInsightsCard = ({ className }: AIInsightsCardProps) => {
  const [showInsights, setShowInsights] = useState(false);
  const {
    mutate: analyzeGoals,
    data,
    isPending,
    isError,
    error,
  } = useAnalyzeGoals();

  const handleGetInsights = () => {
    analyzeGoals();
    setShowInsights(true);
  };

  const renderContent = () => {
    if (!showInsights) {
      return (
        <div className={styles.initialState}>
          <Lightbulb className={styles.icon} size={32} />
          <h4 className={styles.title}>Get Smart Insights</h4>
          <p className={styles.description}>
            Get helpful tips and suggestions to reach your goals faster.
          </p>
          <Button onClick={handleGetInsights} disabled={isPending}>
            {isPending ? "Getting insights..." : "Get My Insights"}
          </Button>
        </div>
      );
    }

    if (isPending) {
      return (
        <div className={styles.loadingState}>
          <Skeleton style={{ height: "1.5rem", width: "70%" }} />
          <Skeleton style={{ height: "1rem", width: "90%" }} />
          <Skeleton style={{ height: "1rem", width: "80%" }} />
          <Skeleton style={{ height: "1rem", width: "85%" }} />
        </div>
      );
    }

    if (isError) {
      return (
        <div className={styles.errorState}>
          <AlertTriangle className={styles.iconError} size={32} />
          <h4 className={styles.title}>Something Went Wrong</h4>
          <p className={styles.description}>
            {error?.message || "Couldn't get your insights right now."}
          </p>
          <Button onClick={handleGetInsights} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    if (data) {
      return (
        <div className={styles.insightsContent}>
          <h4 className={styles.title}>Your Insights</h4>
          <div className={styles.analysisText}>
            <SimpleMarkdown text={data.analysis} />
          </div>
          <Button onClick={handleGetInsights} variant="ghost" size="sm">
            {isPending ? (
              <>
                <Loader size={16} className={styles.loader} /> Getting new insights...
              </>
            ) : (
              "Get New Insights"
            )}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`${styles.card} ${className || ""}`}>{renderContent()}</div>
  );
};