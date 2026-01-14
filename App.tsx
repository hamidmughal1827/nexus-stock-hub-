
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Truck, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Plus, 
  Box,
  BrainCircuit,
  Lock,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { UserRole, AppState, TransactionType, AuditLog, Product, Transaction, Supplier, Category } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Suppliers from './components/Suppliers';
import Insights from './components/Insights';
import SettingsView from './components/Settings';

// Mock Initial Data
const INITIAL_STATE: AppState = {
  currentUser: {
    id: 'u1',
    name: 'Sarah Connor',
    email: 'admin@nexusstock.com',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/seed/sarah/200/200'
  },
  categories: [
    { id: 'c1', name: 'Electronics' },
    { id: 'c2', name: 'Office Supplies' },
    { id: 'c3', name: 'Perishables' }
  ],
  suppliers: [
    { id: 's1', name: 'Global Tech Inc', contactPerson: 'John Smith', email: 'sales@globaltech.com', phone: '+1-555-0192' },
    { id: 's2', name: 'Office Depot', contactPerson: 'Jane Doe', email: 'orders@officedepot.com', phone: '+1-555-0193' }
  ],
  products: [
    { id: 'p1', sku: 'LAP-001', name: 'MacBook Pro M3', categoryId: 'c1', supplierId: 's1', price: 2499, cost: 1800, quantity: 12, reorderLevel: 5, unit: 'pcs', batchNumber: 'B-2024-001', lastUpdated: new Date().toISOString() },
    { id: 'p2', sku: 'PEN-022', name: 'Blue Ink Pen Box', categoryId: 'c2', supplierId: 's2', price: 15, cost: 5, quantity: 150, reorderLevel: 200, unit: 'boxes', batchNumber: 'B-2023-99', lastUpdated: new Date().toISOString() },
    { id: 'p3', sku: 'MLK-001', name: 'Almond Milk 1L', categoryId: 'c3', supplierId: 's2', price: 4.5, cost: 2.2, quantity: 45, reorderLevel: 50, unit: 'cartons', batchNumber: 'EXP-MAR-24', expiryDate: '2024-03-25', lastUpdated: new Date().toISOString() }
  ],
  transactions: [
    { id: 't1', productId: 'p1', userId: 'u1', type: TransactionType.INBOUND, quantity: 5, date: '2024-01-10T10:00:00Z', note: 'Restock order' },
    { id: 't2', productId: 'p2', userId: 'u1', type: TransactionType.OUTBOUND, quantity: 20, date: '2024-01-12T14:30:00Z', note: 'Customer Sale' }
  ],
  logs: []
};

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
        <div className="p-8 pb-0 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6">
            <Box className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Nexus Stock</h1>
          <p className="text-slate-500 text-sm">Welcome back. Please enter your credentials to manage your inventory.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  defaultValue="admin@nexusstock.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Sign In to Dashboard
            <ShieldCheck className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
              Remember me
            </label>
            <a href="#" className="hover:text-indigo-600">Forgot password?</a>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Powered by Nexus Stock Enterprise v2.4
          </p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nexus_stock_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nexus_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'transactions' | 'suppliers' | 'insights' | 'settings'>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('nexus_stock_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('nexus_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: state.currentUser.id,
      action,
      details
    };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 100) }));
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'suppliers', icon: Truck, label: 'Suppliers' },
    { id: 'insights', icon: BrainCircuit, label: 'AI Insights' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ] as const;

  const lowStockCount = useMemo(() => 
    state.products.filter(p => p.quantity <= p.reorderLevel).length
  , [state.products]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Box className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Nexus Stock</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl mb-2 border border-slate-700/50">
            <img src={state.currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Avatar" />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold truncate leading-tight">{state.currentUser.name}</p>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{state.currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-all border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-slate-200 bg-white/60 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 text-slate-500">
            <div className="relative md:block hidden">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search inventory, SKUs, or logs..." 
                className="pl-12 pr-6 py-2.5 bg-slate-100/50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 rounded-2xl text-sm outline-none transition-all w-80 shadow-inner"
              />
            </div>
            <span className="text-slate-300 md:block hidden mx-2">/</span>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="text-slate-900 capitalize tracking-tight">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all active:scale-95">
              <Bell className="w-5 h-5" />
              {lowStockCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {lowStockCount}
                </span>
              )}
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button 
              onClick={() => { setActiveTab('inventory'); window.dispatchEvent(new CustomEvent('openInventoryModal')); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Inventory Add</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard state={state} onNavigate={setActiveTab} />}
            {activeTab === 'inventory' && <Inventory state={state} setState={setState} addLog={addLog} externalSearch={globalSearch} />}
            {activeTab === 'transactions' && <Transactions state={state} setState={setState} addLog={addLog} externalSearch={globalSearch} />}
            {activeTab === 'suppliers' && <Suppliers state={state} setState={setState} addLog={addLog} />}
            {activeTab === 'insights' && <Insights state={state} />}
            {activeTab === 'settings' && <SettingsView state={state} setState={setState} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
