import React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMoodHistory, useMoodInsights } from '../helpers/useMoodTracking';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from './Chart';
import { Badge } from './Badge';
import { Skeleton } from './Skeleton';
import styles from './MoodTrends.module.css';

const chartConfig: ChartConfig = {
  mood: {
    label: 'Mood',
    color: 'var(--primary)',
  },
};

// Emoji mapping for mood values
const getMoodEmoji = (value: number): string => {
  switch (value) {
    case 1: return '😢';
    case 2: return '😟';
    case 3: return '😐';
    case 4: return '😊';
    case 5: return '😍';
    default: return '😐';
  }
};

// Custom Y-axis tick formatter
const YAxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={4} 
        textAnchor="end" 
        fill="var(--muted-foreground)" 
        fontSize="16"
      >
        {getMoodEmoji(payload.value)}
      </text>
    </g>
  );
};

const MoodTrendsSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.header}>
      <Skeleton style={{ height: '32px', width: '180px' }} />
      <div className={styles.headerRight}>
        <Skeleton style={{ height: '24px', width: '100px' }} />
        <Skeleton style={{ height: '24px', width: '80px' }} />
      </div>
    </div>
    <div className={styles.chartWrapper}>
      <Skeleton style={{ height: '100%', width: '100%' }} />
    </div>
    <div className={styles.bottomStats}>
      <Skeleton style={{ height: '20px', width: '120px' }} />
      <Skeleton style={{ height: '20px', width: '100px' }} />
    </div>
  </div>
);

const EmptyState = () => (
  <div className={`${styles.card} ${styles.emptyState}`}>
    <div className={styles.emptyStateIcon}>📊</div>
    <h4 className={styles.emptyStateTitle}>No mood data yet</h4>
    <p className={styles.emptyStateText}>
      Start logging your mood daily to see your trends and patterns here.
    </p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className={`${styles.card} ${styles.errorState}`}>
    <AlertCircle className={styles.errorIcon} />
    <h4 className={styles.errorTitle}>Unable to load mood trends</h4>
    <p className={styles.errorText}>{message}</p>
  </div>
);

export const MoodTrends = ({ className }: { className?: string }) => {
  const {
    data: history,
    isFetching: isHistoryFetching,
    error: historyError,
  } = useMoodHistory(7);
  const {
    data: insights,
    isFetching: areInsightsFetching,
    error: insightsError,
  } = useMoodInsights();

  if (isHistoryFetching || areInsightsFetching) {
    return <MoodTrendsSkeleton />;
  }

  if (historyError) {
    return (
      <ErrorState
        message={
          historyError instanceof Error
            ? historyError.message
            : 'An unknown error occurred.'
        }
      />
    );
  }

  if (insightsError) {
    return (
      <ErrorState
        message={
          insightsError instanceof Error
            ? insightsError.message
            : 'An unknown error occurred.'
        }
      />
    );
  }

  if (!history || history.length < 2) {
    return <EmptyState />;
  }

  const chartData = history
    .map((entry) => ({
      date: new Date(entry.loggedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      }),
      mood: entry.moodValue,
    }))
    .reverse();

  // Debug logging to understand chart data
  console.log('MoodTrends chartData:', {
    totalEntries: history.length,
    chartDataLength: chartData.length,
    chartData: chartData,
  });

  const moodValues = history.map((entry) => entry.moodValue);
  const range = {
    min: Math.min(...moodValues),
    max: Math.max(...moodValues),
  };

  const average = (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1);

  // Calculate simple trend based on first and last values
  const firstValue = moodValues[moodValues.length - 1]; // oldest entry
  const lastValue = moodValues[0]; // newest entry
  const trendDiff = lastValue - firstValue;

  const getTrendInfo = () => {
    const trendInsight = insights?.find((insight) => insight.type === 'trend');
    
    let trendStatus = 'Stable';
    let trendIcon = <Minus size={14} />;

    if (trendDiff > 0.3) {
      trendStatus = 'Improving';
      trendIcon = <TrendingUp size={14} />;
    } else if (trendDiff < -0.3) {
      trendStatus = 'Declining';
      trendIcon = <TrendingDown size={14} />;
    } else if (trendInsight) {
      // Use insight sentiment if available and trend is minimal
      if (trendInsight.sentiment === 'positive') {
        trendStatus = 'Improving';
        trendIcon = <TrendingUp size={14} />;
      } else if (trendInsight.sentiment === 'negative') {
        trendStatus = 'Declining';
        trendIcon = <TrendingDown size={14} />;
      }
    }

    return { trendStatus, trendIcon };
  };

  const { trendStatus, trendIcon } = getTrendInfo();

  // Get quality description based on average
  const getQualityDescription = (avg: number) => {
    if (avg <= 1.5) return 'Poor';
    if (avg <= 2.5) return 'Fair';
    if (avg <= 3.5) return 'Good';
    if (avg <= 4.5) return 'Great';
    return 'Excellent';
  };

  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <TrendingUp className={styles.titleIcon} />
          <h3 className={styles.title}>Mood Trends</h3>
        </div>
        <div className={styles.headerRight}>
          <Badge variant="outline" className={styles.avgBadge}>
            Avg: {average} - {getQualityDescription(parseFloat(average))}
          </Badge>
          <span className={styles.entriesCount}>{history.length} entries</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
            >
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="var(--border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={YAxisTick}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--primary)', strokeDasharray: '3 3', opacity: 0.3 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey="mood"
              type="monotone"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--primary)', strokeWidth: 2, fill: 'var(--surface)' }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className={styles.bottomStats}>
        <div className={styles.trendStat}>
          <span className={styles.statLabel}>Trend:</span>
          <div className={styles.trendValue}>
            {trendIcon}
            <span>{trendStatus}</span>
          </div>
        </div>
        <div className={styles.rangeStat}>
          <span className={styles.statLabel}>Range:</span>
          <span className={styles.statValue}>
            {range.min} - {range.max}
          </span>
        </div>
      </div>
    </div>
  );
};