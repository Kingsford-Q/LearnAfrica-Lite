import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';
import { fileUrl } from '../../lib/apiClient';
import {
  CheckCircle2,
  PlayCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ProgressCard({ course, buttonVariant = 'primary' }) {
  const isCompleted = course.progress === 100;

  return (
    <Card className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        {/* Top Section (Thumbnail + Content) */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {/* Thumbnail */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 sm:h-20 sm:w-20">
            <img
              src={fileUrl(course.thumbnail)}
              alt={course.title}
              loading="lazy"
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
            />

            {/* Completion Overlay */}
            {isCompleted && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
                <div className="rounded-full bg-primary p-1 shadow-lg sm:p-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Meta */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3 shrink-0" />
                <span className="truncate">{course.category}</span>
              </span>

              <span className="truncate text-muted-foreground">
                {course.instructorName}
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
              {course.title}
            </h3>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">Completed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">In Progress</span>
                    </>
                  )}
                </span>

                <span className="shrink-0 text-[10px] font-semibold tabular-nums text-foreground sm:text-[11px]">
                  {course.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    isCompleted
                      ? 'bg-primary'
                      : 'bg-gradient-to-r from-primary/70 via-primary/85 to-primary'
                  )}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="w-full shrink-0 sm:w-auto">
          <Link to={`/courses/${course.id}`} className="block w-full">
            <Button
              size="sm"
              variant={buttonVariant}
              className="h-10 w-full rounded-xl px-4 text-xs font-semibold shadow-sm transition-all sm:h-9 sm:w-auto"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Review
                </>
              ) : (
                <>
                  <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                  Resume
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}