import React, { isValidElement } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, className }) {
  const isPositive = trend === 'up';

  // This helper handles both cases: 
  // 1. icon={BookOpen} (Component Function)
  // 2. icon={<BookOpen />} (JSX Element)
  const renderIcon = () => {
    if (!Icon) return null;
    
    if (isValidElement(Icon)) {
      return Icon; // It's already JSX, just return it
    }
    
    // It's a component function, render it with a standard size
    return <Icon className="h-6 w-6" />;
  };

  return (
    <Card className={cn('p-6 border-border/50 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-foreground tracking-tight">{value}</p>
          
          {trend && trendValue && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isPositive ? 'text-emerald-600' : 'text-destructive'
              )}
            >
              {isPositive ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {renderIcon()}
        </div>
      </div>
    </Card>
  );
}