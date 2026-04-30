export default function GapBadge({ score }) {
  const colour =
    score >= 75 ? 'bg-green-100 text-green-700 border-green-300' :
    score >= 45 ? 'bg-amber-100 text-amber-700 border-amber-300' :
                  'bg-red-100 text-red-700 border-red-300';

  const label =
    score >= 75 ? 'On Track' :
    score >= 45 ? 'Needs Attention' :
                  'Critical Gap';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-sm font-semibold ${colour}`}>
      <span className={`w-2 h-2 rounded-full ${
        score >= 75 ? 'bg-green-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-500'
      }`} />
      {score}% — {label}
    </div>
  );
}
