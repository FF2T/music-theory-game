import { CheckCircle, XCircle } from 'lucide-react'

/**
 * Overlay badge that appears after answering.
 * @param {{ feedback: 'correct'|'wrong'|null }} props
 */
export function FeedbackBadge({ feedback }) {
  if (!feedback) return null

  const isCorrect = feedback === 'correct'

  return (
    <div
      className={[
        'fixed inset-0 flex items-center justify-center pointer-events-none z-50',
        'animate-fade-in',
      ].join(' ')}
    >
      <div
        className={[
          'flex flex-col items-center gap-3 px-12 py-8 rounded-3xl glass',
          'animate-bounce-in',
          isCorrect ? 'border-green-500/40' : 'border-red-500/40',
        ].join(' ')}
      >
        {isCorrect ? (
          <CheckCircle className="w-16 h-16 text-green-400" strokeWidth={1.5} />
        ) : (
          <XCircle className="w-16 h-16 text-red-400" strokeWidth={1.5} />
        )}
        <span className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect ? 'Correct !' : 'Raté...'}
        </span>
      </div>
    </div>
  )
}
