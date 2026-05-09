import { Card } from '../common/Card';
import { cn } from '../../lib/utils';

export default function BadgeCard({ badge }) {
  return (
    <Card
      className={cn(
        'p-4 text-center transition-all',
        badge.earned ? 'bg-card' : 'bg-muted/50 opacity-60'
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full text-3xl',
            badge.earned ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          {badge.icon}
        </div>
        <h4 className="font-medium text-sm text-foreground">{badge.title}</h4>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
        {badge.earned && badge.earnedDate && (
          <span className="text-xs text-primary">Earned {badge.earnedDate}</span>
        )}
      </div>
    </Card>
  );
}
