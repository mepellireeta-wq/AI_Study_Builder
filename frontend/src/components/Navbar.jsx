import React from 'react';
import { Sparkles, Bell, Upload, BookOpen, User } from 'lucide-react';

export default function Navbar({ onOpenUpload, apiStatus }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-cyan-300">
                ChronoSense
              </h1>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Builder v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Smart Study Schedule & Target Optimizer</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          {/* Backend Connection Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full glass-card border border-slate-800 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${apiStatus?.includes('Successfully') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="font-medium text-slate-400">Backend:</span>
            <span className="text-slate-200">{apiStatus || 'Checking...'}</span>
          </div>

          {/* Upload Assignment Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-cyan-500/30 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Assignment</span>
          </button>

          {/* Notifications */}
          <button className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-white leading-none">Student Portal</p>
              <p className="text-xs text-cyan-400 font-medium mt-0.5">Active Workspace</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
