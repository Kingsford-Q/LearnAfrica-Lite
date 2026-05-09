import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';

export default function ProgressCard({ course }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="sm:w-48 aspect-video sm:aspect-square overflow-hidden bg-muted shrink-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs text-muted-foreground">{course.category}</span>
            <h3 className="font-semibold mt-1 text-foreground">{course.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {course.progress === 100 ? 'Completed' : 'In Progress'}
              </span>
              <span className="font-medium text-foreground">{course.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  course.progress === 100 ? 'bg-success' : 'bg-primary'
                )}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          <Link to={`/courses/${course.id}`} className="mt-4">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              {course.progress === 100 ? 'Review' : 'Continue'}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
