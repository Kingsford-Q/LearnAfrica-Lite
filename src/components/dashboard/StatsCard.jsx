import { Card } from '../common/Card';
import { cn } from '../../lib/utils';

export default function StatsCard({ title, value, icon, trend, trendValue, className }) {
  const isPositive = trend === 'up';

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && trendValue && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {isPositive ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
