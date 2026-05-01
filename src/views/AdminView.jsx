import { trainingPrograms, adminStats, skillDefinitions, employees, employeeCertifications } from '../data/mockData';

// ── Helpers ────────────────────────────────────────────────────────────────────
function certExpiryStatus(expiryDate) {
  const today = new Date('2026-05-01');
  const expiry = new Date(expiryDate);
  const daysLeft = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: 'Expired', colour: 'bg-red-100 text-red-700', days: daysLeft };
  if (daysLeft <= 60) return { label: `Due in ${daysLeft}d`, colour: 'bg-amber-100 text-amber-700', days: daysLeft };
  return { label: `${daysLeft}d left`, colour: 'bg-green-100 text-green-700', days: daysLeft };
}

const BCS_META = {
  5: { label: 'Critical', colour: 'bg-red-100 text-red-700 border-red-300' },
  4: { label: 'High', colour: 'bg-orange-100 text-orange-700 border-orange-300' },
  3: { label: 'Medium', colour: 'bg-amber-100 text-amber-700 border-amber-300' },
  2: { label: 'Low', colour: 'bg-gray-100 text-gray-600 border-gray-300' },
  1: { label: 'Minimal', colour: 'bg-gray-50 text-gray-500 border-gray-200' },
};

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

export default function AdminView({ activeNav }) {
  if (activeNav === 'programmes') {
    // ── Programmes tab ─────────────────────────────────────────────────────────

    // BCS tier summary
    const bcsTiers = [5, 4, 3, 2, 1].map(bcs => ({
      bcs,
      ...BCS_META[bcs],
      programs: trainingPrograms.filter(tp => tp.bcs === bcs),
    }));

    // Certification expiry tracker
    const certRows = employeeCertifications.map(cert => {
      const status = certExpiryStatus(cert.expiryDate);
      const emp = employees.find(e => e.id === cert.employeeId);
      const tp = trainingPrograms.find(t => t.id === cert.programId);
      return { ...cert, status, empName: emp?.name ?? cert.employeeId, tpName: tp?.name ?? cert.programId };
    }).sort((a, b) => a.status.days - b.status.days);

    // Skills heat map: for each skill, count employees at each proficiency level
    const heatMap = Object.entries(skillDefinitions).map(([skillId, def]) => {
      const counts = [0, 0, 0, 0, 0];
      employees.forEach(e => {
        const level = e.currentSkills[skillId] ?? 0;
        counts[level]++;
      });
      const totalHolders = counts.slice(1).reduce((a, b) => a + b, 0);
      const avgLevel = employees.length
        ? employees.reduce((s, e) => s + (e.currentSkills[skillId] ?? 0), 0) / employees.length
        : 0;
      return { skillId, def, counts, totalHolders, avgLevel };
    });

    const profLabels = ['None', 'Awareness', 'Developing', 'Competent', 'Proficient'];
    const heatColour = (count) => {
      if (count === 0) return 'bg-gray-50 text-gray-300';
      if (count === 1) return 'bg-blue-50 text-blue-600';
      if (count === 2) return 'bg-vedanta-green/20 text-green-800';
      return 'bg-vedanta-green/40 text-green-900 font-semibold';
    };

    return (
      <div className="p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Programmes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business Criticality Scores, certifications, and org-wide skills heat map</p>
        </div>

        {/* BCS tier summary */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {bcsTiers.map(tier => (
            <div key={tier.bcs} className={`flex-1 min-w-[140px] border rounded p-3 ${tier.colour}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">{tier.label} (BCS {tier.bcs})</p>
              <p className="text-2xl font-bold mt-1">{tier.programs.length}</p>
              <p className="text-xs mt-0.5 opacity-75">programmes</p>
            </div>
          ))}
        </div>

        {/* Programme cards */}
        <div className="bg-white border border-gray-200 rounded mb-6">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">All Programmes — Business Criticality</h2>
            <span className="text-xs text-gray-400">BCS = Business Criticality Score (1 Minimal → 5 Critical)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Programme</th>
                  <th className="px-4 py-2.5 text-left font-medium">Category</th>
                  <th className="px-4 py-2.5 text-center font-medium">BCS</th>
                  <th className="px-4 py-2.5 text-center font-medium">Cert</th>
                  <th className="px-4 py-2.5 text-center font-medium">Completions</th>
                  <th className="px-4 py-2.5 text-left font-medium w-36">L1 Score</th>
                  <th className="px-4 py-2.5 text-center font-medium">L3 Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...trainingPrograms].sort((a, b) => b.bcs - a.bcs).map(tp => {
                  const meta = BCS_META[tp.bcs];
                  return (
                    <tr key={tp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{tp.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          tp.category === 'Safety' ? 'bg-blue-50 text-blue-700' :
                          tp.category === 'Leadership' ? 'bg-purple-50 text-purple-700' :
                          tp.category === 'Sustainability' ? 'bg-green-50 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{tp.category}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-xs rounded border font-semibold ${meta.colour}`}>
                          {tp.bcs} — {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tp.certification
                          ? <span className="px-1.5 py-0.5 text-xs rounded bg-purple-100 text-purple-700">{tp.certValidityMonths}m</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 font-medium">{tp.completions}</td>
                      <td className="px-4 py-3 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className="h-full rounded-full bg-vedanta-green" style={{ width: `${((tp.l1Score - 1) / 4) * 100}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8 text-right">{tp.l1Score}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-semibold ${tp.l3Score >= 70 ? 'text-vedanta-green' : tp.l3Score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {tp.l3Score}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Certification Expiry Tracker */}
        <div className="bg-white border border-gray-200 rounded mb-6">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Certification Expiry Tracker</h2>
            <span className="text-xs text-gray-400">Alerts at T-60 days and T-14 days per PRD F2.5</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Employee</th>
                <th className="px-4 py-2.5 text-left font-medium">Certification</th>
                <th className="px-4 py-2.5 text-left font-medium">Issuing Body</th>
                <th className="px-4 py-2.5 text-left font-medium">Issue Date</th>
                <th className="px-4 py-2.5 text-left font-medium">Expiry Date</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certRows.map(cert => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cert.empName}</td>
                  <td className="px-4 py-3 text-gray-700">{cert.certName}</td>
                  <td className="px-4 py-3 text-gray-500">{cert.certBody}</td>
                  <td className="px-4 py-3 text-gray-500">{cert.issueDate}</td>
                  <td className="px-4 py-3 text-gray-500">{cert.expiryDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded font-medium ${cert.status.colour}`}>
                      {cert.status.days <= 60 && cert.status.days >= 0 ? '⚠ ' : ''}{cert.status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Skills Heat Map */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Org Skills Heat Map</h2>
            <span className="text-xs text-gray-400">Count of employees at each proficiency level · {employees.length} profiles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Skill</th>
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  {profLabels.map(l => (
                    <th key={l} className="px-3 py-2 text-center font-medium w-20">{l}</th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium">Holders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {heatMap.map(({ skillId, def, counts, totalHolders }) => (
                  <tr key={skillId} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{def.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        def.category === 'Safety' ? 'bg-blue-50 text-blue-700' :
                        def.category === 'Leadership' ? 'bg-purple-50 text-purple-700' :
                        def.category === 'Sustainability' ? 'bg-green-50 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{def.category}</span>
                    </td>
                    {counts.map((count, level) => (
                      <td key={level} className="px-3 py-2.5 text-center">
                        <span className={`inline-block w-full rounded py-1 ${heatColour(count)}`}>
                          {count > 0 ? count : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center font-medium text-gray-700">{totalHolders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-50 border border-gray-200 inline-block" /> None</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 inline-block" /> 1 employee</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-vedanta-green/20 inline-block" /> 2 employees</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-vedanta-green/40 inline-block" /> 3+ employees</span>
          </div>
        </div>
      </div>
    );
  }

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
