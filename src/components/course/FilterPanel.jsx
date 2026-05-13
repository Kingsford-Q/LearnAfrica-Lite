import { Filter, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/utils'

export default function FilterPanel({
  categories,
  difficulties,
  selectedCategory,
  selectedDifficulty,
  onCategoryChange,
  onDifficultyChange,
  onClear
}) {
  const hasFilters = selectedCategory !== 'All Categories' || selectedDifficulty !== 'All Levels'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map(difficulty => (
            <button
              key={difficulty}
              onClick={() => onDifficultyChange(difficulty)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                selectedDifficulty === difficulty
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
