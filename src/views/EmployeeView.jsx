import { useState } from 'react';
import {
  employees, trainingPrograms, skillDefinitions, proficiencyLabels,
  ijpListings, nextGradeSkills, employeeCertifications, impactStories,
  skillsHistory, badgeDefinitions, employeeBadges,
} from '../data/mockData';
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

function calcReadiness(currentSkills, requiredSkills) {
  const entries = Object.entries(requiredSkills);
  if (!entries.length) return { score: 100, met: 0, partial: 0, missing: 0, details: [], total: 0 };
  let met = 0, partial = 0, missing = 0;
  const details = [];
  entries.forEach(([skillId, req]) => {
    const cur = currentSkills[skillId] ?? 0;
    if (cur >= req) { met++; details.push({ skillId, req, cur, status: 'met' }); }
    else if (cur > 0) { partial++; details.push({ skillId, req, cur, status: 'partial' }); }
    else { missing++; details.push({ skillId, req, cur, status: 'missing' }); }
  });
  return { score: Math.round((met / entries.length) * 100), met, partial, missing, details, total: entries.length };
}

function certExpiryStatus(expiryDate) {
  const today = new Date('2026-05-01');
  const expiry = new Date(expiryDate);
  const daysLeft = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: 'Expired', colour: 'bg-red-100 text-red-700 border-red-300', urgent: true };
  if (daysLeft <= 60) return { label: `Expires in ${daysLeft}d`, colour: 'bg-amber-100 text-amber-700 border-amber-300', urgent: true };
  return { label: `Valid · ${daysLeft}d left`, colour: 'bg-green-100 text-green-700 border-green-300', urgent: false };
}

const MAGNITUDE_COLOURS = {
  'No visible change': 'bg-gray-100 text-gray-600',
  'Small improvement': 'bg-amber-100 text-amber-700',
  'Moderate improvement': 'bg-yellow-100 text-yellow-700',
  'Significant improvement': 'bg-green-100 text-green-700',
};

