import { useState } from 'react';
import { feedbackRequests, employees, trainingPrograms, skillDefinitions, proficiencyLabels, managers } from '../data/mockData';
import GapBadge from '../components/GapBadge';
import ProficiencyBar from '../components/ProficiencyBar';

function calcGapScore(currentSkills, requiredSkills) {
  const entries = Object.entries(requiredSkills);
  if (!entries.length) return 100;
  const total = entries.reduce((sum, [id, req]) => {
    const cur = currentSkills[id] ?? 0;
    return sum + Math.min(cur / req, 1);
  }, 0);
  return Math.round((total / entries.length) * 100);
}

export default function ManagerView({ managerId, activeNav }) {
  const mgr = managers.find(m => m.id === managerId) || managers[0];
  const requests = feedbackRequests.filter(r => r.managerId === mgr.id && r.status === 'pending');

  const [selected, setSelected] = useState(requests[0]?.id ?? null);
  const [ratings, setRatings] = useState(() => {
    const m = {};
    feedbackRequests.forEach(r => { m[r.id] = { ...r.preFilledRatings }; });
    return m;
  });
  const [submitted, setSubmitted] = useState([]);
  const [toast, setToast] = useState(null);

  const current = requests.find(r => r.id === selected && !submitted.includes(r.id));

  function handleSubmit() {
    if (!current) return;
    setSubmitted(prev => [...prev, current.id]);
    const next = requests.find(r => r.id !== current.id && !submitted.includes(r.id));
    setSelected(next?.id ?? null);
    setToast('Validation submitted — skill profile updated.');
    setTimeout(() => setToast(null), 4000);
  }

  const pending = requests.filter(r => !submitted.includes(r.id));

  // ── Team Overview data ────────────────────────────────────────────────────────
  const teamMembers = employees.filter(e => e.managerId === mgr.id);
  const [expandedMember, setExpandedMember] = useState(null);

  if (activeNav === 'team') {
    const avgGap = teamMembers.length
      ? Math.round(teamMembers.reduce((s, e) => s + calcGapScore(e.currentSkills, e.requiredSkills), 0) / teamMembers.length)
      : 0;
    const totalCompleted = teamMembers.reduce((s, e) => s + e.completedTrainings.length, 0);
    const pendingForTeam = feedbackRequests.filter(r => r.managerId === mgr.id && r.status === 'pending').length;

    return (
      <div className="p-6 max-w-5xl">
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-vedanta-blue text-white px-4 py-3 rounded shadow-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toast}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Team Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Skills health across your direct reports — {mgr.department}</p>
        </div>

        {/* Team stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Team Size</p>
            <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Gap Score</p>
            <p className={`text-2xl font-bold ${avgGap >= 75 ? 'text-vedanta-green' : avgGap >= 45 ? 'text-amber-600' : 'text-red-600'}`}>{avgGap}%</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trainings Completed</p>
            <p className="text-2xl font-bold text-vedanta-green">{totalCompleted}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pending Validations</p>
            <p className="text-2xl font-bold text-amber-600">{pendingForTeam}</p>
          </div>
        </div>

        {/* Team members table */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Direct Reports — Skills Health</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click a row to see full skill breakdown</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Employee</th>
                <th className="px-4 py-2.5 text-left font-medium">Role · Grade</th>
                <th className="px-4 py-2.5 text-left font-medium w-40">Gap Score</th>
                <th className="px-4 py-2.5 text-center font-medium">Skills</th>
                <th className="px-4 py-2.5 text-center font-medium">Completed</th>
                <th className="px-4 py-2.5 text-left font-medium">Top Gap Skill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamMembers.map(emp => {
                const gap = calcGapScore(emp.currentSkills, emp.requiredSkills);
                // Find skill with biggest gap (req - cur, highest)
                const topGap = Object.entries(emp.requiredSkills)
                  .map(([id, req]) => ({ id, req, cur: emp.currentSkills[id] ?? 0, diff: req - (emp.currentSkills[id] ?? 0) }))
                  .filter(s => s.diff > 0)
                  .sort((a, b) => b.diff - a.diff)[0];
                const isExpanded = expandedMember === emp.id;
                const categoryGroups = {};
                Object.entries(emp.requiredSkills).forEach(([id, req]) => {
                  const def = skillDefinitions[id];
                  if (!def) return;
                  if (!categoryGroups[def.category]) categoryGroups[def.category] = [];
                  categoryGroups[def.category].push({ id, req });
                });
                return [
                  <tr
                    key={emp.id}
                    onClick={() => setExpandedMember(isExpanded ? null : emp.id)}
                    className="hover:bg-blue-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-vedanta-blue/10 flex items-center justify-center text-vedanta-blue text-xs font-semibold flex-shrink-0">
                          {emp.name[0]}
                        </div>
                        <span className="font-medium text-gray-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{emp.role} · {emp.grade}</td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${gap >= 75 ? 'bg-vedanta-green' : gap >= 45 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${gap}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-8 text-right ${gap >= 75 ? 'text-vedanta-green' : gap >= 45 ? 'text-amber-600' : 'text-red-600'}`}>{gap}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{Object.keys(emp.requiredSkills).length}</td>
                    <td className="px-4 py-3 text-center text-vedanta-green font-medium">{emp.completedTrainings.length}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {topGap ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                          {skillDefinitions[topGap.id]?.name ?? topGap.id}
                          <span className="text-gray-400">({proficiencyLabels[topGap.cur]} → {proficiencyLabels[topGap.req]})</span>
                        </span>
                      ) : (
                        <span className="text-vedanta-green">✓ No gaps</span>
                      )}
                    </td>
                  </tr>,
                  isExpanded && (
                    <tr key={`${emp.id}-expand`}>
                      <td colSpan={6} className="px-6 py-4 bg-blue-50 border-l-2 border-vedanta-blue">
                        <p className="text-xs font-semibold text-vedanta-blue uppercase tracking-wide mb-3">
                          Full Skill Breakdown — {emp.name}
                        </p>
                        <div className="divide-y divide-blue-100">
                          {Object.entries(categoryGroups).map(([cat, items]) => (
                            <div key={cat} className="pt-2 pb-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{cat}</p>
                              {items.map(({ id, req }) => (
                                <ProficiencyBar
                                  key={id}
                                  skillName={skillDefinitions[id]?.name ?? id}
                                  current={emp.currentSkills[id] ?? 0}
                                  required={req}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-vedanta-blue text-white px-4 py-3 rounded shadow-lg text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Skill Validation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review post-training feedback requests and validate observed skill change.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pending Requests</p>
          <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Submitted This Session</p>
          <p className="text-2xl font-bold text-vedanta-green">{submitted.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Response Rate</p>
          <p className="text-2xl font-bold text-gray-900">74%</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-12 text-center">
          <svg className="w-10 h-10 mx-auto text-vedanta-green mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-700">All feedback requests submitted.</p>
          <p className="text-xs text-gray-400 mt-1">No pending validations for this period.</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Request list */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pending ({pending.length})</p>
              </div>
              {pending.map(r => {
                const emp = employees.find(e => e.id === r.employeeId);
                const tp = trainingPrograms.find(t => t.id === r.trainingId);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      selected === r.id ? 'bg-blue-50 border-l-2 border-l-vedanta-blue' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{emp?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{tp?.name}</p>
                    <p className="text-xs text-amber-600 mt-1">Due {r.dueDate}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail pane */}
          {current && (() => {
            const emp = employees.find(e => e.id === current.employeeId);
            const tp = trainingPrograms.find(t => t.id === current.trainingId);
            const currentRatings = ratings[current.id];
            return (
              <div className="flex-1 bg-white border border-gray-200 rounded">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">{emp?.name} — {tp?.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{emp?.role} · {emp?.department}</p>
                </div>

                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-600">{current.notes}</p>
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                    Rate Observed Post-Training Proficiency
                  </p>

                  {current.skillsToRate.map(sk => {
                    const def = skillDefinitions[sk];
                    const val = currentRatings[sk] ?? 0;
                    return (
                      <div key={sk} className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-gray-800">{def?.name}</label>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            val >= 3 ? 'bg-green-100 text-green-700' :
                            val >= 2 ? 'bg-amber-100 text-amber-700' :
                                       'bg-red-100 text-red-600'
                          }`}>
                            {proficiencyLabels[val]}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          {[0, 1, 2, 3, 4].map(n => (
                            <button
                              key={n}
                              onClick={() => setRatings(prev => ({
                                ...prev,
                                [current.id]: { ...prev[current.id], [sk]: n },
                              }))}
                              className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${
                                val === n
                                  ? 'bg-vedanta-blue text-white border-vedanta-blue'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-vedanta-blue'
                              }`}
                            >
                              {n}<br />
                              <span className="font-normal text-[10px]">{proficiencyLabels[n]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between mt-6">
                    <p className="text-xs text-gray-400">Ratings are auto-logged to the employee's Darwinbox profile.</p>
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2 text-sm font-medium rounded bg-vedanta-blue text-white hover:bg-blue-700 transition-colors"
                    >
                      Submit Validation
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
