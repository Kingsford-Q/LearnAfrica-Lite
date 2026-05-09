import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { quizzes, courses } from '@/data/mockData'

export function QuizPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const quiz = quizzes.find(q => q.courseId === courseId) || quizzes[0]
  const course = courses.find(c => c.id === quiz.courseId)
  const questions = quiz.questions

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
    navigate(`/quiz/${courseId}/results`, {
      state: {
        answers,
        questions,
        quizTitle: quiz.title
      }
    })
  }

  const answeredCount = Object.keys(answers).length
  const canSubmit = answeredCount === questions.length

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            to={`/courses/${courseId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Exit Quiz</span>
          </Link>

          <div className="text-center">
            <p className="text-sm font-medium">{quiz.title}</p>
            <p className="text-xs text-muted-foreground">{course?.title}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>No time limit</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Question Navigator */}
        <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                currentQuestion === index
                  ? 'bg-primary text-primary-foreground'
                  : answers[index] !== undefined
                  ? 'bg-success text-primary-foreground'
                  : 'bg-card border border-border hover:bg-accent'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <Card className="p-6 md:p-8">
          <QuizQuestion
            question={questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion]}
            onSelectAnswer={handleSelectAnswer}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {answeredCount} of {questions.length} answered
            </div>

            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Warning */}
        {!canSubmit && currentQuestion === questions.length - 1 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 p-4 text-sm text-warning">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Please answer all questions before submitting the quiz.</p>
          </div>
        )}
      </div>
    </div>
  )
}