export default function EmployeeView({ employeeId, activeNav }) {
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
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [localStories, setLocalStories] = useState(
    impactStories.filter(s => s.employeeId === employeeId)
  );
  const [storyForm, setStoryForm] = useState({
    trainingId: '',
    change: '',
    magnitude: 'Moderate improvement',
    managerAcknowledged: 'Not discussed',
  });

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

  function handleSubmitStory(e) {
    e.preventDefault();
    if (storyForm.change.trim().length < 30) {
      setToast('Please write at least 30 characters describing the change.');
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setLocalStories(prev => [...prev, {
      id: `is-local-${Date.now()}`,
      employeeId,
      trainingId: storyForm.trainingId,
      submittedDate: '2026-05-01',
      change: storyForm.change,
      magnitude: storyForm.magnitude,
      managerAcknowledged: storyForm.managerAcknowledged,
    }]);
    setShowStoryForm(false);
    setStoryForm({ trainingId: '', change: '', magnitude: 'Moderate improvement', managerAcknowledged: 'Not discussed' });
    setToast('Impact story submitted — visible to L&D and your manager.');
    setTimeout(() => setToast(null), 4000);
  }

  const categoryGroups = {};
  Object.entries(emp.requiredSkills).forEach(([id, req]) => {
    const def = skillDefinitions[id];
    if (!def) return;
    if (!categoryGroups[def.category]) categoryGroups[def.category] = [];
    categoryGroups[def.category].push({ id, req });
  });

  // ── Career readiness data ────────────────────────────────────────────────────
  const nextGradeReqs = nextGradeSkills[emp.id] ?? {};
  const promotionReadiness = calcReadiness(currentSkills, nextGradeReqs);
  const ijpReadiness = ijpListings.map(ijp => ({
    ...ijp,
    readiness: calcReadiness(currentSkills, ijp.requiredSkills),
  }));
  const myCerts = employeeCertifications.filter(c => c.employeeId === emp.id);

  // ── Grade label for next grade ───────────────────────────────────────────────
  const gradeNum = parseInt(emp.grade.replace('E', ''), 10);
  const nextGradeLabel = `E${gradeNum + 1}`;

  // ── Badges & History ─────────────────────────────────────────────────────────
  const myBadges = employeeBadges.filter(b => b.employeeId === emp.id);
  const myHistory = [...skillsHistory.filter(h => h.employeeId === emp.id)]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (activeNav === 'career') {
    return (
      <div className="p-6 max-w-4xl">
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-vedanta-green text-white px-4 py-3 rounded shadow-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toast}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Career Readiness</h1>
          <p className="text-sm text-gray-500 mt-0.5">{emp.role} · {emp.department} · Grade {emp.grade}</p>
        </div>

        {/* Badges */}
        {myBadges.length > 0 && (
          <div className="bg-white border border-gray-200 rounded mb-6">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">My Badges</h2>
              <p className="text-xs text-gray-400 mt-0.5">Development milestones — visible on your Darwinbox profile</p>
            </div>
            <div className="px-4 py-4 flex flex-wrap gap-3">
              {myBadges.map(eb => {
                const def = badgeDefinitions[eb.badgeId];
                if (!def) return null;
                return (
                  <div key={eb.id} className={`flex items-center gap-2 px-3 py-2 rounded border text-sm font-medium ${def.colour}`}>
                    <span className="text-base leading-none">{def.icon}</span>
                    <div>
                      <p className="font-semibold text-xs">{def.name}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{def.description}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">Earned {eb.earnedDate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Promotion Readiness */}
        <div className="bg-white border border-gray-200 rounded mb-6">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Promotion Readiness — {emp.grade} → {nextGradeLabel}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Skills required for the next grade compared to your current profile</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${promotionReadiness.score >= 75 ? 'text-vedanta-green' : promotionReadiness.score >= 45 ? 'text-amber-600' : 'text-red-600'}`}>
                {promotionReadiness.score}%
              </p>
              <p className="text-xs text-gray-400">ready</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${promotionReadiness.score >= 75 ? 'bg-vedanta-green' : promotionReadiness.score >= 45 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${promotionReadiness.score}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-green-50 rounded p-3">
                <p className="text-xl font-bold text-vedanta-green">{promotionReadiness.met}</p>
                <p className="text-xs text-gray-500 mt-0.5">Skills met</p>
              </div>
              <div className="bg-amber-50 rounded p-3">
                <p className="text-xl font-bold text-amber-600">{promotionReadiness.partial}</p>
                <p className="text-xs text-gray-500 mt-0.5">Partially met</p>
              </div>
              <div className="bg-red-50 rounded p-3">
                <p className="text-xl font-bold text-red-600">{promotionReadiness.missing}</p>
                <p className="text-xs text-gray-500 mt-0.5">Not yet held</p>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Skill</th>
                  <th className="px-3 py-2 text-left font-medium">Current</th>
                  <th className="px-3 py-2 text-left font-medium">Required for {nextGradeLabel}</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {promotionReadiness.details.map(({ skillId, cur, req, status }) => (
                  <tr key={skillId} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{skillDefinitions[skillId]?.name ?? skillId}</td>
                    <td className="px-3 py-2 text-gray-600">{proficiencyLabels[cur]}</td>
                    <td className="px-3 py-2 text-gray-600">{proficiencyLabels[req]}</td>
                    <td className="px-3 py-2">
                      {status === 'met' && <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">✓ Met</span>}
                      {status === 'partial' && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">⬆ Close</span>}
                      {status === 'missing' && <span className="px-2 py-0.5 rounded bg-red-100 text-red-600">✗ Gap</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* IJP Readiness */}
        <div className="bg-white border border-gray-200 rounded mb-6">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Active IJP Readiness</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your current skill profile vs. open internal job postings</p>
          </div>
          <div className="px-4 py-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ijpReadiness.map(ijp => (
              <div key={ijp.id} className="border border-gray-200 rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ijp.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ijp.department} · {ijp.grade}</p>
                  </div>
                  <span className={`text-sm font-bold ml-2 ${ijp.readiness.score >= 75 ? 'text-vedanta-green' : ijp.readiness.score >= 45 ? 'text-amber-600' : 'text-red-600'}`}>
                    {ijp.readiness.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div
                    className={`h-1.5 rounded-full ${ijp.readiness.score >= 75 ? 'bg-vedanta-green' : ijp.readiness.score >= 45 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${ijp.readiness.score}%` }}
                  />
                </div>
                <div className="flex gap-2 text-xs mb-3">
                  <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">{ijp.readiness.met} met</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{ijp.readiness.partial} partial</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600">{ijp.readiness.missing} gap</span>
                </div>
                <p className="text-xs text-gray-400">Closes {ijp.closingDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        {myCerts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded mb-6">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">My Certifications</h2>
            </div>
            <div className="px-4 py-4 flex flex-wrap gap-3">
              {myCerts.map(cert => {
                const status = certExpiryStatus(cert.expiryDate);
                return (
                  <div key={cert.id} className="border border-gray-200 rounded p-3 min-w-[220px]">
                    <p className="text-sm font-medium text-gray-900">{cert.certName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Issued by {cert.certBody} · {cert.issueDate}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded border font-medium ${status.colour}`}>
                      {status.urgent ? '⚠ ' : '✓ '}{status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Impact Stories (L4 Self-Reports) */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">My Impact Stories</h2>
              <p className="text-xs text-gray-400 mt-0.5">How your training has changed the way you work — visible to L&D and your manager</p>
            </div>
            <button
              onClick={() => setShowStoryForm(v => !v)}
              className="px-3 py-1.5 text-xs font-medium rounded bg-vedanta-blue text-white hover:bg-blue-700 transition-colors"
            >
              + Add Story
            </button>
          </div>

          {showStoryForm && (
            <form onSubmit={handleSubmitStory} className="px-4 py-4 bg-blue-50 border-b border-blue-100">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Submit Impact Story</p>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Training programme</label>
                <select
                  value={storyForm.trainingId}
                  onChange={e => setStoryForm(f => ({ ...f, trainingId: e.target.value }))}
                  required
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
                >
                  <option value="">Select a programme…</option>
                  {completedList.map(id => {
                    const tp = trainingPrograms.find(t => t.id === id);
                    return tp ? <option key={id} value={id}>{tp.name}</option> : null;
                  })}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">What specifically changed in your work after this training? (min 30 chars)</label>
                <textarea
                  value={storyForm.change}
                  onChange={e => setStoryForm(f => ({ ...f, change: e.target.value }))}
                  required
                  rows={3}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white resize-none"
                  placeholder="Describe a specific, observable change in your behaviour or work output…"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">{storyForm.change.length} chars</p>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Magnitude of improvement</label>
                  <select
                    value={storyForm.magnitude}
                    onChange={e => setStoryForm(f => ({ ...f, magnitude: e.target.value }))}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
                  >
                    {['No visible change', 'Small improvement', 'Moderate improvement', 'Significant improvement'].map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Manager acknowledged this change?</label>
                  <select
                    value={storyForm.managerAcknowledged}
                    onChange={e => setStoryForm(f => ({ ...f, managerAcknowledged: e.target.value }))}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
                  >
                    {['Y', 'N', 'Not discussed'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-1.5 text-xs font-medium rounded bg-vedanta-blue text-white hover:bg-blue-700 transition-colors">
                  Submit
                </button>
                <button type="button" onClick={() => setShowStoryForm(false)} className="px-4 py-1.5 text-xs font-medium rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {localStories.length === 0 && !showStoryForm ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No impact stories yet. Share how a training has changed your work.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {localStories.map(story => {
                const tp = trainingPrograms.find(t => t.id === story.trainingId);
                return (
                  <div key={story.id} className="px-4 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{tp?.name ?? story.trainingId}</p>
                      <span className="text-xs text-gray-400">{story.submittedDate}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">"{story.change}"</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-xs rounded ${MAGNITUDE_COLOURS[story.magnitude] ?? 'bg-gray-100 text-gray-600'}`}>
                        {story.magnitude}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${story.managerAcknowledged === 'Y' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        Manager acknowledged: {story.managerAcknowledged}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Skills Profile tab (default) ─────────────────────────────────────────────
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
                <th className="px-4 py-2 text-left font-medium">BCS</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recommended.map(tp => (
                <tr key={tp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {tp.name}
                    {tp.certification && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700">Cert</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{tp.category}</td>
                  <td className="px-4 py-3 text-gray-500">{tp.duration}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{tp.level}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 text-xs rounded font-semibold ${
                      tp.bcs >= 4 ? 'bg-red-100 text-red-700' :
                      tp.bcs === 3 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{tp.bcs}/5</span>
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

      {/* Skills Acquisition History (F1.4) */}
      <div className="bg-white border border-gray-200 rounded mt-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Skills Acquisition History</h2>
            <p className="text-xs text-gray-400 mt-0.5">Immutable audit trail of your skill development events</p>
          </div>
          <span className="text-xs text-gray-400">{myHistory.length} events</span>
        </div>
        {myHistory.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No history events yet.</div>
        ) : (
          <div className="px-4 py-3">
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-4">
                {myHistory.map(evt => {
                  const skillName = skillDefinitions[evt.skillId]?.name ?? evt.skillId;
                  const typeConfig = {
                    training:          { dot: 'bg-vedanta-green',  label: 'Training',          textColour: 'text-vedanta-green' },
                    certification:     { dot: 'bg-purple-500',     label: 'Certification',     textColour: 'text-purple-700' },
                    manager_validated: { dot: 'bg-vedanta-blue',   label: 'Manager Validated', textColour: 'text-vedanta-blue' },
                    assessment:        { dot: 'bg-gray-400',       label: 'Assessment',        textColour: 'text-gray-600' },
                  }[evt.eventType] ?? { dot: 'bg-gray-300', label: evt.eventType, textColour: 'text-gray-600' };
                  return (
                    <div key={evt.id} className="flex gap-4 pl-2">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 border-white shadow-sm ${typeConfig.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">{skillName}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 ${typeConfig.textColour}`}>
                            {typeConfig.label}
                          </span>
                          {evt.newLevel !== evt.prevLevel && (
                            <span className="text-xs text-gray-500">
                              {proficiencyLabels[evt.prevLevel]} → <span className="font-medium text-vedanta-green">{proficiencyLabels[evt.newLevel]}</span>
                            </span>
                          )}
                          {evt.newLevel === evt.prevLevel && (
                            <span className="text-xs text-gray-400">Level confirmed: {proficiencyLabels[evt.newLevel]}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{evt.sourceLabel}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{evt.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
