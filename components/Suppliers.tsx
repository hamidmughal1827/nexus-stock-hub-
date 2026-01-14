
import React, { useState } from 'react';
import { AppState, Supplier } from '../types';
import { Mail, Phone, User as UserIcon, MoreHorizontal, Plus, Search, Truck, MapPin } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addLog: (action: string, details: string) => void;
}

const Suppliers: React.FC<Props> = ({ state, setState, addLog }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSupplier: Supplier = {
      id: 's' + (state.suppliers.length + 1),
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string
    };

    setState(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, newSupplier]
    }));
    addLog('SUPPLIER', `Onboarded new partner: ${newSupplier.name}`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Partner Suppliers</h2>
          <p className="text-slate-500 text-sm">Manage relationships and procurement contacts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {state.suppliers.map(s => (
          <div key={s.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500">
            <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-500">
                  <span className="text-xl font-black">{s.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{s.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Vendor ID: {s.id}</p>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex items-center gap-4 group/item">
                <div className="p-2 bg-slate-50 rounded-xl group-hover/item:bg-indigo-50 transition-colors">
                  <UserIcon className="w-4 h-4 text-slate-400 group-hover/item:text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Point of Contact</p>
                  <span className="text-sm text-slate-700 font-bold">{s.contactPerson}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 group/item">
                <div className="p-2 bg-slate-50 rounded-xl group-hover/item:bg-indigo-50 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400 group-hover/item:text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Corporate Email</p>
                  <a href={`mailto:${s.email}`} className="text-sm text-slate-700 font-bold hover:text-indigo-600 transition-colors">{s.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-4 group/item">
                <div className="p-2 bg-slate-50 rounded-xl group-hover/item:bg-indigo-50 transition-colors">
                  <Phone className="w-4 h-4 text-slate-400 group-hover/item:text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Support Phone</p>
                  <span className="text-sm text-slate-700 font-bold">{s.phone}</span>
                </div>
              </div>
            </div>
            <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Supply</span>
              </div>
              <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-600 transition-all">View Catalog</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Onboard Partner</h3>
                  <p className="text-slate-500 text-xs font-medium">Link a new supply source to your procurement hub.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all text-2xl font-light">×</button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleAddSupplier}>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company Entity Name</label>
                <input name="name" type="text" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="e.g. Acme Logistics Core" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Key Account Manager</label>
                <input name="contactPerson" type="text" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="e.g. Robert Drake" />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Email</label>
                  <input name="email" type="email" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="procurement@partner.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact Line</label>
                  <input name="phone" type="tel" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="+1-555-0000" />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">Establish Partnership</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
