import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play, 
  FileText,
  MessageSquare,
  BookOpen,
  Clock,
  Menu,
  X,
  Save,
  Lock,
  FolderOpen,
  ExternalLink, 
  Download, 
  Image as ImageIcon, 
  File,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const DiscussionForum = lazy(() => Promise.resolve({ default: () => <div className="p-12 text-center italic">Forum Loading...</div> }));

const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle standard watch links: youtube.com/watch?v=VIDEO_ID
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle shortened links: youtu.be/VIDEO_ID
    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop().split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url; // Return as is if it's already an embed link or other source
  };

export function LessonPage() {
  const { user, courses, lessons, updateProgress } = useAuth() // Pull stateful data
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [isCompleted, setIsCompleted] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [userNotes, setUserNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'success'

  const course = useMemo(() => 
      courses.find(c => String(c.id) === String(courseId)), 
    [courseId, courses])
  
  const courseLessons = useMemo(() => 
    lessons.filter(l => String(l.courseId) === String(courseId)),
  [courseId, lessons])
  
  // 3. Find the specific lesson
  const lesson = useMemo(() => 
    courseLessons.find(l => String(l.id) === String(lessonId)), 
  [courseLessons, lessonId])

  const resources = useMemo(() => lesson?.resources || [], [lesson]);


  // 4. Calculate indexes safely
  const currentIndex = lesson ? courseLessons.findIndex(l => String(l.id) === String(lesson.id)) : -1
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < courseLessons.length - 1 && currentIndex !== -1 ? courseLessons[currentIndex + 1] : null

  // 5. REVISED GUARD LOGIC - Strict linear progression
  const firstIncompleteIndex = courseLessons.findIndex(l => !l.isCompleted)
  const isAccessingIllegally = firstIncompleteIndex !== -1 && currentIndex > firstIncompleteIndex

  useEffect(() => {
    // Stop if the course has no lessons
    if (courseLessons.length === 0) return;

    if (!lesson) {
      const targetIndex = firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;
      const fallbackLesson = courseLessons[targetIndex];
      
      if (fallbackLesson) {
        navigate(`/learn/course/${courseId}/lesson/${fallbackLesson.id}`, { replace: true });
      }
      return;
    }

    if (isAccessingIllegally) {
      const correctLesson = courseLessons[firstIncompleteIndex];
      navigate(`/learn/course/${courseId}/lesson/${correctLesson.id}`, { replace: true });
    }

    if (!lessonId || !user?.id) return; // Ensure we have a user ID before trying to load notes

    // ✅ LOAD USER-SPECIFIC NOTES
    const storageKey = `notes_user_${user.id}_${courseId}_${lessonId}`;
    const savedNotes = localStorage.getItem(storageKey);
    
    if (savedNotes) {
      setUserNotes(savedNotes);
    } else {
      const fetchNotesFromBackend = async () => {
        try {
          // Reset state to empty if no user-specific notes exist locally
          setUserNotes(''); 
        } catch (err) {
          console.error("Failed to load backend notes", err);
        }
      };
      fetchNotesFromBackend();
    }

    setIsCompleted(lesson?.isCompleted || false);
    // Added user.id to dependency array to re-run when switching accounts
  }, [lessonId, isAccessingIllegally, navigate, courseId, courseLessons, firstIncompleteIndex, lesson, user?.id]);

  // UI GUARDS
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <Button variant="ghost" onClick={() => navigate('/courses')} className="mt-4">
            Back to Catalog
          </Button>
        </div>
      </div>
    )
  }

    const handleSaveNotes = async () => {
    if (!user?.id) return; // Defensive check to ensure a user is logged in

    setSaveStatus('saving');
    try {
      // Include user.id in the key to prevent data leakage between accounts
      const storageKey = `notes_user_${user.id}_${courseId}_${lessonId}`;
      localStorage.setItem(storageKey, userNotes);
      
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      setSaveStatus('success');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error("Save failed", error);
      setSaveStatus('idle');
    }
  };

  if (courseLessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
        <header className="border-b border-border bg-background/95 backdrop-blur p-4">
          <Link to="/courses" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Courses
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-10 text-center border-dashed bg-muted/20 backdrop-blur-sm">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center h-full w-full bg-background border border-border rounded-full">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-3">Curriculum Coming Soon</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Lessons for <span className="text-foreground font-bold">{course.title}</span> are currently being finalized.
            </p>
            <div className="space-y-3">
              <Button variant="primary" className="w-full font-bold uppercase tracking-widest text-xs h-12" onClick={() => navigate('/courses')}>
                Browse Other Courses
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (!lesson) return null;

  const isLastLesson = currentIndex === courseLessons.length - 1
  const currentLessonFinished = lesson.isCompleted || isCompleted
  const showQuizButton = isLastLesson && currentLessonFinished

  const handleMarkComplete = async () => {
  try {
    setIsSaving(true);
    // Directly call updateProgress; the context logic handles state and DB persistence
    await updateProgress(courseId, lessonId); 
    setIsCompleted(true);
  } catch (error) {
    console.error("Failed to update progress", error);
  } finally {
    setIsSaving(false);
  }
};

 const ResourceItem = ({ resource }) => {
  const { title, url, type, fileName } = resource;
  const isDownloadable = type === 'file' || type === 'image' || type === 'downloadable';

  // 1. Move the helper outside or keep it as a memoized value
  const getSafeFileName = (url, type, providedName) => {
    if (providedName) return providedName;
    
    // Extract extension from URL
    const extension = url.split('.').pop().split(/[?#]/)[0];
    const baseName = title.replace(/\s+/g, '_').toLowerCase();
    
    const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'zip'];
    if (validExtensions.includes(extension.toLowerCase())) {
      return `${baseName}.${extension}`;
    }
    
    const fallbacks = { image: 'jpg', file: 'pdf' };
    return `${baseName}.${fallbacks[type] || 'dat'}`;
  };

  // 2. Define the variable at the component level scope
  const finalFileName = getSafeFileName(url, type, fileName);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Fetch failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalFileName; // Now defined in scope
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', finalFileName);
      link.setAttribute('target', '_blank');
      link.click();
    }
  };

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  return (
    <div
      onClick={handleOpen}
      className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 hover:bg-card transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {type === 'image' && <ImageIcon className="h-5 w-5" />}
          {type === 'link' && <ExternalLink className="h-5 w-5" />}
          {type === 'file' && <File className="h-5 w-5" />}
        </div>
        
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{type}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        {type === 'link' ? (
          <div className="text-muted-foreground group-hover:text-primary transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        ) : (
          <button
            onClick={handleDownload}
            title={`Download ${finalFileName}`} // Correctly references scoped variable
            className="p-2 -mr-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

  const navBtnClass = "h-11 px-3 sm:px-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2 shrink-0"
  const takeQuizClass = "h-11 px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link 
              to={`/courses/${courseId}`}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Course</span>
            </Link>
            <div className="hidden md:block h-4 w-px bg-border" />
            <div className="hidden md:block">
              <p className="text-sm font-semibold truncate max-w-xs">{course?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tabular-nums text-muted-foreground bg-muted px-2 py-1 rounded">
              {currentIndex + 1} / {courseLessons.length}
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowSidebar(true)} className="lg:hidden h-9 w-9 p-0">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto outline-none">
          {/* Only render this entire block if a video source exists */}
{(lesson.videoUrl || lesson.videoFile) && (
  <div className="aspect-video w-full bg-slate-950 relative shadow-inner">
    {lesson.videoUrl ? (
      <iframe
        src={getEmbedUrl(lesson.videoUrl)}
        className="w-full h-full"
        allowFullScreen
        title={lesson.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    ) : (
      <video 
        key={lesson.videoFile} // Crucial: forces player to reload when source changes
        controls 
        className="w-full h-full object-cover"
        preload="metadata"
      >
        {/* Explicitly define the type in case the DB URL is a blob or signed link */}
        <source src={lesson.videoFile} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )}
  </div>
)}

          <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
            <div className="mb-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{lesson.duration}</span>
                </div>
                {currentLessonFinished && (
                  <span className="flex items-center gap-1.5 text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">{lesson.title}</h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">{lesson.description}</p>
            </div>

            <div className="border-b border-border mb-8 w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-4 sm:gap-10 overflow-x-auto no-scrollbar pb-px touch-pan-x scroll-smooth">
        
                {['content', 'resources', 'notes', 'discussion'].map(id => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'flex items-center gap-2 pb-4 text-sm font-bold transition-all whitespace-nowrap capitalize border-b-2 tracking-wide shrink-0',
                      activeTab === id 
                        ? 'border-primary text-primary translate-y-[1px]' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {id === 'content' && <FileText className="h-4 w-4 shrink-0" />}
                    {/* Added Folder icon for Resources */}
                    {id === 'resources' && <FolderOpen className="h-4 w-4 shrink-0" />} 
                    {id === 'notes' && <BookOpen className="h-4 w-4 shrink-0" />}
                    {id === 'discussion' && <MessageSquare className="h-4 w-4 shrink-0" />}
                    <span>{id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px] leading-relaxed">
              {activeTab === 'content' && (
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-7" 
                  dangerouslySetInnerHTML={{ __html: lesson.content }} 
                />
              )}
              {activeTab === 'resources' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-lg font-bold mb-4">Lesson Resources</h3>
                  {resources.length > 0 ? (
                    resources.map((res, index) => (
                      <ResourceItem key={index} resource={res} />
                    ))
                  ) : (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground">No resources available for this lesson.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'notes' && (
                <Card className="p-6 sm:p-8 border-dashed bg-muted/30 relative overflow-hidden">
                  
                  {/* Header Row: Title and Success Message Aligned */}
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <h3 className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                      Quick Notes
                    </h3>

                    {/* Success Message: Icon-only on mobile, Text + Icon on desktop */}
                    <div className={cn(
                      "flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-success/10 border border-success/20 transition-all duration-500",
                      saveStatus === 'success' ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    )}>
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      {/* 'hidden sm:inline' ensures the text disappears on small screens */}
                      <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-tight text-success whitespace-nowrap">
                        Saved to Cloud
                      </span>
                    </div>
                  </div>

                  <div className="relative group">
                    <textarea 
                      value={userNotes}
                      onChange={(e) => {
                        setUserNotes(e.target.value);
                        if (saveStatus === 'success') setSaveStatus('idle');
                      }}
                      placeholder="Type your study notes here..." 
                      className="w-full min-h-[220px] rounded-xl border border-input bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all mb-4 placeholder:text-muted-foreground/50" 
                    />
                    
                    {/* Logic for when the user hasn't typed anything */}
                    {!userNotes.trim() && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 transition-opacity group-focus-within:opacity-0">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Empty Workspace</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center items-center">
                    <Button 
                      onClick={handleSaveNotes}
                      // Disabled if saving or if notes are empty
                      disabled={saveStatus === 'saving' || !userNotes.trim()}
                      variant={saveStatus === 'success' ? "outline" : "primary"}
                      className={cn(
                        "font-bold uppercase tracking-wider text-[10px] sm:text-xs h-10 px-8 flex items-center gap-2 transition-all duration-300",
                        saveStatus === 'success' && "border-success text-success hover:bg-success/5",
                        !userNotes.trim() && "opacity-50 cursor-not-allowed grayscale"
                      )}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : saveStatus === 'success' ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Changes Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span>Save Session Notes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}
              {activeTab === 'discussion' && (
                <Suspense fallback={<div className="p-12 text-center">Loading Forum...</div>}>
                   <Card className="p-12 text-center border-dashed bg-muted/30">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Community Discussion</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Have a question about this lesson?</p>
                    <Link to = "#">
                      <Button variant="primary" size="sm" className="font-bold uppercase tracking-tighter">Enter Forum</Button>
                    </Link>
                  </Card>
                </Suspense>
              )}
            </div>

            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex justify-start">
                  {prevLesson && (
                    <Link to={`/learn/course/${courseId}/lesson/${prevLesson.id}`}>
                      <Button variant="outline" className={navBtnClass}>
                        <ChevronLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="flex-1 flex justify-center">
                  {!currentLessonFinished ? (
                    <Button 
                      variant="primary" 
                      onClick={handleMarkComplete} 
                      disabled={isSaving}
                      className="w-full max-w-[170px] h-11 font-bold uppercase tracking-widest text-[10px] sm:text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{isSaving ? "Saving..." : "Mark Complete"}</span>
                    </Button>
                  ) : (
                    <div className={cn(
                        "px-4 py-2 rounded-full bg-success/10 border border-success/20 flex items-center gap-2",
                        isLastLesson && "hidden sm:flex"
                    )}>
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      <span className="text-[10px] font-black uppercase tracking-tighter text-success">Finished</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex justify-end">
                  {showQuizButton ? (
                    <Link to={`/learn/course/${courseId}/quiz/${lessonId}`} className="w-full sm:w-auto">
                      <Button className={takeQuizClass}>
                        <span className="text-xs sm:text-sm">Take Quiz</span>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="outline" 
                      className={navBtnClass} 
                      // Use navigate programmatically for better control
                      onClick={() => nextLesson && navigate(`/learn/course/${courseId}/lesson/${nextLesson.id}`)}
                      disabled={!currentLessonFinished || !nextLesson}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className={cn('fixed inset-y-0 right-0 z-40 lg:z-30 w-full sm:w-80 border-l border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0', showSidebar ? 'translate-x-0' : 'translate-x-full')}>
          <div className="flex flex-col h-full shadow-2xl lg:shadow-none">
            <div className="flex items-center justify-between p-5 border-b lg:hidden">
              <h3 className="font-bold tracking-tight">Course Content</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)} className="h-8 w-8 p-0"><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 hidden lg:block text-muted-foreground">Lessons Plan</h3>
              <div className="space-y-1.5">
                {courseLessons.map((l, index) => {
                  const isLocked = courseLessons.slice(0, index).some(prev => !prev.isCompleted);
                  const isCurrent = String(l.id) === String(lesson.id);

                  return (
                    <Link
                      key={l.id}
                      to={isLocked ? '#' : `/learn/course/${courseId}/lesson/${l.id}`}
                      onClick={(e) => { 
                        if(isLocked) e.preventDefault();
                        else { setShowSidebar(false); }
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-3 text-sm transition-all group', 
                        isCurrent ? 'bg-primary text-primary-foreground shadow-lg' : isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'
                      )}
                    >
                      <div className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-xs font-black transition-colors', 
                        l.isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-white text-primary' : 'bg-muted group-hover:bg-background'
                      )}>
                        {l.isCompleted ? <CheckCircle className="h-4 w-4 stroke-[3px]" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold tracking-tight leading-tight">{l.title}</p>
                        <p className={cn('text-[10px] mt-0.5 font-medium opacity-70', isCurrent ? 'text-primary-foreground' : 'text-muted-foreground')}>{l.duration}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
        {showSidebar && <div className="fixed inset-0 z-10 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setShowSidebar(false)} />}
      </div>
    </div>
  )
}