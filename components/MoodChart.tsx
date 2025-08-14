import React from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './Chart';
import { TrendingUp, Calendar } from 'lucide-react';
import { useMoodHistory } from '../helpers/useMoodTracking';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import styles from './MoodChart.module.css';

const chartConfig = {
  mood: {
    label: "Mood",
    color: "var(--primary)",
  },
};

const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄'
};

export const MoodChart: React.FC = () => {
  const { data: moodHistory, isFetching } = useMoodHistory(30); // Get 30 days for better trend visualization

  if (isFetching) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Skeleton style={{ height: '1.5rem', width: '150px' }} />
          <Skeleton style={{ height: '1.25rem', width: '120px' }} />
        </div>
        <div className={styles.chartContainer}>
          <Skeleton style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!moodHistory || moodHistory.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <TrendingUp size={18} />
            Mood Trends
          </h3>
        </div>
        <div className={styles.emptyState}>
          <Calendar size={32} />
          <p>Start logging your mood to see trends here</p>
          <p className={styles.emptySubtext}>Track your daily mood to identify patterns and improve wellbeing</p>
        </div>
      </div>
    );
  }

  // Calculate average mood for the period
  const averageMood = moodHistory.reduce((sum, entry) => sum + entry.moodValue, 0) / moodHistory.length;
  const moodLabel = averageMood >= 4.5 ? 'Excellent' : averageMood >= 3.5 ? 'Great' : averageMood >= 2.5 ? 'Good' : averageMood >= 1.5 ? 'Okay' : 'Needs attention';
  const badgeVariant = averageMood >= 4 ? 'success' : averageMood >= 3 ? 'default' : averageMood >= 2 ? 'warning' : 'destructive';

  // Sort data by date to ensure proper chronological order
  const sortedHistory = [...moodHistory].sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  // Format data for chart with better date handling
  const chartData = sortedHistory.map((entry, index) => {
    const date = new Date(entry.loggedAt);
    let dateLabel: string;
    
    // Use different date formats based on data density
    if (sortedHistory.length <= 7) {
      // For small datasets, show full day name
      dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (sortedHistory.length <= 14) {
      // For medium datasets, show abbreviated format
      dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // For larger datasets, show minimal format
      dateLabel = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    }

    return {
      date: dateLabel,
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      mood: entry.moodValue,
      emoji: entry.emoji || MOOD_EMOJIS[entry.moodValue as keyof typeof MOOD_EMOJIS] || '😐',
      notes: entry.notes,
      index
    };
  });

  // Calculate trend
  const firstHalf = chartData.slice(0, Math.ceil(chartData.length / 2));
  const secondHalf = chartData.slice(Math.ceil(chartData.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.mood, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.mood, 0) / secondHalf.length;
  const trend = secondHalfAvg - firstHalfAvg;
  const trendDirection = trend > 0.2 ? 'improving' : trend < -0.2 ? 'declining' : 'stable';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <TrendingUp size={18} />
          Mood Trends
          {trendDirection === 'improving' && <span className={styles.trendUp}>↗</span>}
          {trendDirection === 'declining' && <span className={styles.trendDown}>↘</span>}
        </h3>
        <div className={styles.headerStats}>
          <Badge variant={badgeVariant} className={styles.averageBadge}>
            Avg: {averageMood.toFixed(1)} - {moodLabel}
          </Badge>
          <span className={styles.dataPoints}>{chartData.length} entries</span>
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border)" 
              opacity={0.3}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              interval={chartData.length > 20 ? 'preserveStartEnd' : 0}
            />
            <YAxis 
              domain={[0.5, 5.5]} 
              ticks={[1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}${MOOD_EMOJIS[value as keyof typeof MOOD_EMOJIS] || ''}`}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  hideLabel={true}
                  formatter={(value, name, props) => [
                    <div key="mood" className={styles.tooltipContent}>
                      <div className={styles.tooltipHeader}>
                        <span className={styles.tooltipEmoji}>{props.payload?.emoji}</span>
                        <span className={styles.tooltipMood}>{value}/5</span>
                      </div>
                      <div className={styles.tooltipDate}>{props.payload?.fullDate}</div>
                      {props.payload?.notes && (
                        <div className={styles.tooltipNotes}>
                          "{props.payload.notes}"
                        </div>
                      )}
                    </div>,
                    ''
                  ]}
                />
              } 
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="var(--color-mood)"
              strokeWidth={3}
              dot={{ 
                fill: "var(--color-mood)", 
                strokeWidth: 0, 
                r: chartData.length <= 10 ? 5 : 4,
              }}
              activeDot={{ 
                r: 7, 
                stroke: "var(--color-mood)", 
                strokeWidth: 2, 
                fill: "var(--surface)" 
              }}
              connectNulls={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      
      {chartData.length >= 7 && (
        <div className={styles.insights}>
          <div className={styles.insightItem}>
            <span className={styles.insightLabel}>Trend:</span>
            <span className={`${styles.insightValue} ${styles[`trend-${trendDirection}`]}`}>
              {trendDirection === 'improving' && '↗ Improving'}
              {trendDirection === 'declining' && '↘ Needs attention'}
              {trendDirection === 'stable' && '→ Stable'}
            </span>
          </div>
          <div className={styles.insightItem}>
            <span className={styles.insightLabel}>Range:</span>
            <span className={styles.insightValue}>
              {Math.min(...chartData.map(d => d.mood))} - {Math.max(...chartData.map(d => d.mood))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};