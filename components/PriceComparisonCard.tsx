import React from 'react';
import { TrendingUp, TrendingDown, Tag, Info } from 'lucide-react';
import { Badge } from './Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';
import styles from './PriceComparisonCard.module.css';

export interface PriceComparisonCardProps {
  estimatedPrice?: number | string | null;
  actualPrice?: number | string | null;
  currency?: string;
  className?: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const PriceComparisonCard: React.FC<PriceComparisonCardProps> = ({
  estimatedPrice,
  actualPrice,
  currency = 'USD',
  className,
}) => {
  const estPriceNum = estimatedPrice ? parseFloat(String(estimatedPrice)) : null;
  const actPriceNum = actualPrice ? parseFloat(String(actualPrice)) : null;

  const hasBothPrices = estPriceNum !== null && actPriceNum !== null;
  const savings = hasBothPrices ? estPriceNum - actPriceNum : 0;
  const savingsPercentage =
    hasBothPrices && estPriceNum > 0 ? (savings / estPriceNum) * 100 : 0;

  const renderPriceInfo = () => {
    if (hasBothPrices) {
      return (
        <>
          <div className={styles.priceDetail}>
            <span className={styles.priceLabel}>Estimated Price</span>
            <span className={styles.priceValue}>{formatCurrency(estPriceNum, currency)}</span>
          </div>
          <div className={styles.priceDetail}>
            <span className={styles.priceLabel}>Actual Price</span>
            <span className={styles.priceValue}>{formatCurrency(actPriceNum, currency)}</span>
          </div>
        </>
      );
    }
    if (estPriceNum !== null) {
      return (
        <div className={styles.priceDetail}>
          <span className={styles.priceLabel}>Estimated Price</span>
          <span className={styles.priceValue}>{formatCurrency(estPriceNum, currency)}</span>
        </div>
      );
    }
    if (actPriceNum !== null) {
      return (
        <div className={styles.priceDetail}>
          <span className={styles.priceLabel}>Actual Price</span>
          <span className={styles.priceValue}>{formatCurrency(actPriceNum, currency)}</span>
        </div>
      );
    }
    return (
      <div className={styles.noPriceInfo}>
        <Tag size={16} className={styles.mutedIcon} />
        <span>No price information available.</span>
      </div>
    );
  };

  const renderSavings = () => {
    if (!hasBothPrices) return null;

    const isSavings = savings > 0;
    const isOverspend = savings < 0;
    const savingsClass = isSavings ? styles.savings : isOverspend ? styles.overspend : styles.neutral;

    return (
      <div className={`${styles.savingsContainer} ${savingsClass}`}>
        <div className={styles.savingsAmount}>
          {isSavings && <TrendingUp size={24} />}
          {isOverspend && <TrendingDown size={24} />}
          <span>
            {isSavings ? 'Saved' : isOverspend ? 'Overspent' : 'On Budget'}: {formatCurrency(Math.abs(savings), currency)}
          </span>
        </div>
        <div className={styles.savingsPercentage}>
          ({savingsPercentage.toFixed(1)}%)
        </div>
      </div>
    );
  };

  const renderBadge = () => {
    if (!hasBothPrices) return null;

    if (savingsPercentage > 10) {
      return <Badge variant="success">Great Deal</Badge>;
    }
    if (savings > 0) {
      return <Badge variant="success">Savings</Badge>;
    }
    if (savings < 0) {
      return <Badge variant="destructive">Over Budget</Badge>;
    }
    return <Badge variant="outline">On Budget</Badge>;
  };

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Price Analysis</h3>
        <div className={styles.badgeContainer}>{renderBadge()}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.priceList}>
          {renderPriceInfo()}
        </div>
        {renderSavings()}
      </div>
      <div className={styles.footer}>
        <Info size={14} className={styles.mutedIcon} />
        <p>
          Price comparison is based on estimated vs. actual cost.
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={styles.tooltipTrigger}>
                Why is this important?
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Tracking price differences helps you budget more effectively and identify savings opportunities over time.
            </TooltipContent>
          </Tooltip>
        </p>
      </div>
    </div>
  );
};