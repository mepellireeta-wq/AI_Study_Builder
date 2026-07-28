import React, { useState } from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function InteractiveTimeline({ timeline, onToggleStatus }) {
  const [filter, setFilter] = useState('All');

  const filteredTimeline = timeline.filter(item => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  return (
    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 h-fit">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Calendar className="text-indigo-400 w-5 h-5" /> Interactive Timeline
        </h2>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 text-xs overflow-x-auto pb-2">
        {['All', 'Upcoming', 'In Progress', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              filter === status 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Timeline Items */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-700">
        {filteredTimeline.length === 0 ? (
          <p className="text-sm text-slate-500 pl-8">No milestones match the selected filter.</p>
        ) : (
          filteredTimeline.map((item) => (
            <div key={item.id} className="relative pl-8 group">
              <div className={`absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 border-slate-800 transition-all ${
                item.status === 'Completed' ? 'bg-emerald-400' :
                item.status === 'In Progress' ? 'bg-amber-400' : 'bg-indigo-400'
              }`} />
              
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/80">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                  <span>{item.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    item.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' :
                    item.status === 'In Progress' ? 'bg-amber-950 text-amber-400' : 'bg-indigo-950 text-indigo-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <h4 className={`font-semibold text-sm ${item.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{item.topic}</p>

                <button
                  onClick={() => onToggleStatus(item.id)}
                  className="mt-3 flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 
                  {item.status === 'Completed' ? 'Mark as Pending' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}