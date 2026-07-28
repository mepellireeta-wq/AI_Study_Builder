import React, { useState } from 'react';
import { Plus, Sliders, Trash2, Award, Sparkles, BookOpen } from 'lucide-react';

export default function TopicManager({ topics, setTopics }) {
  const [newTopicName, setNewTopicName] = useState('');
  const [newHours, setNewHours] = useState(10);
  const [newConfidence, setNewConfidence] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleConfidenceChange = (id, newConfidenceVal) => {
    setTopics(topics.map(t => t.id === id ? { ...t, confidence: Number(newConfidenceVal) } : t));
  };

  const handleHoursChange = (id, newHoursVal) => {
    setTopics(topics.map(t => t.id === id ? { ...t, target_hours: Number(newHoursVal) } : t));
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newTopic = {
      id: Date.now(),
      name: newTopicName.trim(),
      target_hours: Number(newHours),
      confidence: Number(newConfidence)
    };

    setTopics([...topics, newTopic]);
    setNewTopicName('');
    setNewHours(10);
    setNewConfidence(5);
    setShowAddForm(false);
  };

  const handleDeleteTopic = (id) => {
    setTopics(topics.filter(t => t.id !== id));
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 shadow-xl mb-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Study Topics & Confidence Manager</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Adjust target hours and confidence levels (1-10) to optimize AI schedule</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add New Topic'}</span>
        </button>
      </div>

      {/* Add Topic Collapsible Form */}
      {showAddForm && (
        <form onSubmit={handleAddTopic} className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-700 animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Create New Study Module
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Topic Name</label>
              <input
                type="text"
                placeholder="e.g. System Design"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Hours ({newHours} hrs)</label>
              <input
                type="range"
                min="1"
                max="40"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Initial Confidence ({newConfidence}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newConfidence}
                onChange={(e) => setNewConfidence(e.target.value)}
                className="w-full accent-indigo-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2 rounded-lg transition-all"
          >
            Save Subject Module
          </button>
        </form>
      )}

      {/* Grid of Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => {
          const confidencePct = (t.confidence / 10) * 100;
          let badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
          if (t.confidence >= 7) badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
          else if (t.confidence >= 4) badgeColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";

          return (
            <div 
              key={t.id} 
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-400">Target Hours: <span className="font-semibold text-white">{t.target_hours} hrs</span></p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {t.confidence}/10 Confidence
                  </span>
                  <button
                    onClick={() => handleDeleteTopic(t.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800"
                    title="Delete Topic"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Confidence Progress</span>
                  <span className="font-mono text-slate-300">{t.confidence} / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${confidencePct}%` }}
                  ></div>
                </div>
              </div>

              {/* Interactive Sliders */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Adjust Hours ({t.target_hours}h)</label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={t.target_hours}
                    onChange={(e) => handleHoursChange(t.id, e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Adjust Score ({t.confidence}/10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={t.confidence}
                    onChange={(e) => handleConfidenceChange(t.id, e.target.value)}
                    className="w-full accent-indigo-400"
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
