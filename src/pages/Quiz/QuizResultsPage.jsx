import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { cn } from '@/lib/utils'

export function QuizResultsPage() {
  const { courseId, lessonId } = useParams()
  const location = useLocation()
  
  // State for backend data
  const [resultData, setResultData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadResults = async () => {
      // 1. Check if we already have the data from navigation (state)
      if (location.state?.answers && location.state?.questions) {
        setResultData(location.state)
        setIsLoading(false)
        return
      }

      // 2. If no state (user refreshed), fetch from the backend
      try {
        setIsLoading(true)
        // Replace with your actual API call: e.g., fetch(`/api/quiz/results/${lessonId}`)
        // const response = await api.get(`/quiz/results/${lessonId}`)
        // setResultData(response.data)
        
        // Simulating a failed fetch for now since we're in dev
        throw new Error("No active session found") 
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [location.state, lessonId])

  // Calculation Logic using resultData
  const answers = resultData?.answers || {}
  const questions = resultData?.questions || []
  
  let correctCount = 0
  questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      correctCount++
    }
  })

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  const passed = score >= 70

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error/No Data State
  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Results Found</h2>
            <p className="text-muted-foreground text-sm">
              We couldn't find your quiz results. This happens if you refresh the page without saving.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/learn/course/${courseId}/quiz/${lessonId}`}>Try Quiz Again</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Results Header */}
        <Card className="p-8 text-center mb-8">
          <div
            className={cn(
              'mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full',
              passed ? 'bg-success/10' : 'bg-destructive/10'
            )}
          >
            {passed ? (
              <Trophy className="h-12 w-12 text-success" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed
              ? 'You have successfully passed the quiz.'
              : 'You need 70% to pass. Review the lessons and try again.'}
          </p>

          {/* Score Circle */}
          <div className="relative mx-auto mb-6 h-40 w-40">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.83} 283`}
                className={passed ? 'text-success' : 'text-destructive'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{score}%</span>
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{correctCount}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">
                {questions.length - correctCount}
              </p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={`/learn/course/${courseId}/quiz/${lessonId}`}>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4" />
                Retry Quiz
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button>
                Back to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Review Answers</h2>
          
          {questions.map((question, index) => {
            const isCorrect = answers[index] === question.correctAnswer
            
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-0.5',
                      isCorrect ? 'bg-success/10' : 'bg-destructive/10'
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <p className="font-semibold mb-4 leading-tight">
                      Question {index + 1}: {question.question}
                    </p>
                    
                    <div className="grid gap-3">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={cn(
                            'rounded-lg p-3.5 text-sm transition-all flex items-center justify-between gap-4',
                            optIndex === question.correctAnswer
                              ? 'bg-success/10 border border-success'
                              : optIndex === answers[index] && !isCorrect
                              ? 'bg-destructive/10 border border-destructive'
                              : 'bg-muted border border-transparent'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-bold opacity-70 shrink-0">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="leading-relaxed">{option}</span>
                          </div>

                          <div className="shrink-0">
                            {optIndex === question.correctAnswer && (
                              <CheckCircle className="h-5 w-5 text-success" />
                            )}
                            {optIndex === answers[index] && optIndex !== question.correctAnswer && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}