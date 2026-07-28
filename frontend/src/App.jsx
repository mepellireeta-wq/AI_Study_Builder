import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import TopicManager from './components/TopicManager';
import AnalyticsCharts from './components/AnalyticsCharts';
import InteractiveTimeline from './components/InteractiveTimeline';
import FocusTimer from './components/FocusTimer';
import AssignmentUploadModal from './components/AssignmentUploadModal';
import { Sparkles, RefreshCw, LayoutDashboard, Sliders, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { API } from './services/api';

const INITIAL_TOPICS = [
  { id: 1, name: "Data Structures", target_hours: 10, completed_hours: 7, confidence: 6 },
  { id: 2, name: "Machine Learning", target_hours: 15, completed_hours: 5, confidence: 4 },
  { id: 3, name: "Database Systems", target_hours: 12, completed_hours: 10, confidence: 8 },
];

const INITIAL_TIMELINE = [
  { id: 1, title: "Array & Linked List Review", date: "2026-07-28", topic: "Data Structures", status: "Completed" },
  { id: 2, title: "Regression Model Assignment", date: "2026-07-30", topic: "Machine Learning", status: "In Progress" },
  { id: 3, title: "SQL Normalization Quiz", date: "2026-08-02", topic: "Database Systems", status: "Upcoming" },
];

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'topics', 'analytics', 'focus'
  const [rebalanceNotification, setRebalanceNotification] = useState(null);
  const [isRebalancing, setIsRebalancing] = useState(false);

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('chronosense_topics');
    return saved ? JSON.parse(saved) : INITIAL_TOPICS;
  });

  const [timeline, setTimeline] = useState(() => {
    const saved = localStorage.getItem('chronosense_timeline');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('chronosense_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('chronosense_timeline', JSON.stringify(timeline));
  }, [timeline]);

  // Initial Backend Check
  useEffect(() => {
    async function checkBackend() {
      const data = await API.getTopics();
      if (data && Array.isArray(data)) {
        setApiStatus('Successfully Connected');
        setTopics(data);
      } else {
        setApiStatus('Local Mode (Offline)');
      }

      const timelineData = await API.getTimeline();
      if (timelineData && Array.isArray(timelineData)) {
        setTimeline(timelineData);
      }
    }
    checkBackend();
  }, []);

  // AI Workload Rebalancing Engine Logic
  const handleAIRebalance = async () => {
    setIsRebalancing(true);
    setRebalanceNotification("AI Analyzing subject confidence scores...");

    // Try backend rebalance endpoint first
    const backendResult = await API.rebalanceSchedule(topics);

    setTimeout(() => {
      if (backendResult && backendResult.rebalanced_topics) {
        setTopics(backendResult.rebalanced_topics);
      } else {
        // Client-side AI fallback calculation: Inverse weighting based on (11 - confidence)
        const totalHours = topics.reduce((acc, t) => acc + Number(t.target_hours || 10), 0);
        const weights = topics.map(t => (11 - Number(t.confidence || 5)));
        const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

        const updated = topics.map((t, idx) => {
          const calculatedHours = Math.round((weights[idx] / totalWeight) * totalHours);
          return {
            ...t,
            target_hours: Math.max(2, calculatedHours)
          };
        });

        setTopics(updated);
      }

      setIsRebalancing(false);
      setRebalanceNotification("⚡ AI Workload Rebalanced! Target hours optimized for low-confidence modules.");
      
      setTimeout(() => setRebalanceNotification(null), 5000);
    }, 800);
  };

  const handleToggleStatus = (id) => {
    setTimeline(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Completed' ? 'In Progress' : 'Completed';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleAddAssignment = async (newAssignment) => {
    setTimeline(prev => [newAssignment, ...prev]);
    await API.addTimelineItem(newAssignment);
  };

  const handleLogFocusSession = (topicId, hours) => {
    setTopics(prev => prev.map(t => {
      if (String(t.id) === String(topicId)) {
        const newCompleted = Math.min(t.target_hours, Number((t.completed_hours + hours).toFixed(1)));
        const updatedTopic = { ...t, completed_hours: newCompleted };
        API.updateTopic(t.id, { completed_hours: newCompleted });
        return updatedTopic;
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar 
        onOpenUpload={() => setIsModalOpen(true)} 
        apiStatus={apiStatus} 
      />

      {/* Hero Banner & AI Rebalance Trigger */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Dynamic Study Workload Rebalancer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Optimize Study Schedule with Intelligent AI
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Chronosense automatically recalculates your weekly target hours based on subject confidence scores and deadline urgencies.
            </p>
          </div>

          <button
            onClick={handleAIRebalance}
            disabled={isRebalancing}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRebalancing ? 'animate-spin' : ''}`} />
            <span>{isRebalancing ? 'Analyzing Workload...' : 'AI Rebalance Schedule'}</span>
          </button>
        </div>

        {rebalanceNotification && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{rebalanceNotification}</span>
          </div>
        )}
      </div>

      {/* Top Level Key Performance Stat Cards */}
      <StatCards topics={topics} />

      {/* Main View Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 mb-8 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
            activeTab === 'topics'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Topics & Confidence</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
            activeTab === 'analytics'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Distribution</span>
        </button>

        <button
          onClick={() => setActiveTab('focus')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
            activeTab === 'focus'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Focus & Pomodoro Timer</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TopicManager topics={topics} setTopics={setTopics} />
            <AnalyticsCharts topics={topics} />
          </div>

          <div className="space-y-8">
            <InteractiveTimeline 
              timeline={timeline} 
              onToggleStatus={handleToggleStatus} 
            />
          </div>
        </div>
      )}

      {activeTab === 'topics' && (
        <TopicManager topics={topics} setTopics={setTopics} />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsCharts topics={topics} />
      )}

      {activeTab === 'focus' && (
        <FocusTimer topics={topics} onLogSession={handleLogFocusSession} />
      )}

      {/* Assignment Syllabus Upload Modal */}
      <AssignmentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        topics={topics}
        onAddAssignment={handleAddAssignment}
      />

    </div>
  );
}