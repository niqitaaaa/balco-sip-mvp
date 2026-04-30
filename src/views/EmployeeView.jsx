import { useState } from 'react';
import { employees, trainingPrograms, skillDefinitions } from '../data/mockData';
import ProficiencyBar from '../components/ProficiencyBar';
import GapBadge from '../components/GapBadge';

function calcGapScore(currentSkills, requiredSkills) {
  const entries = Object.entries(requiredSkills);
  if (!entries.length) return 100;
  const total = entries.reduce((sum, [id, req]) => {
    const cur = currentSkills[id] ?? 0;
    return sum + Math.min(cur / req, 1);
  }, 0);
  return Math.round((total / entries.length) * 100);
}

export default function EmployeeView({ employeeId }) {
  const [skills, setSkills] = useState(() => {
    const map = {};
    employees.forEach(e => { map[e.id] = { ...e.currentSkills }; });
    return map;
  });
  const [completed, setCompleted] = useState(() => {
    const map = {};
    employees.forEach(e => { map[e.id] = [...e.completedTrainings]; });
    return map;
  });
  const [toast, setToast] = useState(null);

  const emp = employees.find(e => e.id === employeeId) || employees[0];
  const currentSkills = skills[emp.id];
  const completedList = completed[emp.id];
  const gapScore = calcGapScore(currentSkills, emp.requiredSkills);

  const recommended = trainingPrograms.filter(
    t => emp.recommendedTrainings.includes(t.id) && !completedList.includes(t.id)
  );

  function handleCompleteTraining(trainingId) {
    const tp = trainingPrograms.find(t => t.id === trainingId);
    if (!tp) return;

    // Update skills: raise each addressed skill by 1 (up to max 4)
    setSkills(prev => {
      const updated = { ...prev[emp.id] };
      tp.skillsAddressed.forEach(sk => {
        updated[sk] = Math.min((updated[sk] ?? 0) + 1, 4);
      });
      return { ...prev, [emp.id]: updated };
    });

    setCompleted(prev => ({
      ...prev,
      [emp.id]: [...prev[emp.id], trainingId],
    }));

    setToast(`"${tp.name}" marked complete — proficiency updated.`);
    setTimeout(() => setToast(null), 4000);
  }

  const categoryGroups = {};
  Object.entries(emp.requiredSkills).forEach(([id, req]) => {
    const def = skillDefinitions[id];
    if (!def) return;
    if (!categoryGroups[def.category]) categoryGroups[def.category] = [];
    categoryGroups[def.category].push({ id, req });
  });

  return (
    <div className="p-6 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-vedanta-green text-white px-4 py-3 rounded shadow-lg text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Skills Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">{emp.role} · {emp.department} · {emp.location}</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gap Score</p>
          <GapBadge score={gapScore} />
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Skills Assessed</p>
          <p className="text-2xl font-bold text-gray-900">{Object.keys(emp.requiredSkills).length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trainings Completed</p>
          <p className="text-2xl font-bold text-gray-900">{completedList.length}</p>
        </div>
      </div>

      {/* Skills breakdown */}
      <div className="bg-white border border-gray-200 rounded mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Skill Proficiency vs. Role Requirement</h2>
          <span className="text-xs text-gray-400">Bar fill = current · Marker = required</span>
        </div>
        <div className="px-4 py-3 divide-y divide-gray-50">
          {Object.entries(categoryGroups).map(([cat, items]) => (
            <div key={cat} className="pt-3 pb-1">
              <p className="text-xs font-semibold text-vedanta-blue uppercase tracking-wider mb-2">{cat}</p>
              {items.map(({ id, req }) => (
                <ProficiencyBar
                  key={id}
                  skillName={skillDefinitions[id]?.name ?? id}
                  current={currentSkills[id] ?? 0}
                  required={req}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Trainings */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recommended Training</h2>
          <p className="text-xs text-gray-400 mt-0.5">Completing a programme raises proficiency in addressed skills by one level.</p>
        </div>
        {recommended.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            All recommended trainings completed.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Programme</th>
                <th className="px-4 py-2 text-left font-medium">Category</th>
                <th className="px-4 py-2 text-left font-medium">Duration</th>
                <th className="px-4 py-2 text-left font-medium">Level</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recommended.map(tp => (
                <tr key={tp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{tp.name}</td>
                  <td className="px-4 py-3 text-gray-500">{tp.category}</td>
                  <td className="px-4 py-3 text-gray-500">{tp.duration}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{tp.level}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleCompleteTraining(tp.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded bg-vedanta-green text-white hover:bg-green-600 transition-colors"
                    >
                      Mark Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {completedList.filter(id => emp.recommendedTrainings.includes(id)).length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-1">Completed</p>
            <div className="flex flex-wrap gap-2">
              {completedList
                .filter(id => emp.recommendedTrainings.includes(id))
                .map(id => {
                  const tp = trainingPrograms.find(t => t.id === id);
                  return tp ? (
                    <span key={id} className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 border border-green-200">
                      ✓ {tp.name}
                    </span>
                  ) : null;
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
