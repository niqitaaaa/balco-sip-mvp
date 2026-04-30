import { useState } from 'react';
import { employees, managers } from './data/mockData';
import EmployeeView from './views/EmployeeView';
import ManagerView from './views/ManagerView';
import AdminView from './views/AdminView';

const NAV_EMPLOYEE = [
  { id: 'profile', label: 'Skills Profile', icon: IdCardIcon },
  { id: 'career', label: 'Career Readiness', icon: TrendingIcon },
];

const NAV_MANAGER = [
  { id: 'validation', label: 'Skill Validation', icon: CheckIcon },
  { id: 'team', label: 'Team Overview', icon: UsersIcon },
];

const NAV_ADMIN = [
  { id: 'dashboard', label: 'Dashboard', icon: ChartIcon },
  { id: 'programmes', label: 'Programmes', icon: BookIcon },
];

function SipLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded flex items-center justify-center bg-vedanta-green">
        <span className="text-white font-bold text-xs">SIP</span>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 leading-none">Skills Intelligence</p>
        <p className="text-[10px] text-gray-400 leading-none mt-0.5">BALCO · Vedanta</p>
      </div>
    </div>
  );
}

// ─── Icon helpers ──────────────────────────────────────────────────────────────
function IdCardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0M9 12h.01M15 12h.01M12 12h.01" />
    </svg>
  );
}
function TrendingIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function BookIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export default function App() {
  const [role, setRole] = useState('employee');
  const [employeeId, setEmployeeId] = useState(employees[0].id);
  const [managerId] = useState(managers[0].id);
  const [activeNav, setActiveNav] = useState('profile');

  const navItems =
    role === 'employee' ? NAV_EMPLOYEE :
    role === 'manager' ? NAV_MANAGER :
    NAV_ADMIN;

  function handleRoleChange(newRole) {
    setRole(newRole);
    const defaults = { employee: 'profile', manager: 'validation', admin: 'dashboard' };
    setActiveNav(defaults[newRole]);
  }

  function renderContent() {
    if (role === 'employee') {
      return <EmployeeView key={employeeId} employeeId={employeeId} />;
    }
    if (role === 'manager') {
      return <ManagerView managerId={managerId} />;
    }
    return <AdminView />;
  }

  const activeEmp = employees.find(e => e.id === employeeId);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top bar */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0 z-20">
        <SipLogo />
        <div className="flex-1" />

        {/* Employee selector (only for employee role) */}
        {role === 'employee' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Viewing:</span>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-vedanta-blue"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
              ))}
            </select>
          </div>
        )}

        {/* Role switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Role:</span>
          <select
            value={role}
            onChange={e => handleRoleChange(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-vedanta-blue font-medium"
          >
            <option value="employee">👤 Employee</option>
            <option value="manager">👔 Manager</option>
            <option value="admin">📊 L&amp;D Admin</option>
          </select>
        </div>

        {/* User chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-vedanta-green flex items-center justify-center text-white text-xs font-semibold">
            {role === 'employee' ? activeEmp?.name[0] :
             role === 'manager' ? 'DN' : 'AD'}
          </div>
          <span className="text-xs font-medium text-gray-700">
            {role === 'employee' ? activeEmp?.name :
             role === 'manager' ? 'Deepak Nair' : 'Admin'}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="px-3 pt-4 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 mb-1">
              {role === 'employee' ? 'My Development' :
               role === 'manager' ? 'Manager Tools' :
               'Administration'}
            </p>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded text-sm text-left transition-colors ${
                    activeNav === item.id
                      ? 'bg-vedanta-green/10 text-vedanta-green font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Bottom section */}
          <div className="mt-auto px-3 pb-4 border-t border-gray-100 pt-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 mb-1">Platform</p>
            <div className="px-2 py-1.5 text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vedanta-green inline-block" />
              POC v0.1 · Apr 2026
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
