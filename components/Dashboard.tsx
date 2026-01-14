
import React, { useMemo } from 'react';
import { AppState, TransactionType } from '../types';
import { 
  Package, 
  TrendingUp, 
  AlertCircle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  state: AppState;
  onNavigate: (tab: any) => void;
}

const Dashboard: React.FC<Props> = ({ state, onNavigate }) => {
  const stats = useMemo(() => {
    const totalValue = state.products.reduce((acc, p) => acc + (p.quantity * p.price), 0);
    const lowStock = state.products.filter(p => p.quantity <= p.reorderLevel).length;
    const totalItems = state.products.reduce((acc, p) => acc + p.quantity, 0);
    const monthlySales = state.transactions
      .filter(t => t.type === TransactionType.OUTBOUND)
      .reduce((acc, t) => acc + t.quantity, 0);

    return { totalValue, lowStock, totalItems, monthlySales };
  }, [state]);

  const categoryData = useMemo(() => {
    return state.categories.map(cat => ({
      name: cat.name,
      value: state.products.filter(p => p.categoryId === cat.id).length
    }));
  }, [state]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const recentTransactions = state.transactions.slice(0, 5).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Inventory Value" 
          value={`$${stats.totalValue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+12.5%" 
          color="indigo" 
        />
        <StatCard 
          label="Items in Stock" 
          value={stats.totalItems.toLocaleString()} 
          icon={Package} 
          trend="+3%" 
          color="emerald" 
        />
        <StatCard 
          label="Low Stock Alerts" 
          value={stats.lowStock.toString()} 
          icon={AlertCircle} 
          trend="-2" 
          color="rose" 
          isAlert={stats.lowStock > 0}
        />
        <StatCard 
          label="Monthly Outbound" 
          value={stats.monthlySales.toLocaleString()} 
          icon={TrendingUp} 
          trend="+8.2%" 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Inventory Distribution</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-2 py-1 outline-none text-slate-500 font-medium">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">By Category</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-slate-600 font-medium">{entry.name}</span>
                </div>
                <span className="text-sm text-slate-400">{entry.value} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
            <button onClick={() => onNavigate('transactions')} className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTransactions.map((tx) => {
              const product = state.products.find(p => p.id === tx.productId);
              return (
                <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === TransactionType.INBOUND ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.type === TransactionType.INBOUND ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.date).toLocaleDateString()} • {tx.note}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      tx.type === TransactionType.INBOUND ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === TransactionType.INBOUND ? '+' : '-'}{tx.quantity}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{tx.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Low Stock Monitor</h3>
            <button onClick={() => onNavigate('inventory')} className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold hover:bg-rose-200 transition-colors">{stats.lowStock} Critical</button>
          </div>
          <div className="p-6 space-y-4">
            {state.products.filter(p => p.quantity <= p.reorderLevel).slice(0, 5).map(p => (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{p.name}</span>
                  <span className="text-slate-500 font-medium">{p.quantity} / {p.reorderLevel} {p.unit}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${p.quantity === 0 ? 'bg-rose-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min((p.quantity / (p.reorderLevel || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.lowStock === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Package className="w-12 h-12 mb-2 opacity-20" />
                <p>All stock levels healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: any; trend: string; color: string; isAlert?: boolean }> = ({ label, value, icon: Icon, trend, color, isAlert }) => {
  const colorMap: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className={`p-6 bg-white rounded-2xl border ${isAlert ? 'border-rose-200 ring-2 ring-rose-50' : 'border-slate-200'} shadow-sm group hover:border-indigo-200 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
      </div>
    </div>
  );
};

export default Dashboard;
