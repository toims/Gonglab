export default function ProgressBar({ value, max = 100, showLabel = false }: { value: number; max?: number; showLabel?: boolean }) {
  const percent = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{value}/{max}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
