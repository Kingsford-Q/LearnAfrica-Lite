import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, X, Layout, BookOpen, Settings, ChevronRight, Save, Target, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Input, Textarea, Label } from '@/components/common/Input'
import { categories, difficulties } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { api } from '@/lib/apiClient'

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
    duration: '',
    price: '',
    thumbnail: null,
    thumbnailUrl: null
  })

  const [coursePerks, setCoursePerks] = useState({
    hasCertificate: false,
    lifetimeAccess: true,
    hasResources: false
  })

  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [learningOutcomes, setLearningOutcomes] = useState([])
  const [outcomeInput, setOutcomeInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitStep, setSubmitStep] = useState('')

  const {
    sections,
    addSection,
    addLesson,
    removeSection,
    updateSectionTitle,
    updateLesson,
    removeLesson
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

  const handleAddOutcome = (e) => {
    e.preventDefault()
    if (outcomeInput.trim()) {
      setLearningOutcomes(prev => [...prev, outcomeInput.trim()])
      setOutcomeInput('')
    }
  }

  const handleRemoveOutcome = (index) => {
    setLearningOutcomes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      let thumbnailUrl = null
      if (formData.thumbnail) {
        setSubmitStep('Uploading thumbnail...')
        const uploadForm = new FormData()
        uploadForm.append('file', formData.thumbnail)
        const { url } = await api.upload('/api/uploads', uploadForm)
        thumbnailUrl = url
      }

      setSubmitStep('Creating course...')
      const course = await api.post('/api/courses', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: formData.duration || '',
        language: 'English',
        price: Number(formData.price) || 0,
        isFree: !Number(formData.price),
        tags,
        learningOutcomes,
        hasCertificate: coursePerks.hasCertificate,
        hasLifetimeAccess: coursePerks.lifetimeAccess,
        hasResources: coursePerks.hasResources,
        thumbnail: thumbnailUrl,
      })

      setSubmitStep('Building curriculum...')
      for (let sIndex = 0; sIndex < sections.length; sIndex++) {
        const section = sections[sIndex]
        const createdSection = await api.post(`/api/courses/${course.id}/sections`, {
          title: section.title || `Section ${sIndex + 1}`,
          order: sIndex,
        })

        for (let iIndex = 0; iIndex < section.lessons.length; iIndex++) {
          const item = section.lessons[iIndex]

          if (item.type === 'quiz') {
            const questions = (item.questions || [])
              .filter(q => q.text?.trim())
              .map((q, qIndex) => ({
                text: q.text,
                imageUrl: null,
                order: qIndex,
                options: (q.options || []).map((opt, oIndex) => ({
                  text: opt,
                  isCorrect: oIndex === q.correctAnswer,
                  order: oIndex,
                })),
              }))

            if (questions.length > 0) {
              await api.post(`/api/sections/${createdSection.id}/quizzes`, {
                title: item.title || 'Quiz',
                durationSeconds: 180,
                order: iIndex,
                lessonId: null,
                questions,
              })
            }
          } else {
            const lesson = await api.post(`/api/sections/${createdSection.id}/lessons`, {
              title: item.title || 'Untitled Lesson',
              description: '',
              duration: '',
              videoUrl: item.videoUrl || null,
              content: item.content || '',
              order: iIndex,
            })

            for (const resource of item.resources || []) {
              if (resource.title?.trim() && resource.url?.trim()) {
                await api.post(`/api/lessons/${lesson.id}/resources`, {
                  title: resource.title,
                  url: resource.url,
                  type: resource.type ?? 0,
                })
              }
            }
          }
        }
      }

      setSubmitStep('Publishing...')
      await api.post(`/api/courses/${course.id}/publish`)

      navigate('/instructor/courses')
    } catch (err) {
      setSubmitError(err.message || 'Failed to create course. Please try again.')
    } finally {
      setIsSubmitting(false)
      setSubmitStep('')
    }
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
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
        </div>
      )}

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
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-[10px] font-semibold uppercase text-muted-foreground/80">Duration</Label>
                  <Input id="duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 8 weeks" className="h-11 text-sm" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border bg-muted/5 py-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" /> What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6">
                <div className="space-y-2 mb-4">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/20 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm">{outcome}</span>
                      <X className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleRemoveOutcome(index)} />
                    </div>
                  ))}
                  {learningOutcomes.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Add a few outcomes students will walk away with.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input value={outcomeInput} onChange={(e) => setOutcomeInput(e.target.value)} placeholder="e.g., Build a REST API from scratch" className="h-11 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddOutcome(e)} />
                  <Button type="button" onClick={handleAddOutcome} className="h-11 px-5 text-[10px] font-bold uppercase">Add</Button>
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
                    <img src={formData.thumbnailUrl} alt ="Preview" loading="lazy" className="w-full h-full object-cover rounded-lg" />
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
                <p className="text-[11px] text-muted-foreground">Leave at 0 for a free course.</p>
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-xs font-bold uppercase tracking-widest">
                {isSubmitting ? (submitStep || "Finalizing...") : "Publish Course"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
