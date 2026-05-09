import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { quizzes, courses } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function QuizPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Data fetching logic
  const quiz = quizzes.find(q => String(q.courseId) === String(courseId)) || quizzes[0]
  const course = courses.find(c => String(c.id) === String(quiz.courseId))
  const questions = quiz.questions

  // Fix: Exit path now leads back to the specific lesson
  const exitPath = `/learn/course/${courseId}/lesson/${lessonId}`

  const handleSelectAnswer = (answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    // Fix: Results path follows consistent lessonId routing
    navigate(`/learn/course/${courseId}/quiz/${lessonId}/results`, {
      state: {
        answers,
        questions,
        quizTitle: quiz.title,
        exitPath // Passing this so results page can also return to lesson
      }
    })
  }

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100
  const canSubmit = answeredCount === questions.length

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header - Optimized for mobile stacking */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex h-auto min-h-[56px] items-center justify-between px-4 py-2">
          <Link
            to={exitPath}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Exit</span>
          </Link>

          <div className="text-center px-2">
            <p className="text-sm font-bold leading-tight truncate max-w-[150px] sm:max-w-none">
              {quiz.title}
            </p>
            <p className="hidden sm:block text-xs text-muted-foreground">
              {course?.title}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">No limit</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-6 flex-1">
        {/* Question Navigator - Grid for better mobile layout */}
        <div className="mb-8 grid grid-cols-5 xs:grid-cols-6 sm:flex sm:flex-wrap justify-center gap-2">
          {questions.map((_, index) => {
            const isCurrent = currentQuestion === index
            const isAnswered = answers[index] !== undefined
            
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all",
                  isCurrent 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110 z-10" 
                    : isAnswered 
                    ? "bg-success/10 text-success border border-success/30" 
                    : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {index + 1}
                {isAnswered && !isCurrent && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 bg-background rounded-full fill-success text-white" />
                )}
              </button>
            )
          })}
        </div>

        {/* Question Card */}
        <Card className="relative overflow-hidden border-none shadow-xl shadow-foreground/5">
          <div className="p-5 sm:p-10">
            <QuizQuestion
              question={questions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestion]}
              onSelectAnswer={handleSelectAnswer}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Previous</span>
              </Button>

              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {currentQuestion + 1} of {questions.length}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!canSubmit}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 px-6 shadow-lg shadow-primary/20"
                >
                  Submit
                </Button>
              ) : (
                <Button onClick={handleNext} size="sm" className="gap-1">
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Warning Footer */}
        {!canSubmit && currentQuestion === questions.length - 1 && (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/20 p-4 text-sm text-warning-foreground animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
            <p className="font-medium leading-tight">
              Please answer all {questions.length} questions to complete the quiz and view your results.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}