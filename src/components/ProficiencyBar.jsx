import { proficiencyLabels } from '../data/mockData';

const colours = [
  'bg-gray-200',
  'bg-amber-400',
  'bg-yellow-400',
  'bg-vedanta-green',
  'bg-vedanta-blue',
];

export default function ProficiencyBar({ current, required, skillName }) {
  const pct = (current / 4) * 100;
  const reqPct = (required / 4) * 100;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-52 text-sm text-gray-700 truncate" title={skillName}>
        {skillName}
      </span>
      <div className="flex-1 relative h-2.5 bg-gray-100 rounded-full overflow-visible">
        {/* required marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-400 rounded z-10"
          style={{ left: `${reqPct}%` }}
          title={`Required: ${proficiencyLabels[required]}`}
        />
        {/* filled bar */}
        <div
          className={`h-full rounded-full ${colours[current]} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`w-20 text-xs font-medium text-right ${
          current >= required ? 'text-vedanta-green' : current >= required - 1 ? 'text-amber-500' : 'text-red-500'
        }`}
      >
        {proficiencyLabels[current]}
      </span>
      <span className="w-16 text-xs text-gray-400 text-right">
        Req: {proficiencyLabels[required]}
      </span>
    </div>
  );
}
