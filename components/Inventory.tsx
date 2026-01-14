
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, Product, UserRole } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  FileDown,
  ChevronRight,
  ChevronLeft,
  Package,
  AlertCircle
} from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addLog: (action: string, details: string) => void;
  externalSearch?: string;
}

const Inventory: React.FC<Props> = ({ state, setState, addLog, externalSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
    };
    window.addEventListener('openInventoryModal', handleOpenModal);
    return () => window.removeEventListener('openInventoryModal', handleOpenModal);
  }, []);

  const filteredProducts = useMemo(() => {
    const activeSearch = searchTerm || externalSearch;
    return state.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
                            p.sku.toLowerCase().includes(activeSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [state.products, searchTerm, externalSearch, categoryFilter]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Quantity', 'Price', 'Cost', 'Last Updated'];
    const rows = state.products.map(p => [
      p.id, p.name, p.sku, p.quantity, p.price, p.cost, p.lastUpdated
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('EXPORT', 'Generated inventory CSV report');
  };

  const handleDelete = (id: string) => {
    const isUserAdmin = state.currentUser.role === UserRole.ADMIN;
    
    if (!isUserAdmin) {
      alert("⚠️ Access Denied: Only users with the ADMIN role can delete inventory items.");
      return;
    }

    const product = state.products.find(p => p.id === id);
    if (!product) return;

    if (window.confirm(`⚠️ DANGER: Are you sure you want to permanently remove "${product.name}" from the system? This action cannot be undone.`)) {
      setState(prev => {
        const updatedProducts = prev.products.filter(p => p.id !== id);
        return { ...prev, products: updatedProducts };
      });
      addLog('DELETE_PRODUCT', `Admin permanently removed product ${product.name} (SKU: ${product.sku})`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const categoryId = formData.get('categoryId') as string;
    const quantity = Number(formData.get('quantity'));
    const reorderLevel = Number(formData.get('reorderLevel'));
    const price = Number(formData.get('price'));
    const cost = Number(formData.get('cost'));

    if (editingProduct) {
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => 
          p.id === editingProduct.id 
            ? { ...p, name, sku, categoryId, quantity, reorderLevel, price, cost, lastUpdated: new Date().toISOString() } 
            : p
        )
      }));
      addLog('UPDATE_PRODUCT', `Updated product details for ${name} (${sku})`);
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        sku,
        categoryId,
        supplierId: state.suppliers[0]?.id || 's1',
        quantity,
        reorderLevel,
        price,
        cost,
        unit: 'pcs',
        batchNumber: 'B-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000),
        lastUpdated: new Date().toISOString()
      };
      
      setState(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));
      addLog('CREATE_PRODUCT', `Added new product ${name} to inventory`);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Product Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage, track, and optimize your asset levels across all categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter by product name, SKU, or batch..." 
            value={searchTerm || externalSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 rounded-2xl text-sm outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none w-full md:w-56 pl-5 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Inventory Groups</option>
              {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Filter className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Master Product Info</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Inventory Level</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Health Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? filteredProducts.map((p) => {
                const category = state.categories.find(c => c.id === p.categoryId);
                const isLow = p.quantity <= p.reorderLevel;
                const isOut = p.quantity === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isOut ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-black tracking-wider mt-0.5">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/50">
                        {category?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-baseline justify-between">
                          <span className={`text-sm font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                            {p.quantity} <span className="text-[10px] font-bold text-slate-400 uppercase">{p.unit}</span>
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isOut ? 'bg-rose-500 shadow-lg shadow-rose-200' : isLow ? 'bg-amber-500 shadow-lg shadow-amber-200' : 'bg-indigo-500 shadow-lg shadow-indigo-200'}`}
                            style={{ width: `${Math.min((p.quantity / (p.reorderLevel * 2.5)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">${p.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Asset Cost: ${p.cost.toFixed(2)}</p>
                    </td>
                    <td className="px-8 py-6">
                      {isOut ? (
                        <div className="flex items-center gap-2 text-rose-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Out of Stock</span>
                        </div>
                      ) : isLow ? (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Reorder Required</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Stable Supply</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Search className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-bold">No inventory matches your filters</p>
                      <button onClick={() => {setSearchTerm(''); setCategoryFilter('all')}} className="mt-2 text-xs text-indigo-600 font-bold hover:underline underline-offset-4">Clear all search parameters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold">
            Displaying <span className="text-slate-900">{filteredProducts.length}</span> of <span className="text-slate-900">{state.products.length}</span> Master Records
          </p>
          <div className="flex items-center gap-3">
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingProduct ? 'Update Asset' : 'New Inventory Record'}</h3>
                  <p className="text-slate-500 text-xs font-medium">Please fill in the technical specifications for the product.</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all text-2xl font-light">×</button>
            </div>
            <form className="p-8 grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                <input name="name" type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="e.g. Enterprise Server R740" defaultValue={editingProduct?.name} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Universal SKU</label>
                <input name="sku" type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="NX-8820-A" defaultValue={editingProduct?.sku} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Inventory Group</label>
                <select name="categoryId" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm cursor-pointer" defaultValue={editingProduct?.categoryId}>
                  {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
                <input name="quantity" type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" defaultValue={editingProduct?.quantity ?? 0} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reorder Point</label>
                <input name="reorderLevel" type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" defaultValue={editingProduct?.reorderLevel ?? 10} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">MSRP / Price ($)</label>
                <input name="price" type="number" step="0.01" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" defaultValue={editingProduct?.price ?? 0} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Acquisition Cost ($)</label>
                <input name="cost" type="number" step="0.01" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" defaultValue={editingProduct?.cost ?? 0} />
              </div>
              
              <div className="col-span-2 pt-6 flex gap-4 justify-end">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="px-8 py-3 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all">Discard Changes</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">
                  {editingProduct ? 'Confirm Update' : 'Generate Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
