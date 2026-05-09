import { Link } from 'react-router-dom'
import { Clock, Users, Star, Play } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/utils'

const difficultyColors = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'destructive'
}

export function CourseCard({ course, enrolled = false }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {course.isFree && (
          <Badge className="absolute left-3 top-3" variant="success">
            Free
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="h-5 w-5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={difficultyColors[course.difficulty] || 'secondary'}>
            {course.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">{course.category}</span>
        </div>

        <Link to={`/courses/${course.id}`}>
          <h3 className="font-semibold leading-tight hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-muted">
            <img
              src={course.instructorAvatar}
              alt={course.instructor}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm text-muted-foreground">{course.instructor}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollments.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span>{course.rating}</span>
          </div>
        </div>

        {/* Progress Bar (if enrolled) */}
        {enrolled && course.progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{course.progress}%</span>
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
        )}

        {/* Action Button */}
        <Link to={`/courses/${course.id}`} className="block">
          <Button className="w-full" variant={enrolled ? 'secondary' : 'primary'}>
            {enrolled
              ? course.progress === 100
                ? 'Review Course'
                : 'Continue Learning'
              : course.isFree
              ? 'Start Free Course'
              : `Enroll - $${course.price}`}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
