import React from 'react';
import { User, Monitor, Server, Cpu, Eye, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ArchitectureFlow() {
  return (
    <div className="mb-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            System Flow Architecture (Single Unified Web Application)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
          STUDENT ➔ FRONTEND ➔ BACKEND ➔ (ML & CV ENGINES) ➔ RESULTS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center text-xs">
        
        {/* Step 1: Student */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center shadow-md hover:border-cyan-500/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
            <User className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-200">1. Student</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Inputs & Uploads</span>
        </div>

        {/* Step 2: Frontend */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center shadow-md hover:border-cyan-500/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Monitor className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-200">2. Single Frontend</span>
          <span className="text-[10px] text-slate-400 mt-0.5">React + Vite UI</span>
        </div>

        {/* Step 3: Backend API */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center shadow-md hover:border-cyan-500/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
            <Server className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-200">3. Unified Backend</span>
          <span className="text-[10px] text-slate-400 mt-0.5">FastAPI Router</span>
        </div>

        {/* Step 4: ML & CV Engines */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 flex flex-col items-center shadow-md">
          <div className="flex space-x-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400" title="ML Engine">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400" title="CV Engine">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <span className="font-bold text-slate-200">4. ML & CV Engines</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Prediction & AI OCR</span>
        </div>

        {/* Step 5: Realtime Results */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col items-center shadow-md">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-emerald-300">5. Dynamic Results</span>
          <span className="text-[10px] text-emerald-400 mt-0.5">Live UI Rebalance</span>
        </div>

      </div>
    </div>
  );
}
