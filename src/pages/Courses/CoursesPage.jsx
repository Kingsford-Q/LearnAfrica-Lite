import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import { Grid3X3, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { SearchBar } from '@/components/course/SearchBar'
import { categories, difficulties } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { CourseCardSkeleton } from '@/components/common/LoadingSkeleton'

// Lazy loaded components
const CourseCard = lazy(() => import('@/components/course/CourseCard'))
const FilterPanel = lazy(() => import('@/components/course/FilterPanel'))

export function CoursesPage() {
  const { courses: liveCourses } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredCourses = useMemo(() => {
    let result = [...liveCourses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        course =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      result = result.filter(course => course.category === selectedCategory)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All Levels') {
      result = result.filter(course => course.difficulty === selectedDifficulty)
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.enrollments - a.enrollments)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  }, [liveCourses, searchQuery, selectedCategory, selectedDifficulty, sortBy])

  const clearFilters = () => {
    setSelectedCategory('All Categories')
    setSelectedDifficulty('All Levels')
    setSearchQuery('')
  }

  const renderSkeletons = () => (
    <div
      className={cn(
        'gap-6',
        viewMode === 'grid'
          ? 'grid md:grid-cols-2 xl:grid-cols-3'
          : 'flex flex-col'
      )}
    >
      {[...Array(6)].map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Courses</h1>
        <p className="text-muted-foreground">
          Discover {liveCourses.length}+ courses to boost your skills
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for courses, topics, or instructors..."
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center rounded-lg border border-input p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside
          className={cn(
            'lg:w-64 shrink-0 space-y-6',
            showFilters ? 'block' : 'hidden lg:block'
          )}
        >
          <Suspense fallback={<div className="h-64 w-full bg-muted animate-pulse rounded-xl" />}>
            <FilterPanel
              categories={categories}
              difficulties={difficulties}
              selectedCategory={selectedCategory}
              selectedDifficulty={selectedDifficulty}
              onCategoryChange={setSelectedCategory}
              onDifficultyChange={setSelectedDifficulty}
              onClear={clearFilters}
            />
          </Suspense>
        </aside>

        {/* Course Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCourses.length} courses
            </p>
          </div>

          <Suspense fallback={renderSkeletons()}>
            {isLoading ? (
              renderSkeletons()
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'gap-6',
                  viewMode === 'grid'
                    ? 'grid md:grid-cols-2 xl:grid-cols-3'
                    : 'flex flex-col'
                )}
              >
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrolled={course.progress > 0}
                  />
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}