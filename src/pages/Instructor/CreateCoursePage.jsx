import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, X, Info, Layout, BookOpen, Settings, ChevronRight, Save
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Input, Textarea, Label } from '@/components/common/Input'
import { categories, difficulties } from '@/data/mockData'
import { cn } from '@/lib/utils'

// Hooks & Sub-components
import { useCurriculum } from '@/lib/useCurriculum'
import { CurriculumSection } from './CurriculumSection'

export function CreateCoursePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basics')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    price: '',
    thumbnail: null,
    thumbnailUrl: null
  })

  // ADDED: Course Perks State
  const [coursePerks, setCoursePerks] = useState({
    hasCertificate: false,
    lifetimeAccess: true,
    hasResources: false
  })

  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize Curriculum Hook
  const { 
    sections, 
    addSection, 
    addLesson, 
    removeSection, 
    updateSectionTitle,
    updateLesson, // Added from hook
    removeLesson  // Added from hook
  } = useCurriculum()

  const isBasicsComplete = formData.title && formData.description && formData.category && formData.difficulty;

  useEffect(() => {
    return () => {
      if (formData.thumbnailUrl) URL.revokeObjectURL(formData.thumbnailUrl)
    }
  }, [formData.thumbnailUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (formData.thumbnailUrl) URL.revokeObjectURL(formData.thumbnailUrl)
      setFormData(prev => ({ 
        ...prev, 
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file) 
      }))
    }
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    
    // Structure data for backend
    const finalCourseData = {
      ...formData,
      tags,
      perks: coursePerks,
      curriculum: sections
    }
    
    console.log("Submitting to backend:", finalCourseData)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    navigate('/instructor/dashboard')
  }

  const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";

  return (
    <div className="container mx-auto px-5 py-6 md:py-12 animate-in fade-in duration-500 font-sans max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Create New Course</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Provide the foundational details for your new course.
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto text-xs font-bold uppercase h-10 border-border/60">
          <Save className="h-3.5 w-3.5 mr-2" /> Save Draft
        </Button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-4 mb-6 no-scrollbar -mx-5 px-5">
        <div className="flex items-center gap-1 bg-muted/20 p-1.5 rounded-xl border border-border/40 w-max sm:w-full">
          <button 
            onClick={() => setActiveTab('basics')}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              activeTab === 'basics' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layout className="h-3.5 w-3.5" /> 1. Fundamentals
          </button>
          <button 
            disabled={!isBasicsComplete}
            onClick={() => setActiveTab('curriculum')}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap disabled:opacity-40",
              activeTab === 'curriculum' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" /> 2. Curriculum
          </button>
          <button 
            disabled={!isBasicsComplete}
            onClick={() => setActiveTab('finish')}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap disabled:opacity-40",
              activeTab === 'finish' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="h-3.5 w-3.5" /> 3. Pricing
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'basics' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-400">
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border bg-muted/5 py-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">General Information</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[10px] font-semibold uppercase text-muted-foreground/80">Course Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Digital Signal Processing" className="h-11 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-semibold uppercase text-muted-foreground/80">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="min-h-[140px] text-sm leading-relaxed" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-semibold uppercase text-muted-foreground/80">Category</Label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className={selectClassName}>
                      <option value="">Select...</option>
                      {categories.filter(c => c !== 'All Categories').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-semibold uppercase text-muted-foreground/80">Difficulty</Label>
                    <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange} className={selectClassName}>
                      <option value="">Select...</option>
                      {difficulties.filter(d => d !== 'All Levels').map(diff => <option key={diff} value={diff}>{diff}</option>)}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border bg-muted/5 py-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6">
                 <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary border border-primary/10">
                      {tag} <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add skill..." className="h-11 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)} />
                  <Button type="button" onClick={handleAddTag} className="h-11 px-5 text-[10px] font-bold uppercase">Add</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/5 py-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Course Media</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className={cn("relative group border-2 border-dashed border-border rounded-xl p-1 transition-all flex flex-col items-center justify-center aspect-video bg-muted/5 w-full sm:w-48 shrink-0", formData.thumbnailUrl ? "border-solid border-primary/20" : "hover:border-primary/30")}>
                  {formData.thumbnailUrl ? (
                    <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
                      <p className="text-[9px] font-bold uppercase text-foreground">Thumbnail</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                </div>
                
                <div className="flex flex-col gap-4 flex-1 w-full">
                  <p className="text-xs text-muted-foreground leading-relaxed text-center sm:text-left">
                    High quality visuals help your course stand out. Upload a 16:9 image.
                  </p>
                  <Button 
                    disabled={!isBasicsComplete} 
                    onClick={() => setActiveTab('curriculum')}
                    className="w-full h-11 text-xs font-bold uppercase tracking-widest"
                  >
                    Next: Curriculum <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 2: Curriculum Section */}
        {activeTab === 'curriculum' && (
          <CurriculumSection 
            sections={sections}
            coursePerks={coursePerks} // Passed from local state
            updateCoursePerks={setCoursePerks} // Passed setter
            addSection={addSection}
            addLesson={addLesson}
            removeSection={removeSection}
            updateSectionTitle={updateSectionTitle}
            updateLesson={updateLesson} // Passed from hook
            removeLesson={removeLesson} // Passed from hook
            onBack={() => setActiveTab('basics')}
            onNext={() => setActiveTab('finish')}
          />
        )}

        {/* STEP 3: Pricing Section */}
        {activeTab === 'finish' && (
          <Card className="border-border shadow-sm max-w-md mx-auto">
            <CardHeader className="border-b border-border bg-muted/5 py-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pricing & SEO</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs font-bold uppercase text-muted-foreground/80">Price (USD)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                  <input 
                    id="price" 
                    name="price" 
                    type="number" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    className="flex h-14 w-full rounded-md border border-input bg-background pl-10 pr-3 text-xl font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-xs font-bold uppercase tracking-widest">
                {isSubmitting ? "Finalizing..." : "Publish Course"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}