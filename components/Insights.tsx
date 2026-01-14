
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { getInventoryInsights } from '../services/gemini';
import { Sparkles, Loader2, RefreshCw, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface Props {
  state: AppState;
}

const Insights: React.FC<Props> = ({ state }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInventoryInsights(state.products, state.transactions, state.suppliers);
      setInsights(result || "No insights generated.");
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate AI insights. Please check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            AI Inventory Intelligence
          </h2>
          <p className="text-slate-500 text-sm">Powered by Gemini - Predictive analysis and stock optimization</p>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Insights</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Tips */}
        <div className="lg:col-span-1 space-y-4">
          <InsightHighlight 
            icon={TrendingUp} 
            title="Demand Forecasting" 
            description="Our AI models analyze historical transaction data to predict future stock needs."
            color="indigo"
          />
          <InsightHighlight 
            icon={AlertTriangle} 
            title="Risk Mitigation" 
            description="Identifying bottlenecks in your supply chain and items at risk of expiration."
            color="rose"
          />
          <InsightHighlight 
            icon={Lightbulb} 
            title="Order Optimization" 
            description="Automated suggestions for bulk purchases to reduce logistics costs."
            color="amber"
          />
        </div>

        {/* Main Insight Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Current Stock Analysis</h3>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="animate-pulse">Gemini is analyzing your stock movements...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            ) : insights ? (
              <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600">
                <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} className="whitespace-pre-wrap leading-relaxed" />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Click "Refresh Insights" to begin AI analysis.</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center">
            AI-generated content may contain errors. Please verify critical business decisions.
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightHighlight: React.FC<{ icon: any; title: string; description: string; color: string }> = ({ icon: Icon, title, description, color }) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600'
  };
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-100 transition-all group shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
};

export default Insights;
