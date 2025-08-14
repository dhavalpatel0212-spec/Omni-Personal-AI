import React, { useState, useMemo } from 'react';
import { Cpu, Zap, BarChart3, Info, Bot, BrainCircuit } from 'lucide-react';
import { aiModelRouter, ModelSelection, AiRouterInput } from '../helpers/aiModelRouter';
import { useAIPerformanceMetrics } from '../helpers/useAI';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { Separator } from './Separator';
import { Skeleton } from './Skeleton';
import styles from './AIModelRouterDemo.module.css';

const exampleQueries = [
  {
    id: 'simple_chat',
    title: 'Simple Chat',
    query: 'Hi, how are you today?',
    description: 'Basic conversational queries are routed to the faster, more cost-effective model.',
  },
  {
    id: 'mood_log',
    title: 'Mood Logging',
    query: 'I want to log my mood, I felt pretty happy this morning.',
    description: 'Specific, simple tasks like logging moods use the mini model for quick responses.',
  },
  {
    id: 'shopping_list',
    title: 'Shopping List',
    query: 'Add milk and bread to my shopping list.',
    description: 'Simple commands for managing lists are handled efficiently by the mini model.',
  },
  {
    id: 'complex_reasoning',
    title: 'Complex Reasoning',
    query: 'Can you explain the pros and cons of functional programming vs object-oriented programming?',
    description: 'Queries requiring deep analysis and comparison are upgraded to the more powerful model.',
  },
  {
    id: 'travel_planning',
    title: 'Travel Planning',
    query: 'Plan a 5-day trip to Tokyo for me, focusing on cultural sites and good food.',
    description: 'Complex, multi-step tasks like travel planning require the advanced reasoning of the full model.',
  },
  {
    id: 'long_conversation',
    title: 'Long Conversation Context',
    query: '... (after 10 messages) ...and based on all that, what do you suggest?',
    description: 'To maintain context in long conversations, the system automatically upgrades to the more capable model.',
    isLong: true,
  },
  {
    id: 'image_analysis',
    title: 'Image Analysis',
    query: 'What is in this picture?',
    description: 'Any query that includes an image is automatically routed to the vision-capable gpt-4o model.',
    hasImage: true,
  },
];

