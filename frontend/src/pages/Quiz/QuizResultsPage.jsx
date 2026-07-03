import { useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowLeft, AlertCircle, Loader2, FileCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

// quizResult shape (QuizResultDto from backend):
//   { score, correctCount, totalQuestions, answers: [{ questionId, selectedOptionId, correctOptionId, isCorrect }] }
// questions shape (QuizQuestionDto[] passed from QuizPage):
//   [{ id, text, imageUrl, options: [{ id, text }] }]

export function QuizResultsPage() {
  const { courseId, quizId } = useParams()
  const location = useLocation()
  const { courses, refreshStats, refreshBadges, refreshEnrollments } = useAuth()

  const { quizResult, questions = [], quizTitle } = location.state ?? {}

  // Refresh stats/badges/enrollments once so badge unlocks and course
  // progress reflect immediately instead of waiting on the 30s background poll.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refreshStats(); refreshBadges(); refreshEnrollments() }, [])

  if (!quizResult) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Results Found</h2>
            <p className="text-muted-foreground text-sm">
              Results aren't available after a page refresh. Try the quiz again.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/learn/course/${courseId}/quiz/${quizId}`}>Try Quiz Again</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const { score, correctCount, totalQuestions, answers: resultAnswers = [] } = quizResult
  const passed = score >= 70

  const currentCourse = courses?.find((c) => c.id === courseId)
  const hasCertificate = !!(currentCourse?.hasCertificate)

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Results Header */}
        <Card className="p-8 text-center mb-8">
          <div
            className={cn(
              'mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full',
              passed ? 'bg-success/10' : 'bg-destructive/10',
            )}
          >
            {passed ? (
              <Trophy className="h-12 w-12 text-success" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>

          <h1 className="text-xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed
              ? 'You passed the quiz!'
              : 'You need 70% to pass. Review the lessons and try again.'}
          </p>

          {/* Score Circle */}
          <div className="relative mx-auto mb-6 h-40 w-40">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none" stroke="currentColor" strokeWidth="10"
                className="text-muted"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none" stroke="currentColor" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.83} 283`}
                className={passed ? 'text-success' : 'text-destructive'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{score}%</span>
              <span className="text-md text-muted-foreground">Score</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{correctCount}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{totalQuestions - correctCount}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {passed && hasCertificate ? (
              <Link to={`/certificate/${courseId}`}>
                <Button className="bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20">
                  <FileCheck className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              </Link>
            ) : (
              <Link to={`/learn/course/${courseId}/quiz/${quizId}`}>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Quiz
                </Button>
              </Link>
            )}
            <Link to="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>

        {/* Question Review */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Review Answers</h2>

            {questions.map((question, index) => {
              const answerResult = resultAnswers.find((a) => a.questionId === question.id)
              const isCorrect = answerResult?.isCorrect ?? false

              return (
                <Card key={question.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-0.5',
                        isCorrect ? 'bg-success/10' : 'bg-destructive/10',
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
                        Question {index + 1}: {question.text}
                      </p>

                      <div className="grid gap-3">
                        {question.options.map((option, optIndex) => {
                          const isThisCorrect = option.id === answerResult?.correctOptionId
                          const isThisSelected = option.id === answerResult?.selectedOptionId

                          return (
                            <div
                              key={option.id}
                              className={cn(
                                'rounded-lg p-3.5 text-sm flex items-center justify-between gap-4',
                                isThisCorrect
                                  ? 'bg-success/10 border border-success'
                                  : isThisSelected && !isThisCorrect
                                  ? 'bg-destructive/10 border border-destructive'
                                  : 'bg-muted border border-transparent',
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-bold opacity-70 shrink-0">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span className="leading-relaxed">{option.text}</span>
                              </div>
                              <div className="shrink-0">
                                {isThisCorrect && <CheckCircle className="h-5 w-5 text-success" />}
                                {isThisSelected && !isThisCorrect && (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
