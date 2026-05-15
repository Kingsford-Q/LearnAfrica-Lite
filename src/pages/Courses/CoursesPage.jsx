import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import { Grid3X3, List, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { SearchBar } from '@/components/course/SearchBar'
import { categories, difficulties } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { CourseCardSkeleton } from '@/components/common/LoadingSkeleton'

// Lazy loaded components
const CourseCard = lazy(() => import('@/components/course/CourseCard'))
const FilterPanel = lazy(() => import('@/components/course/FilterPanel'))

// Hook for responsive items per page
const useResponsiveItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(12)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(6) // Small screens
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(8) // Medium screens
      } else {
        setItemsPerPage(12) // Desktop
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return itemsPerPage
}

export function CoursesPage() {
  const { courses: liveCourses } = useAuth()
  const itemsPerPage = useResponsiveItemsPerPage()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredCourses = useMemo(() => {
    let result = [...liveCourses];

    // 1. SEARCH BAR FILTER (Always applies if query exists)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(course => {
        const titleMatch = course.title.toLowerCase().includes(query);
        const descMatch = course.description.toLowerCase().includes(query);
        const instructorMatch = course.instructor.toLowerCase().includes(query);
        const categoryMatch = course.category.toLowerCase().includes(query);
        const tagMatch = course.tags.some(tag => tag.toLowerCase().includes(query));

        return titleMatch || descMatch || instructorMatch || categoryMatch || tagMatch;
      });
    }

    // 2. CATEGORY FILTER (Applies on top of search results)
    if (selectedCategory !== 'All Categories') {
      const categoryQuery = selectedCategory.toLowerCase().trim();
      
      result = result.filter(course => {
        // Direct Match
        const isDirectMatch = course.category === selectedCategory;

        // Deep Fuzzy Match (Title, Tags, and Description)
        const isTitleMatch = course.title.toLowerCase().includes(categoryQuery);
        const isDescriptionMatch = course.description.toLowerCase().includes(categoryQuery);
        const isTagMatch = course.tags.some(tag => tag.toLowerCase().includes(categoryQuery));

        // Others Safety Net
        if (selectedCategory === 'Others') {
          const isExplicitlyOther = course.category === 'Others';
          const isNotInMainList = !categories.includes(course.category);
          return isExplicitlyOther || isNotInMainList;
        }

        return isDirectMatch || isTitleMatch || isTagMatch || isDescriptionMatch;
      });
    }

    // 3. DIFFICULTY FILTER
    if (selectedDifficulty !== 'All Levels') {
      result = result.filter(course => course.difficulty === selectedDifficulty);
    }

    // 4. SORTING LOGIC (Keep your existing switch statement here...)
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => {
          const aActive = (a.progress > 0 && a.progress < 100) ? 1 : 0;
          const bActive = (b.progress > 0 && b.progress < 100) ? 1 : 0;
          if (aActive !== bActive) return bActive - aActive;
          if (a.progress < 100 && b.progress < 100) {
            if (b.enrollments !== a.enrollments) return b.enrollments - a.enrollments;
          }
          const aDone = a.progress === 100 ? 1 : 0;
          const bDone = b.progress === 100 ? 1 : 0;
          if (aDone !== bDone) return aDone - bDone;
          return b.enrollments - a.enrollments;
        });
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [liveCourses, searchQuery, selectedCategory, selectedDifficulty, sortBy, categories]);

  // Improved Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage))
  
  const paginatedCourses = useMemo(() => {
    // Ensure we don't calculate based on a page that doesn't exist anymore after resize/filter
    const safePage = Math.min(currentPage, totalPages)
    const startIdx = (safePage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return filteredCourses.slice(startIdx, endIdx)
  }, [filteredCourses, currentPage, itemsPerPage, totalPages])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [liveCourses, searchQuery, selectedCategory, selectedDifficulty, sortBy])

  const clearFilters = () => {
    setSelectedCategory('All Categories')
    setSelectedDifficulty('All Levels')
    setSearchQuery('')
  }

  const renderSkeletons = () => (
    <div className={cn('gap-6', viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col')}>
      {[...Array(6)].map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )

  // Helper to render page numbers with ellipsis
  const renderPageNumbers = () => {
    const pages = []
    const showMax = window.innerWidth < 640 ? 3 : 5

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={cn(
              'h-10 min-w-[40px] rounded-lg text-sm font-medium transition-all active:scale-95',
              currentPage === i
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border border-input hover:bg-accent'
            )}
          >
            {i}
          </button>
        )
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(<span key={`ellipsis-${i}`} className="text-muted-foreground px-1">...</span>)
      }
    }
    return pages
  }

  const suggestedTags = useMemo(() => {
    if (!searchQuery) return [];

    // 1. Find all courses that belong to the current selected category
    const categoryCourses = liveCourses.filter(c => 
      selectedCategory === 'All Categories' || c.category === selectedCategory
    );

    // 2. Get all tags from those courses
    const allTags = categoryCourses.flatMap(c => c.tags);

    // 3. Count occurrences to find "Most Popular" in this category
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    // 4. Sort by popularity and pick top 6
    return Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 6);
  }, [liveCourses, searchQuery, selectedCategory]);

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
        <aside className={cn('lg:w-64 shrink-0 space-y-6', showFilters ? 'block' : 'hidden lg:block')}>
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

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCourses.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
            </p>
          </div>

          <Suspense fallback={renderSkeletons()}>
            {isLoading ? (
              renderSkeletons()
            ) : filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No direct matches found</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                    We couldn't find anything matching "{searchQuery || 'your filters'}". 
                    Try one of these popular topics instead:
                  </p>

                  {/* Suggested Tags Area */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md">
                    {suggestedTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium hover:bg-primary hover:text-white transition-all active:scale-95"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              ) : (
              <>
                <div className={cn('gap-6', viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col')}>
                  {paginatedCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled={course.progress > 0}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>

                {/* Optimized Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2 sm:gap-4">
                    
                    {/* Previous Button - Icon only on mobile */}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-10 px-2 sm:px-4 rounded-xl flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {renderPageNumbers()}
                    </div>

                    {/* Next Button - Icon only on mobile */}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-10 px-2 sm:px-4 rounded-xl flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}