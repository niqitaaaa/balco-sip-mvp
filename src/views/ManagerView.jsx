import { useState } from 'react';
import { feedbackRequests, employees, trainingPrograms, skillDefinitions, proficiencyLabels, managers } from '../data/mockData';

export default function ManagerView({ managerId }) {
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
