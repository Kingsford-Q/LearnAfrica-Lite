import { useState } from 'react'
import { 
  BookOpen, Layout, X, ChevronRight, Plus, 
  GripVertical, Video, HelpCircle, Clock, 
  Link as LinkIcon, Trash2, ChevronDown, ChevronUp,
  Award, Infinity as LifetimeIcon, Download, Image as ImageIcon,
  CheckCircle2, Circle
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardContent } from '@/components/common/Card'
import { Switch } from '@/components/common/Switch'

export function CurriculumSection({ 
  sections = [], 
  coursePerks = { hasCertificate: false, lifetimeAccess: true, hasResources: false }, 
  updateCoursePerks = () => {}, 
  addSection = () => {}, 
  addLesson = () => {}, 
  removeSection = () => {}, 
  updateSectionTitle = () => {}, 
  updateLesson = () => {}, 
  removeLesson = () => {}, 
  onBack = () => {}, 
  onNext = () => {} 
}) {
  const safeSections = sections || [];
  const perks = coursePerks || { hasCertificate: false, lifetimeAccess: false, hasResources: false };

  const totalLessons = safeSections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0)
  const videoCount = safeSections.reduce((acc, sec) => 
    acc + (sec.lessons?.filter(l => l.type === 'video').length || 0), 0
  )

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="space-y-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={BookOpen} label="Total Lessons" value={totalLessons} />
          <StatCard icon={Video} label="Videos" value={videoCount} />
          <StatCard icon={Layout} label="Sections" value={safeSections.length} />
        </div>

        {/* Section List */}
        {safeSections.map((section, index) => (
          <Card key={section.id} className="border-border shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border bg-muted/10 p-4 flex flex-row items-center justify-between">
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Section {index + 1}</span>
                <input 
                  value={section.title || ''}
                  onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                  className="bg-transparent border-none text-sm font-bold focus:ring-0 p-0 w-full outline-none text-foreground placeholder:text-muted-foreground/40"
                  placeholder="e.g., Module 1: Introduction"
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeSection(section.id)} 
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                {section.lessons?.map((item, iIndex) => (
                  <CurriculumItemEditor 
                    key={item.id} 
                    item={item} 
                    index={iIndex}
                    onUpdate={(data) => updateLesson(section.id, item.id, data)}
                    onRemove={() => removeLesson(section.id, item.id)}
                  />
                ))}
              </div>

              {/* Add Buttons with variant="outline" */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addLesson(section.id, 'video')}
                  className="border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-[10px] font-bold uppercase h-11"
                >
                  <Plus className="h-3.5 w-3.5 mr-2 text-primary" /> Add Lesson
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addLesson(section.id, 'quiz')}
                  className="border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-[10px] font-bold uppercase h-11"
                >
                  <HelpCircle className="h-3.5 w-3.5 mr-2 text-primary" /> Add Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Course Perks - Fixed [object Object] by ensuring boolean toggle */}
        <Card className="p-6 border-primary/20 bg-primary/5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Course Perks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PerkToggle 
              icon={Award} 
              label="Certificate" 
              checked={perks.hasCertificate}
              onChange={(val) => updateCoursePerks({ ...perks, hasCertificate: val })}
            />
            <PerkToggle 
              icon={LifetimeIcon} 
              label="Lifetime Access" 
              checked={perks.lifetimeAccess}
              onChange={(val) => updateCoursePerks({ ...perks, lifetimeAccess: val })}
            />
            <PerkToggle 
              icon={Download} 
              label="Resources" 
              checked={perks.hasResources}
              onChange={(val) => updateCoursePerks({ ...perks, hasResources: val })}
            />
          </div>
        </Card>
        
        {/* Global Navigation */}
        <div className="flex flex-col gap-4 pt-6 border-t border-border">
          <Button 
            onClick={addSection} 
            variant="outline" 
            className="w-full h-14 border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 text-xs font-bold uppercase transition-all"
          >
            <Layout className="h-4 w-4 mr-2" /> Add New Section
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={onBack} className="flex-1 h-12 text-xs font-bold uppercase hover:bg-muted">
              Back to Fundamentals
            </Button>
            <Button onClick={onNext} className="flex-1 h-12 text-xs font-bold uppercase tracking-widest shadow-lg">
              Next: Pricing & SEO <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CurriculumItemEditor({ item, index, onUpdate, onRemove }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border/50 bg-background overflow-hidden shadow-sm transition-all hover:border-primary/30">
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer select-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border border-border text-[10px] font-bold text-muted-foreground">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {item.title || (item.type === 'quiz' ? 'New Quiz' : 'New Lesson')}
          </p>
          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
            item.type === 'quiz' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
          }`}>
            {item.type}
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {isOpen && (
        <div className="p-4 bg-muted/5 border-t border-border space-y-4 animate-in slide-in-from-top-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Title</label>
            <input 
              value={item.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g., Lesson Title"
            />
          </div>

          {item.type === 'video' ? (
            <div className="space-y-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Video URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-3 w-3 text-muted-foreground" />
                  <input 
                    value={item.videoUrl || ''}
                    onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Lesson Notes</label>
                <textarea
                  value={item.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none min-h-[100px] resize-none leading-relaxed"
                  placeholder="Provide detailed notes for this lesson..."
                />
              </div>
              <ResourcesEditor item={item} onUpdate={onUpdate} />
            </div>
          ) : (
            <QuizEditor item={item} onUpdate={onUpdate} />
          )}

          <div className="pt-2 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove {item.type === 'quiz' ? 'Quiz' : 'Lesson'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function QuizEditor({ item, onUpdate }) {
  const questions = item.questions || [];

  const addQuestion = () => {
    const newQuestion = { 
      id: Date.now(), 
      text: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0, 
      image: null 
    };
    onUpdate({ questions: [...questions, newQuestion] });
  };

  const updateQuestion = (qId, data) => {
    onUpdate({
      questions: questions.map(q => q.id === qId ? { ...q, ...data } : q)
    });
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={q.id} className="p-4 rounded-xl border border-border bg-background space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-[10px] font-black text-primary uppercase">Question {qIndex + 1}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
              onClick={() => onUpdate({ questions: questions.filter(item => item.id !== q.id) })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-muted-foreground">Question Text</label>
            <input 
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="What is the result of...?"
            />
          </div>

          {/* Image Upload for Quiz */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-muted-foreground">Question Image (Optional)</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer relative">
              <ImageIcon className="h-5 w-5 text-muted-foreground/40 mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground">Click to upload image</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase text-muted-foreground">Options (Select the correct one)</label>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2 group">
                  <button 
                    type="button"
                    onClick={() => updateQuestion(q.id, { correctAnswer: oIndex })}
                    className="shrink-0 transition-transform active:scale-90"
                  >
                    {q.correctAnswer === oIndex ? 
                      <CheckCircle2 className="h-5 w-5 text-green-500 shadow-sm" /> : 
                      <Circle className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/40" />
                    }
                  </button>
                  <input 
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[oIndex] = e.target.value;
                      updateQuestion(q.id, { options: newOpts });
                    }}
                    className={`flex-1 bg-muted/10 border text-xs px-3 py-2 rounded-lg outline-none transition-all ${
                      q.correctAnswer === oIndex ? 'border-green-500/50 bg-green-500/5' : 'border-border focus:border-primary/40'
                    }`}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full h-10 border-dashed border-primary/30 text-primary hover:bg-primary/5 text-[10px] font-bold uppercase"
        onClick={addQuestion}
      >
        <Plus className="h-3.5 w-3.5 mr-2" /> Add Question to Quiz
      </Button>
    </div>
  )
}

function ResourcesEditor({ item, onUpdate }) {
  const resources = item.resources || [];

  const addResource = () => {
    onUpdate({ resources: [...resources, { id: Date.now(), title: '', url: '', type: 0 }] });
  };

  const updateResource = (id, data) => {
    onUpdate({ resources: resources.map(r => r.id === id ? { ...r, ...data } : r) });
  };

  const removeResource = (id) => {
    onUpdate({ resources: resources.filter(r => r.id !== id) });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Resources</label>
      <div className="space-y-2">
        {resources.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={r.title}
              onChange={(e) => updateResource(r.id, { title: e.target.value })}
              className="w-2/5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none"
              placeholder="Resource name"
            />
            <input
              value={r.url}
              onChange={(e) => updateResource(r.id, { url: e.target.value })}
              className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none"
              placeholder="https://..."
            />
            <button type="button" onClick={() => removeResource(r.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full h-9 border-dashed text-[10px] font-bold uppercase mt-1"
        onClick={addResource}
      >
        <Plus className="h-3.5 w-3.5 mr-2" /> Add Resource
      </Button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-muted/5 border border-border p-3 rounded-xl flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function PerkToggle({ icon: Icon, label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-tight text-foreground">{label}</span>
      </div>
      <Switch checked={checked} onChange={(val) => onChange(val)} />
    </div>
  )
}