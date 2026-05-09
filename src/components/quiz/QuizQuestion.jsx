import { cn } from '@/lib/utils'

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  correctAnswer
}) {
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Question {questionNumber} of {totalQuestions}</span>
          <span className="font-medium">{Math.round((questionNumber / totalQuestions) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{question.question}</h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = correctAnswer === index
            const showCorrectness = showResult

            return (
              <button
                key={index}
                onClick={() => !showResult && onSelectAnswer(index)}
                disabled={showResult}
                className={cn(
                  'w-full rounded-xl border-2 p-4 text-left transition-all',
                  !showCorrectness && isSelected
                    ? 'border-primary bg-primary/5'
                    : !showCorrectness
                    ? 'border-border hover:border-primary/50'
                    : isCorrect
                    ? 'border-success bg-success/10'
                    : isSelected && !isCorrect
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                      !showCorrectness && isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : !showCorrectness
                        ? 'border-muted-foreground/30'
                        : isCorrect
                        ? 'border-success bg-success text-primary-foreground'
                        : isSelected && !isCorrect
                        ? 'border-destructive bg-destructive text-destructive-foreground'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
