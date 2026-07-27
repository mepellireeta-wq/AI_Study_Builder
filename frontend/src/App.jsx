import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InteractiveTimeline from './components/InteractiveTimeline';
import AssignmentUploadModal from './components/AssignmentUploadModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import { API } from './services/api';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  const [topics] = useState([
    { id: 1, name: "Data Structures", target_hours: 10, completed_hours: 7, confidence: 6 },
    { id: 2, name: "Machine Learning", target_hours: 15, completed_hours: 5, confidence: 4 },
    { id: 3, name: "Database Systems", target_hours: 12, completed_hours: 10, confidence: 8 },
  ]);

  const [timeline, setTimeline] = useState([
    { id: 1, title: "Array & Linked List Review", date: "2026-07-28", topic: "Data Structures", status: "Completed" },
    { id: 2, title: "Regression Model Assignment", date: "2026-07-30", topic: "Machine Learning", status: "In Progress" },
    { id: 3, title: "SQL Normalization Quiz", date: "2026-08-02", topic: "Database Systems", status: "Upcoming" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      const data = await API.getTopics();
      if (data) {
        setApiStatus('Successfully Connected');
      } else {
        setApiStatus('Local Mode (Offline)');
      }
    }
    checkBackend();
  }, []);

  const handleToggleStatus = (id) => {
    setTimeline(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Completed' ? 'In Progress' : 'Completed';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleAddAssignment = (newAssignment) => {
    setTimeline([newAssignment, ...timeline]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      <Navbar 
        onOpenUpload={() => setIsModalOpen(true)} 
        apiStatus={apiStatus} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <BookOpen className="text-indigo-400 w-5 h-5" /> Active Topics
              </div>
              <p className="text-2xl font-bold mt-2">{topics.length}</p>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Clock className="text-emerald-400 w-5 h-5" /> Target Hours
              </div>
              <p className="text-2xl font-bold mt-2">
                {topics.reduce((acc, t) => acc + t.target_hours, 0)} hrs
              </p>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <AlertCircle className="text-amber-400 w-5 h-5" /> Avg Confidence
              </div>
              <p className="text-2xl font-bold mt-2">
                {(topics.reduce((acc, t) => acc + t.confidence, 0) / topics.length).toFixed(1)} / 10
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-200">Study Topics Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map(t => (
                <div key={t.id} className="p-4 bg-slate-900/60 rounded-lg border border-slate-700/80">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-indigo-300 text-sm">{t.name}</h3>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                      Conf: {t.confidence}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Progress: {t.completed_hours} / {t.target_hours} hrs
                  </p>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(t.completed_hours / t.target_hours) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-200">Target vs Completed Hours</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
                  <Bar dataKey="target_hours" fill="#6366f1" name="Target Hours" />
                  <Bar dataKey="completed_hours" fill="#10b981" name="Completed Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <InteractiveTimeline 
          timeline={timeline} 
          onToggleStatus={handleToggleStatus} 
        />
      </div>

      <AssignmentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        topics={topics}
        onAddAssignment={handleAddAssignment}
      />
    </div>
  );
}