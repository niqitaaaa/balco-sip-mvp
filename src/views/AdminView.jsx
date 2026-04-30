import { trainingPrograms, adminStats } from '../data/mockData';

function LevelBadge({ score, type }) {
  if (type === 'l1') {
    const pct = ((score - 1) / 4) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div
            className="h-full rounded-full bg-vedanta-green"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-700 w-8 text-right">{score}/5</span>
      </div>
    );
  }
  const colour = score >= 70 ? 'text-vedanta-green' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  return <span className={`text-sm font-semibold ${colour}`}>{score}%</span>;
}

function ResponseRateBar({ rate }) {
  const colour = rate >= 80 ? 'bg-vedanta-green' : rate >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-full rounded-full ${colour}`} style={{ width: `${rate}%` }} />
      </div>
      <span className={`text-xs font-medium w-8 text-right ${
        rate >= 80 ? 'text-vedanta-green' : rate >= 60 ? 'text-amber-600' : 'text-red-600'
      }`}>{rate}%</span>
    </div>
  );
}

export default function AdminView() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">L&D Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Programme effectiveness and manager validation metrics — Q1 FY2026</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Employees with Profiles</p>
          <p className="text-2xl font-bold text-gray-900">{adminStats.profilesWithSkills.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">of {adminStats.totalEmployees.toLocaleString()} total</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Org Avg Gap Score</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600">{adminStats.avgGapScore}%</span>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-200">Needs Attention</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Manager Response Rate</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-vedanta-green">{adminStats.managerResponseRate}%</span>
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded border border-green-200">On Track</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trainings This Quarter</p>
          <p className="text-2xl font-bold text-gray-900">{adminStats.trainingsThisQuarter}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Feedback Pending</p>
          <p className="text-2xl font-bold text-amber-600">{adminStats.feedbackPending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Programmes Tracked</p>
          <p className="text-2xl font-bold text-gray-900">{trainingPrograms.length}</p>
        </div>
      </div>

      {/* Programme Effectiveness Table */}
      <div className="bg-white border border-gray-200 rounded mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Programme Effectiveness</h2>
          <span className="text-xs text-gray-400">L1 = Reaction · L2 = Learning · L3 = Behaviour Transfer</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Programme</th>
                <th className="px-4 py-2.5 text-left font-medium">Category</th>
                <th className="px-4 py-2.5 text-left font-medium w-28">Completions</th>
                <th className="px-4 py-2.5 text-left font-medium w-36">L1 Score</th>
                <th className="px-4 py-2.5 text-left font-medium w-24">L2 Score</th>
                <th className="px-4 py-2.5 text-left font-medium w-24">L3 Score</th>
                <th className="px-4 py-2.5 text-left font-medium w-36">Mgr Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trainingPrograms.map(tp => (
                <tr key={tp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{tp.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      tp.category === 'Safety' ? 'bg-blue-50 text-blue-700' :
                      tp.category === 'Leadership' ? 'bg-purple-50 text-purple-700' :
                      tp.category === 'Sustainability' ? 'bg-green-50 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {tp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{tp.completions}</td>
                  <td className="px-4 py-3 w-36">
                    <LevelBadge score={tp.l1Score} type="l1" />
                  </td>
                  <td className="px-4 py-3">
                    <LevelBadge score={tp.l2Score} type="l2" />
                  </td>
                  <td className="px-4 py-3">
                    <LevelBadge score={tp.l3Score} type="l3" />
                  </td>
                  <td className="px-4 py-3 w-36">
                    <ResponseRateBar rate={tp.managerResponseRate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 text-xs text-blue-700">
        <span className="font-semibold">DPDP Notice:</span> All skills data is processed in compliance with the Digital Personal Data Protection Act 2023.
        Employees have been notified and have provided consent for processing of professional skills data within BALCO's internal HR systems.
      </div>
    </div>
  );
}