const ModelCard = ({ modelName, description, features }: { modelName: string; description: string; features: string[] }) => (
  <div className={styles.modelCard}>
    <div className={styles.modelCardHeader}>
      {modelName === 'gpt-4o-mini' ? <Zap className={styles.modelIcon} /> : <BrainCircuit className={styles.modelIcon} />}
      <h3 className={styles.modelName}>{modelName}</h3>
    </div>
    <p className={styles.modelDescription}>{description}</p>
    <ul className={styles.modelFeatures}>
      {features.map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>
  </div>
);

const RoutingResult = ({ result }: { result: ModelSelection }) => (
  <div className={styles.resultCard}>
    <div className={styles.resultHeader}>
      <h4 className={styles.resultTitle}>Routing Decision</h4>
      <Badge variant={result.model === 'gpt-4o' ? 'secondary' : 'default'}>{result.model}</Badge>
    </div>
    <div className={styles.resultBody}>
      <p className={styles.resultReason}>
        <Info size={16} />
        <span>{result.reason}</span>
      </p>
      <div className={styles.confidence}>
        <span className={styles.confidenceLabel}>Confidence: {Math.round(result.confidence * 100)}%</span>
        <div className={styles.confidenceBarContainer}>
          <div className={styles.confidenceBar} style={{ width: `${result.confidence * 100}%` }} />
        </div>
      </div>
      <div className={styles.configDetails}>
        <h5 className={styles.configTitle}>Model Config</h5>
        <code>{JSON.stringify(result.config, null, 2)}</code>
      </div>
    </div>
  </div>
);

const AnalyticsDisplay = () => {
  const { data, isLoading, error } = useAIPerformanceMetrics();

  if (isLoading) {
    return (
      <div className={styles.analyticsGrid}>
        <Skeleton className={styles.analyticsCard} style={{ height: '100px' }} />
        <Skeleton className={styles.analyticsCard} style={{ height: '100px' }} />
        <Skeleton className={styles.analyticsCard} style={{ height: '250px', gridColumn: '1 / -1' }} />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Failed to load analytics: {error.message}</div>;
  }

  if (!data || data.totalOperations === 0) {
    return <div className={styles.emptyState}>No AI analytics data yet. Interact with AI features to see stats.</div>;
  }

  return (
    <div className={styles.analyticsGrid}>
      <div className={styles.analyticsCard}>
        <h6>Total Operations</h6>
        <p className={styles.metricValue}>{data.totalOperations}</p>
      </div>
      <div className={styles.analyticsCard}>
        <h6>Avg. Duration</h6>
        <p className={styles.metricValue}>{data.averageDuration}ms</p>
      </div>
      <div className={`${styles.analyticsCard} ${styles.fullWidthCard}`}>
        <h6>Model Performance</h6>
        {data.modelPerformance.length > 0 ? (
          <table className={styles.performanceTable}>
            <thead>
              <tr>
                <th>Model</th>
                <th>Usage</th>
                <th>Avg. Duration</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.modelPerformance.map((perf) => (
                <tr key={perf.model}>
                  <td><Badge variant={perf.model === 'gpt-4o' ? 'secondary' : 'default'}>{perf.model}</Badge></td>
                  <td>{perf.usage}</td>
                  <td>{perf.averageDuration}ms</td>
                  <td>{perf.successRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No model-specific performance data available.</p>
        )}
      </div>
    </div>
  );
};

export const AIModelRouterDemo = ({ className }: { className?: string }) => {
  const [customQuery, setCustomQuery] = useState('');
  const [routingResult, setRoutingResult] = useState<ModelSelection | null>(null);

  const handleTestQuery = () => {
    if (!customQuery.trim()) {
      setRoutingResult(null);
      return;
    }
    const input: AiRouterInput = {
      messages: [{ role: 'user', content: customQuery }],
    };
    const result = aiModelRouter(input);
    setRoutingResult(result);
  };

  const exampleResults = useMemo(() => {
    return exampleQueries.map(ex => {
      const messages: AiRouterInput['messages'] = [];
      if (ex.isLong) {
        // Simulate a long conversation history
        for (let i = 0; i < 11; i++) {
          messages.push({ role: 'user', content: '...' });
        }
      }
      
      const content: any = ex.hasImage 
        ? [{ type: 'text', text: ex.query }, { type: 'image_url', image_url: { url: 'data:...' } }]
        : ex.query;

      messages.push({ role: 'user', content });

      return {
        ...ex,
        result: aiModelRouter({ messages }),
      };
    });
  }, []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <header className={styles.header}>
        <div className={styles.headerIcon}><Bot size={32} /></div>
        <h1 className={styles.title}>AI Model Router Demo</h1>
        <p className={styles.subtitle}>
          A developer tool to demonstrate and test the intelligent routing of AI queries to the optimal model.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><BrainCircuit size={20} /> Model Comparison</h2>
        <div className={styles.modelComparison}>
          <ModelCard
            modelName="gpt-4o-mini"
            description="Optimized for speed and cost-efficiency on simpler tasks."
            features={['Fast response times', 'Lower operational cost', 'Ideal for chat, summarization, and simple commands']}
          />
          <ModelCard
            modelName="gpt-4o"
            description="The most powerful model for complex reasoning, analysis, and vision."
            features={['Advanced reasoning', 'Multi-modal (vision) capable', 'Maintains context in long conversations']}
          />
        </div>
      </section>

      <Separator />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Cpu size={20} /> Live Router Test</h2>
        <div className={styles.liveTest}>
          <div className={styles.inputGroup}>
            <Input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Enter a query to see where it routes..."
              onKeyDown={(e) => e.key === 'Enter' && handleTestQuery()}
            />
            <Button onClick={handleTestQuery}>Test Route</Button>
          </div>
          {routingResult && <RoutingResult result={routingResult} />}
        </div>
      </section>

      <Separator />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Zap size={20} /> Routing Examples</h2>
        <div className={styles.examplesGrid}>
          {exampleResults.map((ex) => (
            <div key={ex.id} className={styles.exampleCard}>
              <h5 className={styles.exampleTitle}>{ex.title}</h5>
              <p className={styles.exampleQuery}>"{ex.query}"</p>
              <p className={styles.exampleDescription}>{ex.description}</p>
              <div className={styles.exampleResult}>
                <span>Routes to:</span>
                <Badge variant={ex.result.model === 'gpt-4o' ? 'secondary' : 'default'}>
                  {ex.result.model}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><BarChart3 size={20} /> AI Analytics</h2>
        <AnalyticsDisplay />
      </section>
    </div>
  );
};