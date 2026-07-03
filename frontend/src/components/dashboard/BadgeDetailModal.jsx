import { Modal } from '../common/Modal';
import { cn } from '../../lib/utils';
import * as Icons from 'lucide-react';

const colorMap = {
  orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  red: 'text-red-500 bg-red-500/10 border-red-500/20',
  blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  teal: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  pink: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
};

export default function BadgeDetailModal({ badge, onClose }) {
  if (!badge) return null;

  const IconComponent = Icons[badge.iconName] || Icons.Award;
  const progressPercent = Math.min(((badge.currentProgress || 0) / badge.goal) * 100, 100);
  const colorStyles = badge.earned
    ? colorMap[badge.color] || 'text-primary bg-primary/10'
    : 'bg-muted/30 text-muted-foreground grayscale opacity-60';

  return (
    <Modal isOpen={!!badge} onClose={onClose} className="max-w-sm">
      <div className="flex flex-col items-center text-center gap-4 pt-2">
        <div className={cn('flex h-20 w-20 items-center justify-center rounded-full', colorStyles)}>
          <IconComponent size={40} strokeWidth={2.5} />
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-lg text-foreground tracking-tight">{badge.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
        </div>

        <div className="w-full pt-2">
          {badge.earned ? (
            <span className={cn(
              'inline-block text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border',
              colorStyles
            )}>
              {badge.earnedDate || 'Unlocked'}
            </span>
          ) : (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]">
                <span className={badge.currentProgress > 0 ? 'text-primary' : 'text-muted-foreground'}>Progress</span>
                <span className={badge.currentProgress > 0 ? 'text-primary' : 'text-muted-foreground'}>
                  {badge.currentProgress || 0} / {badge.goal}
                </span>
              </div>
              <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-in-out',
                    badge.currentProgress > 0 ? 'bg-primary' : 'bg-transparent'
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
