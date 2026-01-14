
import React from 'react';
import { AppState, UserRole } from '../types';
import { 
  User as UserIcon, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  History,
  HardDrive
} from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Settings: React.FC<Props> = ({ state }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
        <p className="text-slate-500 text-sm">Configure your workspace and preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <img src={state.currentUser.avatar} className="w-16 h-16 rounded-2xl border-4 border-slate-50 shadow-sm" alt="Profile" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">{state.currentUser.name}</h3>
            <p className="text-sm text-slate-500">{state.currentUser.email}</p>
            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700">
              {state.currentUser.role}
            </span>
          </div>
          <button className="ml-auto px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50">Edit Profile</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Preferences</h4>
            <div className="space-y-4">
              <ToggleItem icon={Bell} title="Low Stock Notifications" description="Get alerts when items drop below reorder level" defaultChecked />
              <ToggleItem icon={Globe} title="Currency" description="Display values in USD ($)" defaultChecked />
              <ToggleItem icon={Shield} title="Multi-factor Auth" description="Enhanced security for sensitive actions" />
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Data Management</h4>
            <div className="space-y-4">
              <ActionItem icon={Database} title="Export Database" description="Download a full JSON backup of all records" />
              <ActionItem icon={History} title="View Audit Logs" description={`Total ${state.logs.length} system events recorded`} />
              <ActionItem icon={HardDrive} title="Clear Cache" description="Purge locally stored session data" variant="danger" />
            </div>
          </div>
        </div>
      </div>

      {state.currentUser.role === UserRole.ADMIN && (
        <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Administrator Console</h3>
            <p className="text-indigo-200 text-sm max-w-md mb-6">Access advanced system controls, user management, and detailed financial reports.</p>
            <button className="px-6 py-2 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors">Open Admin Panel</button>
          </div>
          <Shield className="w-48 h-48 absolute -right-8 -bottom-8 text-white/5" />
        </div>
      )}
    </div>
  );
};

const ToggleItem: React.FC<{ icon: any; title: string; description: string; defaultChecked?: boolean }> = ({ icon: Icon, title, description, defaultChecked }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Icon className="w-4 h-4" /></div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

const ActionItem: React.FC<{ icon: any; title: string; description: string; variant?: 'danger' }> = ({ icon: Icon, title, description, variant }) => (
  <button className="w-full flex items-center justify-between hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors text-left">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}><Icon className="w-4 h-4" /></div>
      <div>
        <p className={`text-sm font-bold ${variant === 'danger' ? 'text-rose-600' : 'text-slate-900'}`}>{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300" />
  </button>
);

const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default Settings;
