
import React, { useState, useMemo } from 'react';
import { AppState, TransactionType, Transaction, Product } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  Search, 
  Download,
  Calendar,
  Plus,
  Box,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addLog: (action: string, details: string) => void;
  externalSearch?: string;
}

const Transactions: React.FC<Props> = ({ state, setState, addLog, externalSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    const activeSearch = searchTerm || externalSearch;
    return state.transactions
      .filter(tx => {
        const product = state.products.find(p => p.id === tx.productId);
        return product?.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
               product?.sku.toLowerCase().includes(activeSearch.toLowerCase()) ||
               tx.note.toLowerCase().includes(activeSearch.toLowerCase());
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, state.products, searchTerm, externalSearch]);

  const handleExport = () => {
    const headers = ['Date', 'Product', 'SKU', 'Type', 'Quantity', 'Note'];
    const rows = filteredTransactions.map(tx => {
      const p = state.products.find(prod => prod.id === tx.productId);
      return [new Date(tx.date).toLocaleString(), p?.name || '?', p?.sku || '?', tx.type, tx.quantity, tx.note];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `transaction_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('EXPORT', 'Generated transaction history report');
  };

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const type = formData.get('type') as TransactionType;
    const quantity = Number(formData.get('quantity'));
    const note = formData.get('note') as string;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      userId: state.currentUser.id,
      type,
      quantity,
      date: new Date().toISOString(),
      note
    };

    setState(prev => {
      const updatedProducts = prev.products.map(p => {
        if (p.id === productId) {
          let newQty = p.quantity;
          if (type === TransactionType.INBOUND) newQty += quantity;
          else if (type === TransactionType.OUTBOUND) newQty -= quantity;
          else if (type === TransactionType.ADJUSTMENT) newQty = quantity; // Adjustment sets directly
          return { ...p, quantity: newQty, lastUpdated: new Date().toISOString() };
        }
        return p;
      });

      return {
        ...prev,
        products: updatedProducts,
        transactions: [newTx, ...prev.transactions]
      };
    });

    addLog('TRANSACTION', `Manually added ${type} for ${state.products.find(p => p.id === productId)?.name}`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stock Movements</h2>
          <p className="text-slate-500 text-sm">Historical record of all inbound and outbound items</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
            <ArrowUpRight className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black text-emerald-700 uppercase tracking-[0.2em] mb-1">Stock Inbound</p>
            <p className="text-2xl font-black text-emerald-900">
              {state.transactions.filter(t => t.type === TransactionType.INBOUND).reduce((acc, t) => acc + t.quantity, 0).toLocaleString()} <span className="text-sm font-bold text-emerald-600/60 uppercase">Units</span>
            </p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
            <ArrowDownRight className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black text-rose-700 uppercase tracking-[0.2em] mb-1">Stock Outbound</p>
            <p className="text-2xl font-black text-rose-900">
              {state.transactions.filter(t => t.type === TransactionType.OUTBOUND).reduce((acc, t) => acc + t.quantity, 0).toLocaleString()} <span className="text-sm font-bold text-rose-600/60 uppercase">Units</span>
            </p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
            <RefreshCcw className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-black text-indigo-700 uppercase tracking-[0.2em] mb-1">Manual Adjustments</p>
            <p className="text-2xl font-black text-indigo-900">
              {state.transactions.filter(t => t.type === TransactionType.ADJUSTMENT).length} <span className="text-sm font-bold text-indigo-600/60 uppercase">Records</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-6 bg-slate-50/20">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter transactions by product name, SKU, or user..." 
              value={searchTerm || externalSearch}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 rounded-2xl text-sm outline-none transition-all shadow-inner"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 text-slate-500 shadow-sm transition-all">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Execution Date</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Inventory Item</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Movement Type</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Volume</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">System User</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Execution Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => {
                const product = state.products.find(p => p.id === tx.productId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[13px] text-slate-500 font-bold whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()} <span className="text-slate-300 font-medium ml-1">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900 tracking-tight">{product?.name || 'Deleted Asset'}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-wider">{product?.sku || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        tx.type === TransactionType.INBOUND ? 'bg-emerald-100 text-emerald-700' : 
                        tx.type === TransactionType.OUTBOUND ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-sm font-black ${
                        tx.type === TransactionType.INBOUND ? 'text-emerald-600' : 
                        tx.type === TransactionType.OUTBOUND ? 'text-rose-600' : 'text-indigo-600'
                      }`}>
                        {tx.type === TransactionType.OUTBOUND ? '-' : '+'}{tx.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200" />
                        <span className="text-xs font-bold text-slate-700">{state.currentUser.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 italic max-w-xs truncate">
                      {tx.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold">
            Audit trailing <span className="text-slate-900">{filteredTransactions.length}</span> historical movements
          </p>
          <div className="flex items-center gap-3">
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 transition-all" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 transition-all" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Record Movement</h3>
                  <p className="text-slate-500 text-xs font-medium">Update stock levels manually with an audit note.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all text-2xl font-light">×</button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleAddTransaction}>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Asset</label>
                <select name="productId" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm">
                  {state.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Movement Type</label>
                  <select name="type" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm">
                    <option value={TransactionType.INBOUND}>Stock Purchase (In)</option>
                    <option value={TransactionType.OUTBOUND}>Customer Sale (Out)</option>
                    <option value={TransactionType.ADJUSTMENT}>Audit Adjustment</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unit Volume</label>
                  <input name="quantity" type="number" required min="1" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="Qty" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Verification Note</label>
                <textarea name="note" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm min-h-[100px]" placeholder="Reason for movement..."></textarea>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">Commit Movement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
