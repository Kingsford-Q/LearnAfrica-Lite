import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { api } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

export function QuizPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  // answers: { [questionIndex]: optionId (string) }
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    api.get(`/api/quizzes/${quizId}`)
      .then((data) => {
        setQuiz(data)
        if (data.durationSeconds > 0) {
          setTimeLeft(data.durationSeconds)
        }
      })
      .catch(() => setQuiz(null))
      .finally(() => setIsLoading(false))
  }, [quizId])

  const handleSubmit = useCallback(async () => {
    if (!quiz || isSubmitting) return
    setIsSubmitting(true)
    try {
      const requestBody = {
        // Unanswered questions (e.g. the timer ran out before every question was
        // answered) submit as an empty selection so they're graded as incorrect
        // rather than silently guessing an option on the student's behalf.
        answers: quiz.questions.map((q, i) => ({
          questionId: q.id,
          selectedOptionId: answers[i] ?? '00000000-0000-0000-0000-000000000000',
        })),
      }
      const quizResult = await api.post(`/api/quizzes/${quizId}/submit`, requestBody)
      navigate(`/learn/course/${courseId}/quiz/${quizId}/results`, {
        state: {
          quizResult,
          questions: quiz.questions,
          quizTitle: quiz.title,
          courseId,
          quizId,
        },
      })
    } catch {
      setIsSubmitting(false)
    }
  }, [quiz, answers, courseId, quizId, navigate, isSubmitting])

  // Timer countdown — auto-submits whatever's answered so far once time runs out.
  useEffect(() => {
    if (timeLeft === null || isSubmitting) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isSubmitting, handleSubmit])

  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return '00:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectAnswer = (optionId) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: optionId }))
  }

  const questions = quiz?.questions ?? []
  const answeredCount = Object.keys(answers).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0
  const canSubmit = answeredCount === questions.length && questions.length > 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <h3 className="text-lg font-bold">Quiz Not Found</h3>
          <p className="text-sm text-muted-foreground">
            We couldn't load this quiz. It may have been removed or the link is invalid.
          </p>
          <Button className="w-full" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex h-auto min-h-14 items-center justify-between px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:block">Exit</span>
          </button>

          <div className="text-center px-2">
            <p className="text-sm font-bold leading-tight truncate max-w-37.5 sm:max-w-none">
              {quiz.title}
            </p>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 text-[10px] sm:text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground',
              timeLeft !== null && timeLeft < 60 && 'text-destructive bg-destructive/10 animate-pulse',
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap font-mono">
              {timeLeft !== null ? formatTime(timeLeft) : 'No limit'}
            </span>
          </div>
        </div>

        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-6 flex-1">
        {/* Question navigation dots */}
        <div className="mb-8 grid grid-cols-5 xs:grid-cols-6 sm:flex sm:flex-wrap justify-center gap-2">
          {questions.map((_, index) => {
            const isCurrent = currentQuestion === index
            const isAnswered = answers[index] !== undefined

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all',
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110 z-10'
                    : isAnswered
                    ? 'bg-success/10 text-success border border-success/30'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/50',
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

        <Card className="relative overflow-hidden border-none shadow-xl shadow-foreground/5">
          <div className="p-5 sm:p-10">
            {questions.length > 0 && (
              <QuizQuestion
                question={questions[currentQuestion]}
                questionNumber={currentQuestion + 1}
                totalQuestions={questions.length}
                selectedAnswer={answers[currentQuestion]}
                onSelectAnswer={handleSelectAnswer}
              />
            )}

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
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
                  disabled={!canSubmit || isSubmitting}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 px-6 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion((p) => Math.min(questions.length - 1, p + 1))}
                  size="sm"
                  className="gap-1"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {!canSubmit && questions.length > 0 && currentQuestion === questions.length - 1 && (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/20 p-4 text-sm text-warning-foreground animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
            <p className="font-medium leading-tight">
              Please answer all {questions.length} questions to submit the quiz.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
