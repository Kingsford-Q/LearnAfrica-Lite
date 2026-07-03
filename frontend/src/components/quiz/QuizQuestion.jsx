import { cn } from '@/lib/utils'
import { fileUrl } from '@/lib/apiClient'

// question shape: { id, text, imageUrl, options: [{ id, text }] }
// selectedAnswer: optionId string | undefined
// onSelectAnswer: (optionId) => void
export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
}) {
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="font-medium">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
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
        {question.imageUrl && (
          <img
            src={fileUrl(question.imageUrl)}
            alt="Question illustration"
            className="rounded-lg max-h-64 object-contain mx-auto"
          />
        )}
        <h2 className="text-xl font-semibold">{question.text}</h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.id

            return (
              <button
                key={option.id}
                onClick={() => onSelectAnswer(option.id)}
                className={cn(
                  'w-full rounded-xl border-2 p-4 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option.text}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
