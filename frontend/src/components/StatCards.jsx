import React from 'react';
import { Clock, Gauge, BookOpen, Calendar, TrendingUp } from 'lucide-react';

export default function StatCards({ topics }) {
  const totalHours = topics.reduce((acc, t) => acc + Number(t.target_hours || 0), 0);
  const avgConfidence = topics.length > 0 
    ? (topics.reduce((acc, t) => acc + Number(t.confidence || 0), 0) / topics.length).toFixed(1)
    : 0;

  const stats = [
    {
      title: "Total Target Hours",
      value: `${totalHours} hrs`,
      subtitle: "Weekly planned study duration",
      icon: Clock,
      color: "from-indigo-500 to-purple-500",
      textColor: "text-indigo-400",
      bgGlow: "shadow-indigo-500/10"
    },
    {
      title: "Avg Confidence Score",
      value: `${avgConfidence} / 10`,
      subtitle: "Subject mastery index",
      icon: Gauge,
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      bgGlow: "shadow-cyan-500/10"
    },
    {
      title: "Active Study Topics",
      value: `${topics.length} Subjects`,
      subtitle: "Enrolled modules",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      bgGlow: "shadow-emerald-500/10"
    },
    {
      title: "Next Milestone",
      value: "In 2 Days",
      subtitle: "Data Structures Mid-term",
      icon: Calendar,
      color: "from-amber-500 to-rose-500",
      textColor: "text-amber-400",
      bgGlow: "shadow-amber-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div 
            key={idx} 
            className={`glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl ${item.bgGlow} hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {item.title}
              </span>
              <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${item.textColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white tracking-tight">
                {item.value}
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3 h-3 mr-1" /> Optimal
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {item.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
