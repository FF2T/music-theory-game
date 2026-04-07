/**
 * @param {{ value: number, max: number, label?: string, colorClass?: string }} props
 */
export function ProgressBar({ value, max, label, colorClass = 'bg-primary-500' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
